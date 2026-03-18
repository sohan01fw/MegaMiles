import { z } from "zod"

export const tripSchema = z.object({
  currentLocation: z.string().min(1, "Location is required"),
  pickup: z.string().min(1, "Pickup point is required"),
  dropoff: z.string().min(1, "Dropoff point is required"),
  cycleHoursUsed: z
    .string()
    .min(1, "Cycle hours is required")
    .refine((v) => !isNaN(Number(v)), { message: "Must be a number" })
    .refine((v) => Number(v) >= 0, { message: "Must be at least 0" })
    .refine((v) => Number(v) <= 70, { message: "Max cycle hours is 70" }),
})

export type TripFormValues = z.infer<typeof tripSchema>

export interface TripLog {
  day: number
  action: string
  duration_hrs: number
  remaining_trip_hrs?: number
}

export interface TripPlan {
  summary: {
    total_miles: number
    driving_hours: number
    estimated_days: number
    cycle_remaining_after: number
  }
  daily_logs: TripLog[]
  route_geometry: string
}

export type Trip = TripFormValues & { 
  id: string; 
  createdAt: Date;
  status: "planned" | "active" | "completed";
  plan?: TripPlan;
}
