import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import type { TripPlan } from "../types"

export interface PlanTripPayload {
  current_location: { lat: number; lng: number }
  pickup: { lat: number; lng: number }
  dropoff: { lat: number; lng: number }
  cycle_used: number
}

const planTrip = async (data: PlanTripPayload): Promise<TripPlan> => {
  const response = await api.post("/trips/plan/", data)
  return response.data
}

export function usePlanTrip() {
  return useMutation({
    mutationFn: planTrip,
  })
}
