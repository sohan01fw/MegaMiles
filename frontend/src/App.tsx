import { PlanTripPage } from "@/features/trips"
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <PlanTripPage />
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}

export default App
