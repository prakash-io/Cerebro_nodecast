from django.contrib import admin
from .models import Room, Listener


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = (
        "room_code",
        "broadcaster",
        "listener_count",
        "media_mode",
        "is_playing",
        "created_at",
    )


@admin.register(Listener)
class ListenerAdmin(admin.ModelAdmin):

    list_display = (
        "listener_id",
        "room",
        "joined_at",
        "last_ping",
    )
