from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Listener


@api_view(["POST"])
def create_room(request):

    room_code = request.data.get("room_code")
    video_url = request.data.get("video_url", "")

    if not room_code:
        return Response({"error": "Room code required"}, status=400)

    room, created = Room.objects.get_or_create(
        room_code=room_code,
        defaults={"video_url": video_url}
    )

    return Response({
        "room_code": room.room_code,
        "video_url": room.video_url
    })


@api_view(["POST"])
def join_room(request):

    room_code = request.data.get("room_code")

    if not room_code:
        return Response({"error": "Room code required"}, status=400)

    try:
        room = Room.objects.get(room_code=room_code)

    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    listener = Listener.objects.create(room=room)

    return Response({
        "room_code": room.room_code,
        "listener_id": str(listener.listener_id)
    })


@api_view(["GET"])
def get_room_state(request, room_code):

    try:
        room = Room.objects.get(room_code=room_code)

    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    listeners = room.listeners.all()

    return Response({
        "room_code": room.room_code,
        "video_url": room.video_url,
        "playback_time": room.playback_time,
        "is_playing": room.is_playing,
        "listener_count": listeners.count()
    })
@api_view(["POST"])
def join_room(request):

    room_code = request.data.get("room_code")

    if not room_code:
        return Response({"error": "Room code required"}, status=400)

    try:
        room = Room.objects.get(room_code=room_code)
    except Room.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    listener = Listener.objects.create(room=room)

    return Response({
        "room_code": room.room_code,
        "listener_id": str(listener.listener_id)
    })
