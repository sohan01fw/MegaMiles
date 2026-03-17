import { Compass, MapPin, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { tripSchema, type TripFormValues } from "../types"

interface TripCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: TripFormValues) => void
}

export function TripCreateModal({ isOpen, onClose, onSubmit }: TripCreateModalProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      currentLocation: "",
      pickup: "",
      dropoff: "",
      cycleHoursUsed: "0",
    },
  })

  const handleSubmit = (values: TripFormValues) => {
    onSubmit(values)
    form.reset()
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Current Geo</p>
                    <FormControl>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                        <input 
                          placeholder="City, State..." 
                          className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-100/50 rounded-2xl pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400"
                          {...field} 
                        />
                      </div>
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
                        <div className="relative group">
                          <Compass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                          <input 
                            placeholder="Pickup location..." 
                            className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-100/50 rounded-2xl pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400"
                            {...field} 
                          />
                        </div>
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
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                          <input 
                            placeholder="Dropoff point..." 
                            className="w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-100/50 rounded-2xl pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400"
                            {...field} 
                          />
                        </div>
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
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 h-12 bg-slate-900 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
              >
                Plan Trip
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
