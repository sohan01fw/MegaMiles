"""
config/urls.py
--------------
Root URL configuration. All app routes are namespaced under /api/v1/.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin (keep for internal use)
    path("admin/", admin.site.urls),

    # API v1 – all feature routers are included here
    path("api/v1/", include("config.api_router")),
]
