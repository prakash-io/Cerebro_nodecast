from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def home(request):
    return JsonResponse({"status": "backend running"})


urlpatterns = [

    path("", home),

    path("admin/", admin.site.urls),

    path("api/", include("synchronizer_app.urls")),

]
