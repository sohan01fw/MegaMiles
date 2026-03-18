import { useEffect, useRef } from "react"
import * as maptiler from "@maptiler/sdk"
import "@maptiler/sdk/dist/maptiler-sdk.css"
import polyline from "polyline"

interface RouteMapProps {
  geometry: string
  className?: string
}

export function RouteMap({ geometry, className }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptiler.Map | null>(null)

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY

  useEffect(() => {
    if (!mapContainer.current || !MAPTILER_KEY || map.current) return

    maptiler.config.apiKey = MAPTILER_KEY

    map.current = new maptiler.Map({
      container: mapContainer.current,
      style: maptiler.MapStyle.STREETS,
      center: [0, 0],
      zoom: 1,
      navigationControl: false,
    })
  }, [MAPTILER_KEY])

  useEffect(() => {
    if (!map.current || !geometry) return

    const decoded = polyline.decode(geometry)
    // Polyline returns [lat, lng], MapLibre/MapTiler needs [lng, lat]
    const coordinates = decoded.map(([lat, lng]) => [lng, lat])

    if (coordinates.length === 0) return

    const drawRoute = () => {
      if (!map.current) return

      // Remove existing route if any
      if (map.current.getSource("route")) {
        map.current.removeLayer("route")
        map.current.removeSource("route")
      }

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      })

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#8b5cf6", // purple-500
          "line-width": 5,
          "line-opacity": 0.8,
        },
      })

      // Fit bounds to the route
      const bounds = new maptiler.LngLatBounds()
      coordinates.forEach((coord) => bounds.extend(coord as [number, number]))
      map.current.fitBounds(bounds, { padding: 50, duration: 1000 })
    }

    if (map.current.loaded()) {
      drawRoute()
    } else {
      map.current.on("load", drawRoute)
    }
  }, [geometry])

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all ${className}`}>
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Overlay Decoration */}
        <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">HGV Smart Route</span>
            </div>
        </div>
    </div>
  )
}
