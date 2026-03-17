import { useState } from "react"
import { Calendar, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

import { SidebarPrimary } from "../components/SidebarPrimary"
import { TripsSidebar } from "../components/TripsSidebar"
import { TripOverview } from "../components/TripOverview"
import { DashboardGreeting } from "../components/DashboardGreeting"
import { TripCreateModal } from "../components/TripCreateModal"
import { RightSidebarFreight } from "../components/RightSidebarFreight"
import type { Trip, TripFormValues } from "../types"

export function PlanTripPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"planned" | "active" | "completed">("planned")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false)

  const handleCreateTrip = (values: TripFormValues) => {
    const newTrip: Trip = {
      ...values,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: "planned",
    }
    setTrips([newTrip, ...trips])
    setSelectedTripId(newTrip.id)
    setIsModalOpen(false)
    setIsOverviewOpen(true)
  }

  const handleSelectTrip = (id: string | null) => {
    setSelectedTripId(id)
    if (id) {
      setIsOverviewOpen(true)
    }
  }

  const handleUpdateStatus = (id: string, status: "planned" | "active" | "completed") => {
    setTrips(trips.map(t => t.id === id ? { ...t, status } : t))
  }

  const selectedTrip = trips.find((t) => t.id === selectedTripId)

  return (
    <div className="flex h-screen w-full bg-[#fcfcfc] font-sans antialiased overflow-hidden text-slate-800">
      <SidebarPrimary />

      <TripsSidebar 
        trips={trips}
        selectedTripId={selectedTripId}
        setSelectedTripId={handleSelectTrip}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewTrip={() => setIsModalOpen(true)}
      />

      <main className="flex-1 flex flex-col bg-[#fcfcfc] relative">
        <header className="px-8 py-5 flex items-center justify-between border-b border-transparent">
          <div className="flex items-center gap-3" />
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              Create a Trip
            </button>

            <button className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
                alt="US"
                className="h-4 w-4 rounded-full object-cover"
              />
              English <MoreVertical className="h-4 w-4 opacity-50 -ml-1" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 lg:px-12 flex flex-col pb-24 relative">
          <div className="flex flex-col max-w-5xl mx-auto w-full pt-8 lg:pt-16 pb-12 flex-1">
            <DashboardGreeting />
          </div>
        </div>
        
        <RightSidebarFreight />
      </main>

      <TripCreateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTrip}
      />

      {selectedTrip && (
        <div 
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300",
            isOverviewOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsOverviewOpen(false)}
        >
          <div 
            className={cn(
              "bg-[#fcfcfc] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl transition-all duration-500 transform",
              isOverviewOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
               <TripOverview 
                  trip={selectedTrip} 
                  onUpdateStatus={(status) => handleUpdateStatus(selectedTrip.id, status)}
                  onClose={() => setIsOverviewOpen(false)}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
