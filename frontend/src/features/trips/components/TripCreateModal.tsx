import { useState } from "react"
import { Compass, MapPin, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { tripSchema, type TripFormValues, type TripPlan } from "../types"
import { LocationAutocomplete } from "./LocationAutocomplete"
import { api } from "@/lib/axios"
import { toast } from "sonner"
import axios from "axios"

interface TripCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: TripFormValues, plan?: TripPlan) => void
}

interface Coordinate {
  lat: number
  lng: number
}

/** Parse the most useful message from an Axios error response */
function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Network / connection failures
    if (!error.response) {
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        return "Request timed out. The routing service may be slow — please try again."
      }
      return "Cannot reach the server. Check that the backend is running and your internet is connected."
    }

    const status = error.response.status
    const data = error.response.data as Record<string, unknown> | undefined

    // Backend returned a structured { error: "..." } message
    if (data && typeof data.error === "string") {
      const msg = data.error.toLowerCase()

      if (msg.includes("routable point") || msg.includes("radius")) {
        return "One or more of your locations is too far from a routable road. Try selecting a nearby city or major address."
      }
      if (msg.includes("api key") || msg.includes("unauthorized") || status === 401 || status === 403) {
        return "Routing service authentication failed. Please contact support."
      }
      if (msg.includes("quota") || msg.includes("rate limit") || status === 429) {
        return "Routing service rate limit reached. Please wait a moment and try again."
      }
      if (msg.includes("openroute") || msg.includes("routing service")) {
        return `Routing error: ${data.error}`
      }
      // Generic backend error message
      return data.error
    }

    if (status === 400) return "Invalid request. Check that all locations are valid."
    if (status === 500) return "Server error while planning the trip. Please try again."
    if (status === 503) return "Routing service is temporarily unavailable. Try again shortly."

    return `Unexpected error (${status}). Please try again.`
  }

  // Non-axios unknown error
  if (error instanceof Error) return error.message
  return "An unexpected error occurred. Please try again."
}

export function TripCreateModal({ isOpen, onClose, onSubmit }: TripCreateModalProps) {
  const [currentCoord, setCurrentCoord] = useState<Coordinate | null>(null)
  const [pickupCoord, setPickupCoord] = useState<Coordinate | null>(null)
  const [dropoffCoord, setDropoffCoord] = useState<Coordinate | null>(null)
  const [isPlanning, setIsPlanning] = useState(false)

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      currentLocation: "",
      pickup: "",
      dropoff: "",
      cycleHoursUsed: "0",
    },
  })

  const handleSubmit = async (values: TripFormValues) => {
    if (!currentCoord || !pickupCoord || !dropoffCoord) {
      toast.warning("Select all locations", {
        description: "Please choose your Current Location, Origin, and Destination from the dropdown suggestions.",
      })
      return
    }

    setIsPlanning(true)
    const toastId = toast.loading("Planning your trip…", {
      description: "Calculating route and HOS schedule.",
    })

    const tripData = {
      current_location: currentCoord,
      pickup: pickupCoord,
      dropoff: dropoffCoord,
      cycle_used: Number(values.cycleHoursUsed),
    }

    try {
      const response = await api.post("/trips/plan/", tripData)
      const plan: TripPlan = response.data

      toast.success("Trip planned!", {
        id: toastId,
        description: `${plan.summary.total_km} km · ${plan.summary.driving_hours}h driving · ${plan.summary.estimated_days} day(s)`,
      })

      onSubmit(values, plan)
      form.reset()
      setCurrentCoord(null)
      setPickupCoord(null)
      setDropoffCoord(null)
      onClose()
    } catch (error) {
      const message = parseApiError(error)
      toast.error("Could not plan trip", {
        id: toastId,
        description: message,
        duration: 6000,
      })
    } finally {
      setIsPlanning(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Plan New Trip</h3>
            <p className="text-sm text-slate-500">Enter route details to generate a plan.</p>
          </div>
          <button 
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4 text-left">
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Geo</p>
                    <FormControl>
                      <LocationAutocomplete 
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Current city, state..."
                        icon={<MapPin className="h-4 w-4" />}
                        onSelect={(loc) => {
                          field.onChange(loc.label)
                          setCurrentCoord({ lat: loc.lat, lng: loc.lng })
                          console.log("Selected Current Location:", loc)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pickup"
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Origin</p>
                      <FormControl>
                        <LocationAutocomplete 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pickup location..."
                          icon={<Compass className="h-4 w-4" />}
                          onSelect={(loc) => {
                            field.onChange(loc.label)
                            setPickupCoord({ lat: loc.lat, lng: loc.lng })
                            console.log("Selected Pickup Location:", loc)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dropoff"
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Destination</p>
                      <FormControl>
                        <LocationAutocomplete 
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Dropoff point..."
                          icon={<MapPin className="h-4 w-4" />}
                          onSelect={(loc) => {
                            field.onChange(loc.label)
                            setDropoffCoord({ lat: loc.lat, lng: loc.lng })
                            console.log("Selected Dropoff Location:", loc)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cycleHoursUsed"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2 ml-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Cycle Hours Used</p>
                      <span className="text-sm font-bold text-purple-600 ">{field.value || 0}h / 70h</span>
                    </div>
                    <FormControl>
                      <input 
                        type="range"
                        min={0}
                        max={70}
                        step={0.5}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 transition-all hover:bg-slate-200"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 h-12 bg-slate-50 text-slate-600 font-semibold rounded-2xl hover:bg-slate-100 transition-colors"
                disabled={isPlanning}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 h-12 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                disabled={isPlanning}
              >
                {isPlanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Planning...
                  </>
                ) : (
                  "Plan Trip"
                )}
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
