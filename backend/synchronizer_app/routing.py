from django.urls import path
from .consumers import SyncConsumer

websocket_urlpatterns = [

    path("ws/sync/<str:room_code>/", SyncConsumer.as_asgi()),

]
