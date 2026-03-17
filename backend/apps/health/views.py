"""
apps/health/views.py
--------------------
Simple health / ping endpoints – good for smoke-testing the server is up.
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import django
from django.conf import settings


@api_view(["GET"])
def ping(request):
    """
    GET /api/v1/health/ping
    Returns a simple pong response – use in Postman to verify the server is alive.
    """
    return Response(
        {
            "status": "ok",
            "message": "pong 🏓",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def hello_world(request):
    """
    GET /api/v1/health/hello
    The classic Hello World response.
    """
    return Response(
        {
            "status": "ok",
            "message": "Hello from MegaMiles API 🚀",
            "django_version": django.get_version(),
            "debug": settings.DEBUG,
        },
        status=status.HTTP_200_OK,
    )
