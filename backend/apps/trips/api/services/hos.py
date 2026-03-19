"""
apps/trips/api/services/hos.py
--------------------------------
Hours-of-Service (HOS) calculation logic following FMCSA 70-hour / 8-day rules.

Rules implemented:
  • 11-hour driving limit per day
  • 14-hour on-duty window per day
  • 30-minute break required after 8 cumulative driving hours
  • 10-hour off-duty / sleeper reset between days
"""
from typing import Any


# ── HOS Constants ─────────────────────────────────────────────────────────────
MAX_DRIVE_HOURS   = 11.0   # Maximum driving hours in a single shift
MAX_WINDOW_HOURS  = 14.0   # Maximum on-duty window per shift
BREAK_TRIGGER     =  8.0   # Mandatory break after this many consecutive hours
BREAK_DURATION    =  0.5   # 30-minute rest break
RESET_DURATION    = 10.0   # 10-hour sleeper berth / off-duty reset
CYCLE_HOURS       = 70.0   # 70-hour / 8-day cycle cap


def build_daily_logs(driving_hours: float, cycle_used: float) -> dict[str, Any]:
    """
    Generate a day-by-day HOS activity log and compute cycle summary.

    Args:
        driving_hours: Total estimated driving time for the trip (hours).
        cycle_used:    Hours already consumed in the current 70-hour cycle.

    Returns:
        {
            "logs":           list of log-entry dicts,
            "estimated_days": int,
            "cycle_remaining_after": float,
        }
    """
    logs: list[dict[str, Any]] = []

    # Mutable counters
    drive_left  = MAX_DRIVE_HOURS   # drive hours remaining in current shift
    window_left = MAX_WINDOW_HOURS  # on-duty window remaining in current shift
    since_break = 0.0               # cumulative drive hours since last break
    day         = 1
    remaining   = driving_hours

    # ── Pre-trip inspection ───────────────────────────────────────────────────
    logs.append(_entry(day, "Pre-Trip Inspection & Loading", 0.5, "ON_DUTY"))
    window_left -= 0.5

    # ── Main driving loop ─────────────────────────────────────────────────────
    while remaining > 0.001:
        # How much can we drive right now?
        drivable = min(remaining, drive_left, window_left, BREAK_TRIGGER - since_break)

        if drivable > 0.0:
            drivable = round(drivable, 2)
            logs.append({
                **_entry(day, "Driving", drivable, "DRIVING"),
                "remaining_trip_hrs": round(remaining - drivable, 2),
            })
            remaining   -= drivable
            drive_left  -= drivable
            window_left -= drivable
            since_break += drivable

        if remaining <= 0.001:
            break

        # Break trigger: 8 hours of continuous driving
        if since_break >= BREAK_TRIGGER - 0.001:
            logs.append(_entry(day, "30-Min Rest Break", BREAK_DURATION, "OFF_DUTY"))
            window_left -= BREAK_DURATION
            since_break  = 0.0

        # Shift reset: either the drive limit or the on-duty window is exhausted
        if drive_left <= 0.001 or window_left <= BREAK_DURATION:
            logs.append(_entry(day, "10-Hour Sleep / Off-Duty", RESET_DURATION, "SLEEPER"))
            day        += 1
            drive_left  = MAX_DRIVE_HOURS
            window_left = MAX_WINDOW_HOURS
            since_break = 0.0

    # ── Post-trip ─────────────────────────────────────────────────────────────
    logs.append(_entry(day, "Dropoff & Post-Trip", 0.5, "ON_DUTY"))

    cycle_remaining = round(max(0.0, CYCLE_HOURS - (cycle_used + driving_hours)), 2)

    return {
        "logs":                   logs,
        "estimated_days":         day,
        "cycle_remaining_after":  cycle_remaining,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _entry(day: int, action: str, duration: float, status: str) -> dict[str, Any]:
    return {
        "day":          day,
        "action":       action,
        "duration_hrs": round(duration, 2),
        "status":       status,
    }
