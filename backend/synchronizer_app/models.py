from django.db import models
import uuid


class Room(models.Model):

    room_code = models.CharField(max_length=10, unique=True)
    broadcaster = models.CharField(max_length=100)
    video_url = models.TextField(blank=True)
    playback_time = models.FloatField(default=0)
    is_playing = models.BooleanField(default=False)
    listener_count = models.IntegerField(default=0)
    latest_message = models.CharField(max_length=280, blank=True, default="")
    media_mode = models.CharField(max_length=32, blank=True, default="video_url")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room_code


class Listener(models.Model):

    listener_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="listeners")

    joined_at = models.DateTimeField(auto_now_add=True)

    last_ping = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.listener_id)
