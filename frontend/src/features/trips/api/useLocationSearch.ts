import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export interface LocationSuggestion {
  label: string
  lat: number
  lng: number
}

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY

const fetchLocationSuggestions = async (
  query: string,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> => {
  if (!MAPTILER_KEY) {
    console.warn("MapTiler API key is missing. Check VITE_MAPTILER_API_KEY in .env.local")
    return []
  }

  const resp = await axios.get(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
    {
      params: {
        key: MAPTILER_KEY,
        limit: 5,
      },
      signal,
    }
  )

  const features = resp.data.features || []
  return features
    .map((f: { place_name: string; center: number[] }) => ({
      label: f.place_name || "Unknown Location",
      lng: f.center?.[0] ?? 0,
      lat: f.center?.[1] ?? 0,
    }))
    .filter((r: LocationSuggestion) => r.label !== "Unknown Location")
}

export function useLocationSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["locations", query],
    queryFn: ({ signal }) => fetchLocationSuggestions(query, signal),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Minimize retries for responsive search
  })
}
