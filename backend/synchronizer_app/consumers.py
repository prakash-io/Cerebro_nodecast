import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class SyncConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        self.room_group = f"room_{self.room_code}"
        self.is_broadcaster = False
        
        # Last sync time for throttling
        self.last_sync_time = 0

        await self.channel_layer.group_add(
            self.room_group,
            self.channel_name,
        )
        await self.accept()

        # Increment listener count
        count = await self.modify_listener_count(1)
        await self.channel_layer.group_send(
            self.room_group,
            {
                "type": "sync_message",
                "message": {
                    "event": "listener_count",
                    "data": {"listener_count": count}
                },
            },
        )

    async def disconnect(self, close_code):
        # Decrement listener count
        count = await self.modify_listener_count(-1)
        await self.channel_layer.group_send(
            self.room_group,
            {
                "type": "sync_message",
                "message": {
                    "event": "listener_count",
                    "data": {"listener_count": count}
                },
            },
        )

        # If the broadcaster leaves, delete the room so the code can be reused
        if self.is_broadcaster:
            await self.delete_room()
            await self.channel_layer.group_send(
                self.room_group,
                {
                    "type": "sync_message",
                    "message": {
                        "event": "room_closed",
                        "data": {"reason": "Broadcaster left the room."}
                    },
                },
            )

        await self.channel_layer.group_discard(
            self.room_group,
            self.channel_name,
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        event_type = data.get("type", data.get("event"))

        # Track broadcaster identity
        if event_type == "identify" and data.get("role") == "broadcaster":
            self.is_broadcaster = True
            return

        # Prevent spam: throttle sync_state to once every 2 seconds
        # Other critical events (play, pause, webrtc, load_video, broadcast_message) bypass throttling.
        if event_type == "sync_state":
            now = time.time()
            if now - self.last_sync_time < 2.0:
                return
            self.last_sync_time = now

        # Broadcast the message to the group
        await self.channel_layer.group_send(
            self.room_group,
            {
                "type": "sync_message",
                "message": data,
            },
        )

    async def sync_message(self, event):
        await self.send(
            text_data=json.dumps(event["message"])
        )

    @database_sync_to_async
    def modify_listener_count(self, delta):
        from .models import Room
        try:
            room = Room.objects.get(room_code=self.room_code)
            room.listener_count = max(0, room.listener_count + delta)
            room.save(update_fields=['listener_count'])
            return room.listener_count
        except Room.DoesNotExist:
            return 0

    @database_sync_to_async
    def delete_room(self):
        from .models import Room
        Room.objects.filter(room_code=self.room_code).delete()

