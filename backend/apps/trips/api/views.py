"""
apps/trips/api/views.py
------------------------
Trip-planning endpoint. This view is intentionally thin: it validates the
request with a serializer, delegates all heavy lifting to the service layer,
and maps any service errors to appropriate HTTP responses.
"""
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response

from .serializers import TripPlanRequestSerializer
from .services.routing import get_route, RoutingError
from .services.hos import build_daily_logs


class TripPlanView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1. Validate & deserialise input
        serializer = TripPlanRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data        = serializer.validated_data
        cycle_used  = data["cycle_used"]
        current     = data["current_location"]
        pickup      = data["pickup"]
        dropoff     = data["dropoff"]

        # 2. Fetch route from ORS
        try:
            route = get_route(current, pickup, dropoff)
        except EnvironmentError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except RoutingError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Build HOS daily log
        hos = build_daily_logs(
            driving_hours=route["driving_hours"],
            cycle_used=cycle_used,
        )

        # 4. Compose and return the full trip plan
        plan = {
            "summary": {
                "total_km":               route["total_km"],
                "driving_hours":          route["driving_hours"],
                "estimated_days":         hos["estimated_days"],
                "cycle_remaining_after":  hos["cycle_remaining_after"],
                "pickup_coord":           {"lat": pickup["lat"],  "lng": pickup["lng"]},
                "dropoff_coord":          {"lat": dropoff["lat"], "lng": dropoff["lng"]},
            },
            "daily_logs":    hos["logs"],
            "route_geometry": route["geometry"],
        }

        return Response(plan, status=status.HTTP_200_OK)
