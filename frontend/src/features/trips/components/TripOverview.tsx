import { Map as MapIcon, CircleDot, MapPin, Clock, Compass, Play, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trip } from "../types"

interface TripOverviewProps {
  trip: Trip
  onUpdateStatus: (status: "planned" | "active" | "completed") => void
  onClose?: () => void
}

export function TripOverview({ trip, onUpdateStatus, onClose }: TripOverviewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-auto mb-auto relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm z-50"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Trip Overview
          </h1>
          <p className="text-slate-500 text-lg">
            Reviewing details for your {trip.status} route.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {trip.status === "planned" && (
            <button 
              onClick={() => onUpdateStatus("active")}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all transform active:scale-95"
            >
              <Play className="h-4 w-4 fill-current" /> Start Trip
            </button>
          )}
          {trip.status === "active" && (
            <button 
              onClick={() => onUpdateStatus("completed")}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition-all transform active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" /> End Trip
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              trip.status === "planned" && "bg-blue-50 text-blue-600",
              trip.status === "active" && "bg-orange-50 text-orange-600",
              trip.status === "completed" && "bg-green-50 text-green-600"
            )}>
              <MapIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-xl tracking-tight capitalize">{trip.status} Route</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">ID: {trip.id.slice(0, 8)}</p>
            </div>
          </div>
          <span className={cn(
            "text-xs font-bold px-4 py-1.5 rounded-full border uppercase tracking-widest",
            trip.status === "planned" && "bg-blue-50 text-blue-600 border-blue-100",
            trip.status === "active" && "bg-orange-50 text-orange-600 border-orange-100 animate-pulse",
            trip.status === "completed" && "bg-green-50 text-green-600 border-green-100"
          )}>
            {trip.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="relative pl-8 before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-slate-100">
              <div className="relative z-10 mb-10">
                <div className="absolute -left-10 top-1 bg-white ring-4 ring-white shadow-md h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center">
                  <CircleDot className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pickup Point</p>
                <p className="text-xl font-bold text-slate-900 capitalize">{trip.pickup}</p>
                <p className="text-sm text-slate-500 mt-0.5">Scheduled for morning departure</p>
              </div>
              <div className="relative z-10">
                <div className="absolute -left-10 top-1 bg-white ring-4 ring-white shadow-md h-8 w-8 rounded-full border-2 border-purple-500 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-purple-600 fill-purple-100" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dropoff Point</p>
                <p className="text-xl font-bold text-slate-900 capitalize">{trip.dropoff}</p>
                <p className="text-sm text-slate-500 mt-0.5">Estimated 12h transit time</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-5 hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-slate-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cycle Hours Used</p>
                <p className="text-xl font-bold text-slate-900">{trip.cycleHoursUsed}h <span className="text-slate-300 font-medium">/ 70h</span></p>
              </div>
            </div>
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-5 hover:bg-slate-50 transition-colors">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-slate-600">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Location</p>
                <p className="text-lg font-bold text-slate-900 truncate maxWidth[180px] capitalize">{trip.currentLocation}</p>
              </div>
            </div>

            {trip.status === "active" && (
              <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3">
                 <div className="h-2 w-2 bg-purple-600 rounded-full animate-ping" />
                 <p className="text-sm font-semibold text-purple-700 uppercase tracking-wider">Tracking Live GPS Data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
