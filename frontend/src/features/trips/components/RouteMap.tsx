import { useEffect, useRef } from "react"
import * as maptiler from "@maptiler/sdk"
import "@maptiler/sdk/dist/maptiler-sdk.css"
import polyline from "polyline"
import type { TripLog } from "../types"

interface RouteMapProps {
  geometry: string
  logs?: TripLog[]
  pickupCoord?: { lat: number; lng: number }
  dropoffCoord?: { lat: number; lng: number }
  className?: string
}

export function RouteMap({ geometry, logs, pickupCoord, dropoffCoord, className }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maptiler.Map | null>(null)
  const markersRef = useRef<maptiler.Marker[]>([])

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

      const currentMap = map.current
      if (!currentMap) return

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add Current Location Marker
      const currentLocMarker = new maptiler.Marker({ color: "#3b82f6" }) // Blue
        .setLngLat(coordinates[0] as [number, number])
        .setPopup(new maptiler.Popup({ offset: 25 }).setHTML('<div style="padding: 4px;"><h3 style="font-weight: bold; margin-bottom: 2px;">Start Position</h3></div>'))
        .addTo(currentMap)
      markersRef.current.push(currentLocMarker)

      // Add Start Marker (Pickup)
      const p_pos: [number, number] = pickupCoord ? [pickupCoord.lng, pickupCoord.lat] : (coordinates[Math.floor(coordinates.length * 0.1)] as [number, number]);
      const startMarker = new maptiler.Marker({ color: "#10b981" }) // Green
        .setLngLat(p_pos)
        .setPopup(new maptiler.Popup({ offset: 25 }).setHTML('<div style="padding: 4px;"><h3 style="font-weight: bold; margin-bottom: 2px;">Pickup Point</h3><p style="font-size: 12px; color: #666;">Load Location</p></div>'))
        .addTo(currentMap)
      markersRef.current.push(startMarker)

      // Add End Marker (Dropoff)
      const d_pos: [number, number] = dropoffCoord ? [dropoffCoord.lng, dropoffCoord.lat] : (coordinates[coordinates.length - 1] as [number, number]);
      const endMarker = new maptiler.Marker({ color: "#ef4444" }) // Red
        .setLngLat(d_pos)
        .setPopup(new maptiler.Popup({ offset: 25 }).setHTML('<div style="padding: 4px;"><h3 style="font-weight: bold; margin-bottom: 2px;">Dropoff Point</h3><p style="font-size: 12px; color: #666;">Route Destination</p></div>'))
        .addTo(currentMap)
      markersRef.current.push(endMarker)

      // Add Break / Sleep Markers
      if (logs && logs.length > 0) {
        const totalDrivingTime = logs
          .filter(log => log.action === "Driving")
          .reduce((acc, curr) => acc + curr.duration_hrs, 0)
        
        let cumulativeDriving = 0
        
        logs.forEach(log => {
          if (log.action === "Driving") {
            cumulativeDriving += log.duration_hrs
          } else {
            // Find coordinate fraction
            const fraction = totalDrivingTime > 0 ? cumulativeDriving / totalDrivingTime : 0
            const index = Math.min(Math.floor(fraction * coordinates.length), coordinates.length - 1)
            const coord = coordinates[index]
            
            if (coord && currentMap) {
              const isSleep = log.action.includes("Sleep")
              const markerColor = isSleep ? "#f97316" : "#eab308" // Orange for sleep, Yellow for break
              const actionLabel = isSleep ? "Sleep & Fuel Stop" : "Fuel & Rest Break"
              
              const popupHTML = `
                <div style="padding: 4px;">
                  <h3 style="font-weight: bold; margin-bottom: 2px;">${actionLabel}</h3>
                  <p style="font-size: 12px; color: #666;">Day ${log.day} • ${log.duration_hrs}h Duration</p>
                </div>
              `
              
              const marker = new maptiler.Marker({ color: markerColor })
                .setLngLat(coord as [number, number])
                .setPopup(new maptiler.Popup({ offset: 25 }).setHTML(popupHTML))
                .addTo(currentMap)
              markersRef.current.push(marker)
            }
          }
        })
      }
    }

    if (map.current.loaded()) {
      drawRoute()
    } else {
      map.current.on("load", drawRoute)
    }
  }, [geometry, logs, pickupCoord, dropoffCoord])

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
