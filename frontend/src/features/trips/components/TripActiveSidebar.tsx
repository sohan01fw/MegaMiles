import { useState } from "react"
import { Map as MapIcon, CircleDot, MapPin, Clock, Compass, CheckCircle2, X, Navigation, CalendarDays, Zap, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trip } from "../types"
import { LogSheetModal } from "./LogSheetModal"

interface TripActiveSidebarProps {
  trip: Trip
  onUpdateStatus: (status: "planned" | "active" | "completed") => void
  onClose: () => void
}

export function TripActiveSidebar({ trip, onUpdateStatus, onClose }: TripActiveSidebarProps) {
  const plan = trip.plan
  const [isLogOpen, setIsLogOpen] = useState(false)

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-left-8 duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
          {plan && (
            <button 
              onClick={() => setIsLogOpen(true)}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors text-xs font-bold shadow-sm"
              title="View Daily Logs"
            >
              <FileText className="h-3 w-3" /> Logs
            </button>
          )}
          <button 
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <MapIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl tracking-tight leading-none">Active Route</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {trip.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
           <button 
             onClick={() => onUpdateStatus("completed")}
             className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
           >
             <CheckCircle2 className="h-4 w-4" /> Finish Trip
           </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-6 space-y-8">
          
          {/* Timeline / Locations */}
          <div className="relative pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-100">
            <div className="relative z-10 mb-8">
              <div className="absolute -left-8 top-0.5 bg-white ring-4 ring-white shadow-sm h-6 w-6 rounded-full border border-slate-200 flex items-center justify-center">
                <CircleDot className="h-3 w-3 text-slate-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Pickup</p>
              <p className="text-sm font-bold text-slate-900 capitalize leading-tight">{trip.pickup}</p>
            </div>
            <div className="relative z-10">
              <div className="absolute -left-8 top-0.5 bg-white ring-4 ring-white shadow-sm h-6 w-6 rounded-full border-2 border-purple-500 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-purple-600 fill-purple-100" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Dropoff</p>
              <p className="text-sm font-bold text-slate-900 capitalize leading-tight">{trip.dropoff}</p>
            </div>
          </div>

          {/* Metrics Base */}
          <div className="grid grid-cols-2 gap-3">
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Clock className="h-4 w-4 text-slate-400 mb-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cycle Used</p>
                <p className="text-base font-bold text-slate-900 leading-none">{trip.cycleHoursUsed}h</p>
             </div>
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Compass className="h-4 w-4 text-slate-400 mb-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Geo</p>
                <p className="text-xs font-bold text-slate-900 truncate">{trip.currentLocation}</p>
             </div>
          </div>

          {/* Plan Metrics */}
          {plan && (
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <Navigation className="h-4 w-4 text-purple-500 mb-2" />
                  <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Distance</p>
                  <p className="text-base font-bold text-purple-900 leading-none">{plan.summary.total_km} km</p>
               </div>
               <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <CalendarDays className="h-4 w-4 text-blue-500 mb-2" />
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Est. Trip</p>
                  <p className="text-base font-bold text-blue-900 leading-none">{plan.summary.estimated_days} Days</p>
               </div>
             </div>
          )}

          {/* HOS Logs */}
          {plan && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-slate-900 text-sm">Action Plan</h3>
                <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-100">
                  {plan.summary.cycle_remaining_after}h Rem
                </span>
              </div>
              <div className="space-y-2">
                {plan.daily_logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-sm border-l-2 border-slate-100 pl-3 relative py-1">
                    <div className={cn(
                      "absolute -left-[9px] top-2.5 h-4 w-4 rounded-full border-4 border-white",
                      log.action === "Driving" ? "bg-purple-500" : log.action.includes("Break") ? "bg-yellow-400" : "bg-orange-500"
                    )} />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 leading-none mb-1">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Day {log.day}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700 leading-none mb-1">{log.duration_hrs}h</p>
                      {log.remaining_trip_hrs !== undefined && (
                        <p className="text-[10px] text-slate-400 font-medium">Rem {log.remaining_trip_hrs}h</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

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
