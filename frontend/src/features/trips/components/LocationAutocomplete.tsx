import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import { Search, Loader2, MapPin } from "lucide-react"

interface Location {
  label: string
  lat: number
  lng: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (location: Location) => void
  placeholder?: string
  icon?: React.ReactNode
  className?: string
}

export function LocationAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  icon,
  className 
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!MAPTILER_KEY) {
      console.warn("MapTiler API key is missing. Check VITE_MAPTILER_API_KEY in .env.local")
      return
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    try {
      const resp = await axios.get(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(text)}.json`,
        {
          params: {
            key: MAPTILER_KEY,
            limit: 5,
          },
          signal: abortControllerRef.current.signal
        }
      )

      const features = resp.data.features || []
      const results = features.map((f: { place_name: string; center: number[] }) => ({
        label: f.place_name || "Unknown Location",
        lng: f.center?.[0] ?? 0,
        lat: f.center?.[1] ?? 0,
      })).filter((r: Location) => r.label !== "Unknown Location")

      setSuggestions(results)
    } catch (e: unknown) {
      if (axios.isCancel(e)) return
      console.error("Geocoding Error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [MAPTILER_KEY])

  // Debounced fetch
  useEffect(() => {
    if (!value || value.length < 2 || !isOpen) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [value, isOpen, fetchSuggestions])


  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          ) : (
            icon || <Search className="h-4 w-4" />
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-12 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-100/50 rounded-2xl pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 font-medium ${className}`}
        />
      </div>

      {isOpen && value.length >= 2 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
          {isLoading && suggestions.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Searching for "{value}"...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto py-1">
              {suggestions.map((s, i) => (
                <button
                  key={`${s.lat}-${s.lng}-${i}`}
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-start gap-3 transition-colors group/item"
                  onClick={() => {
                    onSelect(s)
                    setIsOpen(false)
                    setSuggestions([])
                  }}
                >
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-purple-100 group-hover/item:text-purple-600 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 py-0.5">
                    <p className="font-semibold text-slate-900 line-clamp-1 group-hover/item:text-purple-700 transition-colors">
                      {s.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="px-4 py-6 text-center text-slate-400">
              <p className="text-xs font-medium">No locations found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
