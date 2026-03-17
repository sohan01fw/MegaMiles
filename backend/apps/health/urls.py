"""
apps/health/urls.py
-------------------
URL patterns for the health app. Mounted at /api/v1/health/ by api_router.
"""
from django.urls import path
from . import views

app_name = "health"

urlpatterns = [
    path("ping/",  views.ping,        name="ping"),
    path("hello/", views.hello_world, name="hello"),
]
