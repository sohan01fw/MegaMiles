import { useState, useMemo } from "react"
import { Compass, Clock, MapPin, Navigation, Calendar, Zap, Maximize2, ExternalLink } from "lucide-react"
import type { Trip } from "../types"
import { RouteMap } from "./RouteMap"

interface DashboardGreetingProps {
  activeTrip?: Trip
  onExpandMap?: () => void
}

export function DashboardGreeting({ activeTrip, onExpandMap }: DashboardGreetingProps) {
  const [isMapHovered, setIsMapHovered] = useState(false)

  // Calculate circular progress for HOS (70h cycle)
  const hosProgress = useMemo(() => {
    if (!activeTrip) return 0
    const used = Number(activeTrip.cycleHoursUsed) || 0
    return Math.min(100, (used / 70) * 100)
  }, [activeTrip])

  const hoursLeft = useMemo(() => {
    if (!activeTrip) return 70
    return Math.max(0, 70 - Number(activeTrip.cycleHoursUsed))
  }, [activeTrip])

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-auto mt-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Hey there, <span className="text-[#f26440]">Driver</span>
        </h1>
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
          Where would you like to go?
        </h2>
        <p className="text-slate-500 mt-2 text-[15px]">
          I'm here to assist you in planning your haul. Enter the route details below.
        </p>
      </div>

      {activeTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16 max-w-6xl">
          {/* Quick Map Preview */}
          <div 
            className="lg:col-span-2 relative group rounded-[32px] overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-slate-300 h-[320px] bg-slate-100"
            onMouseEnter={() => setIsMapHovered(true)}
            onMouseLeave={() => setIsMapHovered(false)}
          >
            {activeTrip.plan?.route_geometry ? (
              <RouteMap 
                geometry={activeTrip.plan.route_geometry} 
                logs={activeTrip.plan.daily_logs}
                pickupCoord={activeTrip.plan.summary.pickup_coord}
                dropoffCoord={activeTrip.plan.summary.dropoff_coord}
                className="w-full h-full rounded-none border-none p-0" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <MapPin className="w-8 h-8 mb-2 opacity-20" />
              </div>
            )}
            
            {/* Overlay */}
            <div className={`absolute inset-0 bg-slate-900/10 transition-opacity duration-300 pointer-events-none ${isMapHovered ? 'opacity-100' : 'opacity-0'}`} />
            
            <button 
              onClick={onExpandMap}
              className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-lg text-slate-900 transform transition-all active:scale-95 hover:bg-white"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-6 left-6 z-20">
               <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 shadow-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Route</p>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {activeTrip.pickup} <Navigation className="w-3 h-3 text-slate-300" /> {activeTrip.dropoff}
                  </h3>
               </div>
            </div>
          </div>

          {/* HOS & Stats Side */}
          <div className="flex flex-col gap-6">
            {/* Circular HOS UI */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-500">
                  <Zap className="w-20 h-20 text-slate-900" />
               </div>
               
               <div className="relative w-32 h-32 mb-4">
                  {/* SVG Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * (100 - hosProgress)) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="text-[#f26440] transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">{Math.round(hoursLeft)}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Hrs Left</span>
                  </div>
               </div>
               <h4 className="font-bold text-slate-800">Circular HOS Cycle</h4>
               <p className="text-xs text-slate-500 mt-1">70-hour / 8-day progress</p>
            </div>

            {/* Small Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900 text-white p-4 rounded-3xl">
                  <Navigation className="w-4 h-4 text-slate-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Distance</p>
                  <p className="text-base font-bold">{activeTrip.plan?.summary.total_km || 0} km</p>
               </div>
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl">
                  <Clock className="w-4 h-4 text-slate-400 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Today</p>
                  <p className="text-base font-bold text-slate-900">8.5 hrs</p>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-4xl">
          <button className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all text-left group text-slate-800">
            <div className="bg-slate-50 p-2.5 rounded-full text-slate-600 group-hover:bg-slate-100 transition-colors shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1 text-[15px]">Optimize Route</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Find the most efficient path avoiding tolls and steep grades for heavy loads.
              </p>
            </div>
          </button>
          <button className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all text-left group text-slate-800">
            <div className="bg-slate-50 p-2.5 rounded-full text-slate-600 group-hover:bg-slate-100 transition-colors shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1 text-[15px]">Check ELD Hours</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Review your current 70-hour cycle to ensure compliance before your next dispatch.
              </p>
            </div>
          </button>
          <button className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all text-left group md:col-span-2 lg:col-span-1 text-slate-800">
            <div className="bg-slate-50 p-2.5 rounded-full text-slate-600 group-hover:bg-slate-100 transition-colors shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-1 text-[15px]">Find Truck Stops</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Locate rest areas with available showers and parking along I-80.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Driver Resources Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Driver Resources <div className="h-1 w-1 rounded-full bg-slate-300" /> <span className="text-slate-400 font-medium text-sm capitalize">Latest Updates</span>
        </h3>
        <button className="text-[11px] font-bold uppercase tracking-widest text-[#f26440] hover:underline flex items-center gap-1">
          View All <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
         <div className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-500 flex flex-col">
            <div className="h-44 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1584143431327-77887e07ebbf?q=80&w=600&auto=format&fit=crop" alt="Rest Area" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 uppercase shadow-sm">Rest Areas</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
               <h4 className="font-bold text-slate-900 text-base leading-tight mb-2">Best resting spots in Texas</h4>
               <p className="text-slate-500 text-xs leading-relaxed mb-4">A list of the top locations for heavy sleepers with great amenities like 24h showers and clean dining.</p>
               <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">5 min read</span>
                  <button className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#f26440] group-hover:text-white transition-all flex items-center justify-center">
                     <ExternalLink className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
         </div>

         <div className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-500 flex flex-col">
            <div className="h-44 overflow-hidden relative">
               <img src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=600&auto=format&fit=crop" alt="Compliance" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 uppercase shadow-sm">Compliance</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
               <h4 className="font-bold text-slate-900 text-base leading-tight mb-2">New 2026 HOS Regulations</h4>
               <p className="text-slate-500 text-xs leading-relaxed mb-4">Stay ahead of the curve with our summary of upcoming changes to ELD logging and mandatory rest requirements.</p>
               <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">8 min read</span>
                  <button className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#f26440] group-hover:text-white transition-all flex items-center justify-center">
                     <ExternalLink className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
         </div>

         <div className="group bg-[#f26440]/5 rounded-[32px] p-6 border border-[#f26440]/10 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#f26440] mb-4">
               <Calendar className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Weekly Safety Briefing</h4>
            <p className="text-slate-500 text-xs mb-6">Join our community call this Friday to discuss winter driving safety and route optimization tips.</p>
            <button className="w-full py-3 bg-[#f26440] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#f26440]/20 hover:opacity-90 transition-all active:scale-95">
               Register Now
            </button>
         </div>
      </div>
    </div>
  )
}
