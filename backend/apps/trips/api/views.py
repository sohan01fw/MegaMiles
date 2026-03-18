import os
import requests
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from rest_framework import status
from rest_framework.response import Response
import math

from typing import Dict, Any, List

class TripPlanView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.data
        if not isinstance(payload, dict):
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
            
        c_loc_raw = payload.get('current_location')
        p_loc_raw = payload.get('pickup')
        d_loc_raw = payload.get('dropoff')

        if not isinstance(c_loc_raw, dict) or not isinstance(p_loc_raw, dict) or not isinstance(d_loc_raw, dict):
            return Response({'error': 'Invalid location data format'}, status=status.HTTP_400_BAD_REQUEST)

        # Explicitly cast for linter
        from typing import cast
        c_loc = cast(Dict[str, Any], c_loc_raw)
        p_loc = cast(Dict[str, Any], p_loc_raw)
        d_loc = cast(Dict[str, Any], d_loc_raw)

        try:
            val_cyc = payload.get('cycle_used', 0)
            cycle_used: float = float(val_cyc) if val_cyc is not None else 0.0
        except (TypeError, ValueError):
            cycle_used = 0.0

        api_key = os.environ.get('OPENROUTE_API_KEY')
        if not api_key:
            return Response({'error': 'OPENROUTE_API_KEY missing in backend'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            c_lng = float(c_loc.get('lng', 0.0))
            c_lat = float(c_loc.get('lat', 0.0))
            p_lng = float(p_loc.get('lng', 0.0))
            p_lat = float(p_loc.get('lat', 0.0))
            d_lng = float(d_loc.get('lng', 0.0))
            d_lat = float(d_loc.get('lat', 0.0))
            
            body = {"coordinates": [[c_lng, c_lat], [p_lng, p_lat], [d_lng, d_lat]]}
        except (TypeError, ValueError):
            return Response({'error': 'Missing or invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. ORS Routing
        ors_url = "https://api.openrouteservice.org/v2/directions/driving-hgv"
        headers = {'Authorization': str(api_key), 'Content-Type': 'application/json'}
        try:
            ors_resp = requests.post(ors_url, json=body, headers=headers, timeout=15)
            if not ors_resp.ok:
                try:
                    err_data = ors_resp.json()
                    err_msg = err_data.get('error', {}).get('message', ors_resp.text)
                except Exception:
                    err_msg = ors_resp.text
                return Response({'error': f"Routing service failed: {err_msg}"}, status=status.HTTP_400_BAD_REQUEST)
            
            route_data = ors_resp.json()
        except Exception as e:
            return Response({'error': f"Routing service connection failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Extract distance and duration
        try:
            res_r = route_data['routes'][0]
            summ = res_r['summary']
            segs = res_r.get('segments', [])
            
            # The pickup point is at the end of the first segment (Current -> Pickup)
            pickup_idx = 0
            if len(segs) > 0:
                pickup_idx = segs[0].get('steps', [])[-1].get('way_points', [0])[1] if segs[0].get('steps') else 0
                # Alternatively, just use the sum of waypoint counts or similar
                # ORS v2 directions response has 'way_points' in steps.
                # A simpler way: segments[0] corresponds to point 0 to point 1.
                # But 'segments' in ORS v2 just gives total distance/duration per segment.
                # To find the index in the geometry 'coordinates' list:
                pickup_idx = 0
                curr_coord_idx = 0
                for seg in segs:
                    # This is slightly complex to map exactly without 'extra_info'
                    pass
            
            # Simplified: Use the waypoint indices if available in metadata
            meta = route_data.get('metadata', {})
            query = meta.get('query', {})
            wp_idx = query.get('waypoint_indices', [0, 0, 0])
            # Wait, ORS v2 returns waypoints in the summary sometimes? No.
            # Let's just use the segment summary to be safe or manually find it.
            
            dist_met: float = float(summ.get('distance', 0.0))
            dur_sec_raw: float = float(summ.get('duration', 0.0))
            geom = res_r['geometry']
        except (KeyError, IndexError, TypeError):
            return Response({'error': 'Failed to parse route summary'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Apply Speed Correction Factor (1.6x) for realism in regions like Nepal
        CORRECTION_FACTOR = 1.6
        total_km: float = float(dist_met / 1000.0)
        total_h: float = float((dur_sec_raw / 3600.0) * CORRECTION_FACTOR)

        # 3. HOS Calculation & Daily Log Generation
        hos_logs: List[Dict[str, Any]] = []
        d_left: float = 11.0
        w_left: float = 14.0
        sb: float = 0.0
        
        day_num: int = 1
        rem_d: float = float(total_h)
        
        # Pre-trip and Loading
        hos_logs.append({"day": day_num, "action": "Pre-Trip Inspection & Loading", "duration_hrs": 0.5, "status": "ON_DUTY"})
        w_left = float(w_left - 0.5)

        while rem_d > 0.001:
            can_drive: float = float(min(rem_d, d_left, w_left, (8.0 - sb)))
            
            if can_drive > 0.0:
                hos_logs.append({
                    "day": day_num,
                    "action": "Driving",
                    "duration_hrs": float("{:.2f}".format(can_drive)),
                    "remaining_trip_hrs": float("{:.2f}".format(rem_d - can_drive)),
                    "status": "DRIVING"
                })
                
                rem_d = float(rem_d - can_drive)
                d_left = float(d_left - can_drive)
                w_left = float(w_left - can_drive)
                sb = float(sb + can_drive)
            
            if rem_d <= 0.001:
                break
                
            if sb >= 7.99:
                hos_logs.append({"day": day_num, "action": "30-Min Rest Break", "duration_hrs": 0.5, "status": "OFF_DUTY"})
                w_left = float(w_left - 0.5)
                sb = 0.0
                
            if d_left <= 0.001 or w_left <= 0.5:
                # Add 10 hour sleeper
                hos_logs.append({"day": day_num, "action": "10-Hour Sleep / Off-Duty", "duration_hrs": 10.0, "status": "SLEEPER"})
                day_num += 1
                d_left = 11.0
                w_left = 14.0
                sb = 0.0

        # Post-trip and Unloading
        hos_logs.append({"day": day_num, "action": "Dropoff & Post-Trip", "duration_hrs": 0.5, "status": "ON_DUTY"})

        cyc_rem = max(0.0, 70.0 - (cycle_used + total_h))
        triplan = {
            "summary": {
                "total_km": float("{:.2f}".format(total_km)),
                "driving_hours": float("{:.2f}".format(total_h)),
                "estimated_days": day_num,
                "cycle_remaining_after": float("{:.2f}".format(cyc_rem)),
                "pickup_coord": {"lat": p_lat, "lng": p_lng},
                "dropoff_coord": {"lat": d_lat, "lng": d_lng}
            },
            "daily_logs": hos_logs,
            "route_geometry": geom
        }
        
        return Response(triplan, status=status.HTTP_200_OK)


