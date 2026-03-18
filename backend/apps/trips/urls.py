from django.urls import path
from apps.trips.api.views import TripPlanView

app_name = "trips"

urlpatterns = [
    path('geocode/autocomplete/', TripPlanView.as_view(), name='geocode-autocomplete'),
    path('plan/', TripPlanView.as_view(), name='trip-plan'),
]
