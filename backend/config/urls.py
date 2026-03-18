"""
config/urls.py
--------------
Root URL configuration. All app routes are namespaced under /api/v1/.
"""
from django.urls import path, include

urlpatterns = [
    # API v1 – all feature routers are included here
    path("api/v1/", include("config.api_router")),
]
