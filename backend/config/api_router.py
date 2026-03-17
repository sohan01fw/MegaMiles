"""
config/api_router.py
--------------------
Central router that assembles all app-level URL configs under /api/v1/.
Add new apps here as the project grows.
"""
from django.urls import path, include

urlpatterns = [
    # Health / ping – useful for uptime checks and Postman smoke tests
    path("health/", include("apps.health.urls", namespace="health")),

    # Users – authentication, profile
    # path("users/",  include("apps.users.urls",  namespace="users")),

    # Trips – core business domain
    # path("trips/",  include("apps.trips.urls",  namespace="trips")),
]
