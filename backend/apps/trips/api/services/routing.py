"""
apps/trips/api/services/routing.py
------------------------------------
Handles all communication with the OpenRouteService (ORS) Directions API.
Returns structured route data or raises an exception the view can catch.
"""
import os
import requests

# Speed-correction factor applied to ORS durations to account for real-world
# trucking conditions (traffic, loading/unloading waits, etc.)
SPEED_CORRECTION_FACTOR = 1.6

ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-hgv"


class RoutingError(Exception):
    """Raised when the ORS call fails or returns an unusable response."""
    pass


def get_route(current: dict, pickup: dict, dropoff: dict) -> dict:
    """
    Call ORS and return a normalised route dict:
        {
            "total_km":       float,
            "driving_hours":  float,   # already correction-factor adjusted
            "geometry":       str,     # encoded polyline from ORS
        }

    Raises:
        RoutingError – for any ORS-related failure (connection, bad status, etc.)
        EnvironmentError – when OPENROUTE_API_KEY is absent
    """
    api_key = os.environ.get("OPENROUTE_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENROUTE_API_KEY is not configured in the backend environment.")

    coordinates = [
        [current["lng"], current["lat"]],
        [pickup["lng"],  pickup["lat"]],
        [dropoff["lng"], dropoff["lat"]],
    ]

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(
            ORS_BASE_URL,
            json={"coordinates": coordinates},
            headers=headers,
            timeout=15,
        )
    except requests.exceptions.Timeout:
        raise RoutingError("Routing service timed out. Please try again.")
    except requests.exceptions.ConnectionError as exc:
        raise RoutingError(f"Could not reach the routing service: {exc}")

    if not resp.ok:
        _raise_ors_error(resp)

    try:
        route = resp.json()["routes"][0]
        summary = route["summary"]
        dist_m: float = float(summary["distance"])
        dur_s:  float = float(summary["duration"])
        geometry: str = route["geometry"]
    except (KeyError, IndexError, TypeError) as exc:
        raise RoutingError(f"Unexpected ORS response structure: {exc}")

    total_km      = round(dist_m / 1000.0, 2)
    driving_hours = round((dur_s / 3600.0) * SPEED_CORRECTION_FACTOR, 2)

    return {
        "total_km":      total_km,
        "driving_hours": driving_hours,
        "geometry":      geometry,
    }


def _raise_ors_error(resp: requests.Response) -> None:
    """Parse an ORS error response and raise RoutingError with a useful message."""
    try:
        data    = resp.json()
        message = data.get("error", {}).get("message") or str(data)
    except Exception:
        message = resp.text or f"HTTP {resp.status_code}"
    raise RoutingError(f"Routing service error: {message}")
