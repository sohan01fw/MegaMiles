import { Search, MapPin, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trip } from "../types"

interface TripsSidebarProps {
  trips: Trip[]
  selectedTripId: string | null
  setSelectedTripId: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTab: "planned" | "active" | "completed"
  setActiveTab: (tab: "planned" | "active" | "completed") => void
  onNewTrip: () => void
}

export function TripsSidebar({
  trips,
  selectedTripId,
  setSelectedTripId,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onNewTrip,
}: TripsSidebarProps) {
  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dropoff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.currentLocation.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = t.status === activeTab
    
    return matchesSearch && matchesTab
  })

  const getCount = (status: "planned" | "active" | "completed") => 
    trips.filter(t => t.status === status).length

  return (
    <aside className="w-[300px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)]">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base text-slate-800 tracking-tight">Trips</h2>
          <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs font-medium">
            {trips.length}
          </span>
        </div>
        <button
          onClick={onNewTrip}
          className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          New Trip
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="flex px-4 py-2 border-b border-slate-100">
        <div className="flex gap-4 text-xs font-medium w-full">
          {(["planned", "active", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 relative text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1.5",
                activeTab === tab && "text-slate-900 border-b-2 border-purple-600"
              )}
            >
              <span className="capitalize">{tab}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500"
              )}>
                {getCount(tab)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredTrips.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 uppercase">No {activeTab} trips</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              {activeTab === 'planned' ? "Create a new trip to get started." : `You have no ${activeTab} trips at the moment.`}
            </p>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all border border-transparent duration-200",
                selectedTripId === trip.id
                  ? "bg-purple-50/50 border-purple-100 shadow-[0_2px_10px_-4px_rgba(147,51,234,0.1)]"
                  : "hover:bg-slate-50 hover:border-slate-100"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                  {trip.createdAt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-1.5">
                   <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    trip.status === "planned" && "bg-blue-50 text-blue-600 border border-blue-100",
                    trip.status === "active" && "bg-orange-50 text-orange-600 border border-orange-100",
                    trip.status === "completed" && "bg-green-50 text-green-600 border border-green-100"
                  )}>
                    {trip.status}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm font-medium">
                    {trip.cycleHoursUsed}h
                  </span>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 text-sm truncate pr-2 capitalize">
                {trip.pickup} <ArrowRight className="inline h-3 w-3 mx-0.5 text-slate-400" /> {trip.dropoff}
              </h4>
              <p className="text-xs text-slate-500 truncate mt-1 flex items-center gap-1 capitalize">
                <MapPin className="h-3 w-3" />
                {trip.currentLocation}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
