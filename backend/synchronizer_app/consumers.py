import json
from channels.generic.websocket import AsyncWebsocketConsumer


class SyncConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]

        self.room_group = f"room_{self.room_code}"

        await self.channel_layer.group_add(
            self.room_group,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group,
            self.channel_name,
        )

    async def receive(self, text_data):

        data = json.loads(text_data)

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
