"""
apps/trips/api/serializers.py
------------------------------
Validates and normalises the trip-planning request payload coming from the
frontend. Keeping validation here makes the view thin and the rules reusable.
"""
from rest_framework import serializers


class CoordinateSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()


class TripPlanRequestSerializer(serializers.Serializer):
    current_location = CoordinateSerializer()
    pickup           = CoordinateSerializer()
    dropoff          = CoordinateSerializer()
    cycle_used       = serializers.FloatField(default=0.0, min_value=0.0, max_value=70.0)
