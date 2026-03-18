import { useState } from "react"
import { Map as MapIcon, CircleDot, MapPin, Clock, Compass, Play, CheckCircle2, X, Navigation, CalendarDays, Zap, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trip } from "../types"
import { RouteMap } from "./RouteMap"
import { LogSheetModal } from "./LogSheetModal"

interface TripOverviewProps {
  trip: Trip
  onUpdateStatus: (status: "planned" | "active" | "completed") => void
  onClose?: () => void
}

export function TripOverview({ trip, onUpdateStatus, onClose }: TripOverviewProps) {
  const plan = trip.plan
  const [isLogOpen, setIsLogOpen] = useState(false)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-auto mb-auto relative w-full">
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
          {plan && (trip.status === "active" || trip.status === "completed") && (
            <button 
              onClick={() => setIsLogOpen(true)}
              className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 font-semibold px-4 py-2.5 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" /> View Daily Logs
            </button>
          )}
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
      
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Main Locations */}
            <div className="relative pl-8 before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-slate-100">
              <div className="relative z-10 mb-10">
                <div className="absolute -left-10 top-1 bg-white ring-4 ring-white shadow-md h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center">
                  <CircleDot className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Pickup Point</p>
                <p className="text-xl font-bold text-slate-900 capitalize leading-tight">{trip.pickup}</p>
              </div>
              <div className="relative z-10">
                <div className="absolute -left-10 top-1 bg-white ring-4 ring-white shadow-md h-8 w-8 rounded-full border-2 border-purple-500 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-purple-600 fill-purple-100" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dropoff Point</p>
                <p className="text-xl font-bold text-slate-900 capitalize leading-tight">{trip.dropoff}</p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 text-slate-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle Used</p>
                  <p className="text-lg font-bold text-slate-900">{trip.cycleHoursUsed}h</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 text-slate-600">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geo Current</p>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{trip.currentLocation}</p>
                </div>
              </div>
            </div>

             {/* HOS Summary Metrics (if plan exists) */}
             {plan && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-purple-100 text-purple-600">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Distance</p>
                    <p className="text-lg font-bold text-purple-900">{plan.summary.total_km} km</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-100 text-blue-600">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Est. Trip</p>
                    <p className="text-lg font-bold text-blue-900">{plan.summary.estimated_days} Days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            {plan?.route_geometry ? (
              <RouteMap 
                geometry={plan.route_geometry} 
                logs={plan.daily_logs}
                pickupCoord={plan.summary.pickup_coord}
                dropoffCoord={plan.summary.dropoff_coord}
                className="w-full h-[400px]" 
              />
            ) : (
              <div className="w-full h-[400px] bg-slate-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <MapIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 font-medium">Map view unavailable</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HOS Daily Logs Section */}
      {plan && (
        <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl tracking-tight">Daily HOS Plan</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">FMCSA Compliance Check</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cycle Remainder</p>
                <p className="text-xl font-bold text-green-400">{plan.summary.cycle_remaining_after}h</p>
              </div>
            </div>

            <div className="space-y-3">
              {plan.daily_logs.map((log, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                    log.action === "Driving" 
                      ? "bg-white/5 border-white/10 hover:bg-white/10" 
                      : log.action.includes("Break")
                      ? "bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10"
                      : "bg-orange-500/5 border-orange-500/10 hover:bg-orange-500/10"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs",
                      log.action === "Driving" ? "bg-purple-500/20 text-purple-400" : "bg-slate-700 text-slate-300"
                    )}>
                      D{log.day}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{log.action}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Scheduled Task</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                      <p className="text-sm font-bold text-white">{log.duration_hrs} hrs</p>
                    </div>
                    {log.remaining_trip_hrs !== undefined && (
                      <div className="text-right w-24">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trip Rem.</p>
                        <p className="text-sm font-bold text-slate-300">{log.remaining_trip_hrs}h</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Logs Print Modal */}
      {plan && (
        <LogSheetModal 
          trip={trip}
          isOpen={isLogOpen}
          onClose={() => setIsLogOpen(false)}
        />
      )}
    </div>
  )
}
