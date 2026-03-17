import { Compass, Clock, MapPin } from "lucide-react"

export function DashboardGreeting() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-4xl">
        <button className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all text-left group">
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
        <button className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all text-left group">
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
        <button className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-slate-100/60 shadow-[0_2px_12px_rgb(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] hover:border-slate-200 transition-all text-left group md:col-span-2 lg:col-span-1">
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
    </div>
  )
}
