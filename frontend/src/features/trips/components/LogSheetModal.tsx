import { useState, useMemo } from "react"
import { X, ChevronLeft, ChevronRight, Printer } from "lucide-react"
import { format, addDays } from "date-fns"
import type { Trip } from "../types"

interface LogSheetModalProps {
  trip: Trip
  isOpen: boolean
  onClose: () => void
}

const ROWS = [
  { label: "1. Off Duty", id: "OFF_DUTY", y: 25 },
  { label: "2. Sleeper Berth", id: "SLEEPER", y: 75 },
  { label: "3. Driving", id: "DRIVING", y: 125 },
  { label: "4. On Duty (Not Driving)", id: "ON_DUTY", y: 175 },
]

export function LogSheetModal({ trip, isOpen, onClose }: LogSheetModalProps) {
  const [dayIndex, setDayIndex] = useState(0)

  // Calculate continuous events timeline
  const { continuousEvents, totalDays } = useMemo(() => {
    let absoluteTime = 8.0 // Start trip at 8:00 AM
    const events: { status: string; start: number; end: number; action: string }[] = []
    
    // Initial Off Duty segment (midnight to 8 AM)
    events.push({ status: "OFF_DUTY", start: 0, end: absoluteTime, action: "Off Duty" })
    
    trip.plan?.daily_logs.forEach((log) => {
      const dur = log.duration_hrs
      events.push({ 
        status: log.status || "OFF_DUTY", 
        start: absoluteTime, 
        end: absoluteTime + dur,
        action: log.action
      })
      absoluteTime += dur
    })
    
    const days = Math.ceil(absoluteTime / 24)
    const endOfTrip = days * 24
    if (absoluteTime < endOfTrip) {
      events.push({ status: "OFF_DUTY", start: absoluteTime, end: endOfTrip, action: "Off Duty (End)" })
    }
    
    return { continuousEvents: events, totalDays: days }
  }, [trip])

  if (!isOpen || !trip.plan) return null

  const dayStart = dayIndex * 24
  const dayEnd = dayStart + 24

  // Filter events for current day page
  const todayEvents = continuousEvents
    .filter(ev => ev.start < dayEnd && ev.end > dayStart)
    .map(ev => ({
      ...ev,
      s: Math.max(dayStart, ev.start) - dayStart,
      e: Math.min(dayEnd, ev.end) - dayStart
    }))

  // Generate SVG path for the zig-zag line
  let pathD = ""
  todayEvents.forEach((ev, i) => {
    const x1 = ev.s * 40
    const x2 = ev.e * 40
    const row = ROWS.find(r => r.id === ev.status)
    const y = row ? row.y : 25
    
    if (i === 0) {
      pathD += `M ${x1} ${y} `
    } else {
      const prevRow = ROWS.find(r => r.id === todayEvents[i-1].status)
      const prevY = prevRow ? prevRow.y : 25
      if (prevY !== y) {
        pathD += `L ${x1} ${y} `
      }
    }
    pathD += `L ${x2} ${y} `
  })

  // Calculate recap totals
  const totals = { OFF_DUTY: 0, SLEEPER: 0, DRIVING: 0, ON_DUTY: 0 }
  todayEvents.forEach(ev => {
    const hrs = ev.e - ev.s
    if (totals[ev.status as keyof typeof totals] !== undefined) {
      totals[ev.status as keyof typeof totals] += hrs
    }
  })

  const totalLines = totals.DRIVING + totals.ON_DUTY

  const sheetDate = addDays(new Date(trip.createdAt), dayIndex)

  // Helpers to draw background grid
  const ticks = Array.from({ length: 24 }).map((_, i) => i)

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div 
        className="bg-white w-full max-w-5xl h-[90vh] rounded-4xl shadow-2xl flex flex-col font-mono text-xs overflow-hidden print:w-full print:h-auto print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-sans tracking-tight">Driver's Daily Log</h2>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-2 py-1">
              <button 
                disabled={dayIndex === 0}
                onClick={() => setDayIndex(d => d - 1)}
                className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold px-2">Day {dayIndex + 1} of {totalDays}</span>
              <button 
                disabled={dayIndex === totalDays - 1}
                onClick={() => setDayIndex(d => d + 1)}
                className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => window.print()} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors font-sans text-sm font-semibold">
                <Printer className="h-4 w-4" /> Print Form
             </button>
             <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors">
                <X className="h-4 w-4" />
             </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 print:p-0">
          <div className="max-w-4xl mx-auto space-y-8 print:w-full">
            
            {/* Form Header */}
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-bold uppercase mb-4">Driver's Daily Log</h1>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-lg">
                    <div className="border-b border-black pb-1">Date: {format(sheetDate, "MM/dd/yyyy")}</div>
                    <div className="border-b border-black pb-1">Driver: John Doe</div>
                    <div className="border-b border-black pb-1">Truck/Tractor: #MM-701</div>
                    <div className="border-b border-black pb-1">Trailer: #T-900X</div>
                    <div className="border-b border-black pb-1">Distance Today: {Math.round(trip.plan.summary.total_km / totalDays)} km</div>
                  </div>
               </div>
               <div className="text-right space-y-4 max-w-sm">
                 <div className="border-b border-black pb-1 text-left w-64 ml-auto">Carrier: MegaMiles Logistics</div>
                 <div className="border-b border-black pb-1 text-left w-64 ml-auto">Main Office: 123 Transport Way</div>
                 <div className="border-b border-black pb-1 text-left w-64 ml-auto">Home Terminal: Same</div>
               </div>
            </div>

            {/* Grid Area */}
            <div className="relative border-2 border-black rounded bg-white mt-8 overflow-x-auto">
               <div className="flex w-full min-w-[1000px]">
                 
                 {/* Y Axis Labels */}
                 <div className="w-32 shrink-0 border-r-2 border-black flex flex-col bg-slate-50 font-bold uppercase text-[9px] tracking-tight">
                    <div className="h-10 border-b-2 border-black flex items-center justify-center bg-black text-white px-2">
                       Status
                    </div>
                    {ROWS.map((r, i) => (
                      <div key={r.id} className={`h-[50px] flex px-2 items-center ${i < 3 ? 'border-b border-slate-300/50' : ''}`}>
                         {r.label}
                      </div>
                    ))}
                 </div>
                 
                 {/* Grid Content */}
                 <div className="flex-1 min-w-[960px] relative">
                    {/* Headers: Midnight to Noon to Midnight */}
                    <div className="h-10 border-b-2 border-black bg-black text-white flex tracking-widest leading-none">
                       {ticks.map(h => {
                         let label = ""
                         if (h === 0) label = "M"
                         else if (h === 12) label = "N"
                         else label = String(h > 12 ? h - 12 : h)
                         
                         return (
                           <div key={h} className="w-[40px] flex items-center justify-center text-[10px] font-bold border-r border-white/20">
                             {label}
                           </div>
                         )
                       })}
                       <div className="w-[60px] text-center border-l-2 text-white border-white flex items-center justify-center font-bold">
                         Total
                       </div>
                    </div>
                    
                    {/* SVG Drawing Area overlaying the grid */}
                    <div className="relative w-[960px] h-[200px]">
                       {/* SVG lines and ticks */}
                       <svg width="1020" height="200" className="absolute top-0 left-0">
                         {/* Rows */}
                         <line x1="0" y1="50" x2="960" y2="50" stroke="#000" strokeWidth="1" opacity="0.1" />
                         <line x1="0" y1="100" x2="960" y2="100" stroke="#000" strokeWidth="1" opacity="0.1" />
                         <line x1="0" y1="150" x2="960" y2="150" stroke="#000" strokeWidth="1" opacity="0.1" />
                         
                         {/* Hour Columns & 15-min Ticks */}
                         {ticks.map((h) => {
                           const x = h * 40;
                           return (
                             <g key={h}>
                               <line x1={x} y1="0" x2={x} y2="200" stroke="#000" strokeWidth="1" opacity={0.3} />
                               <line x1={x + 10} y1="0" x2={x + 10} y2="200" stroke="#000" strokeWidth="1" strokeDasharray="2 3" opacity="0.15" />
                               <line x1={x + 20} y1="0" x2={x + 20} y2="200" stroke="#000" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
                               <line x1={x + 30} y1="0" x2={x + 30} y2="200" stroke="#000" strokeWidth="1" strokeDasharray="2 3" opacity="0.15" />
                             </g>
                           )
                         })}
                         <line x1="960" y1="0" x2="960" y2="200" stroke="#000" strokeWidth="2" />

                         {/* The actual log line! */}
                         <path 
                           d={pathD}
                           fill="none" 
                           stroke="#2563eb" 
                           strokeWidth="4" 
                           strokeLinejoin="round" 
                           strokeLinecap="square"
                         />
                         {/* End of line circle */}
                         {todayEvents.length > 0 && (
                           <circle 
                             cx={todayEvents[todayEvents.length-1].e * 40} 
                             cy={ROWS.find(r => r.id === todayEvents[todayEvents.length-1].status)?.y || 25} 
                             r="4" 
                             fill="#2563eb" 
                           />
                         )}
                         
                         {/* Totals blocks */}
                         <text x="965" y="30" fontSize="12" fontWeight="bold" dominantBaseline="middle">{totals.OFF_DUTY.toFixed(2)}</text>
                         <text x="965" y="80" fontSize="12" fontWeight="bold" dominantBaseline="middle">{totals.SLEEPER.toFixed(2)}</text>
                         <text x="965" y="130" fontSize="12" fontWeight="bold" dominantBaseline="middle">{totals.DRIVING.toFixed(2)}</text>
                         <text x="965" y="180" fontSize="12" fontWeight="bold" dominantBaseline="middle">{totals.ON_DUTY.toFixed(2)}</text>
                       </svg>
                    </div>
                 </div>
               </div>
            </div>

            {/* Remarks Section */}
            <div>
               <h3 className="font-bold text-lg border-b border-black mb-4 uppercase">Remarks & Duty Changes</h3>
               <div className="grid grid-cols-1 gap-2 mt-4 text-sm font-sans">
                 {todayEvents.map((ev, i) => {
                   if (ev.status === "OFF_DUTY" && i > 0 && todayEvents[i-1].status === "OFF_DUTY") return null; // skip merging blanks visually
                   
                   const starth = Math.floor(ev.s);
                   const startm = Math.round((ev.s - starth) * 60).toString().padStart(2, '0');
                   const endh = Math.floor(ev.e);
                   const endm = Math.round((ev.e - endh) * 60).toString().padStart(2, '0');
                   const timeA = `${starth.toString().padStart(2,'0')}:${startm}`;
                   const timeB = `${endh.toString().padStart(2,'0')}:${endm}`;
                   
                   let loc = "";
                   if (ev.status === "DRIVING") loc = `${trip.pickup} -> ${trip.dropoff} Route Segment`;
                   else if (ev.status === "ON_DUTY") loc = "Origin / Destination Terminal";
                   else loc = "Rest Stop / Sleeper";
                   
                   return (
                     <div key={i} className="flex gap-4 border-b border-slate-200 pb-2">
                       <span className="w-24 font-bold text-slate-500">{timeA} - {timeB}</span>
                       <span className="w-48 font-bold">{ev.action}</span>
                       <span className="text-slate-600">Location: {loc}</span>
                     </div>
                   )
                 })}
               </div>
            </div>
            
            {/* Recap Footer */}
            <div className="border border-black p-4 text-xs font-sans mt-8 flex flex-wrap gap-8">
               <div>
                  <span className="block font-bold mb-1">Total lines 3 & 4:</span>
                  <span className="border-b border-black inline-block w-20 text-center text-sm font-bold">{totalLines.toFixed(2)} hrs</span>
               </div>
               <div>
                  <span className="block font-bold mb-1">Shipping Document:</span>
                  <span className="border-b border-black inline-block min-w-48 italic text-slate-500">BOL-{trip.id.slice(0,6).toUpperCase()}</span>
               </div>
               <div>
                  <span className="block font-bold mb-1">Driver Signature:</span>
                  <span className="border-b border-black inline-block min-w-64 font-['Brush_Script_MT'] text-lg text-blue-900 leading-none px-2">John Doe</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
