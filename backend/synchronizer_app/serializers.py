from rest_framework import serializers

from .models import Listener, Room


class ListenerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listener
        fields = ["listener_id", "joined_at", "last_ping"]
        read_only_fields = ["joined_at", "last_ping"]


class RoomSerializer(serializers.ModelSerializer):
    listener_count = serializers.SerializerMethodField()
    listeners = ListenerSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = "__all__"

    def get_listener_count(self, obj):
        return obj.listeners.count()
