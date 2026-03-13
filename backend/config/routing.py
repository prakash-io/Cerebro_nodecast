from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from synchronizer_app.routing import websocket_urlpatterns


application = ProtocolTypeRouter({

    "http": get_asgi_application(),

    "websocket": URLRouter(websocket_urlpatterns),

})
