"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Truck, AlertTriangle, RefreshCw } from "lucide-react"
import { DynamicRoutingPanel } from "@/components/dynamic-routing-panel"

// Mock Leaflet implementation for demo (replace with actual Leaflet in production)
interface Location {
  id: string
  name: string
  lat: number
  lng: number
  type: string
}

interface Resource {
  id: string
  name: string
  quantity: number
  unit: string
}

interface ReliefCenter {
  location: Location
  resources: Resource[]
  capacity: number
}

interface DisasterZone {
  location: Location
  severity: number
  population_affected: number
  resources_needed: Resource[]
  priority: number
}

interface AllocationResult {
  relief_center_id: string
  disaster_zone_id: string
  resources_allocated: Resource[]
  route: { lat: number; lng: number }[]
  estimated_delivery_time: number
}

export function DisasterOpsMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [reliefCenters, setReliefCenters] = useState<ReliefCenter[]>([])
  const [disasterZones, setDisasterZones] = useState<DisasterZone[]>([])
  const [allocations, setAllocations] = useState<AllocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Fetch data from API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [centersRes, zonesRes] = await Promise.all([
        fetch("/api/disaster-ops?endpoint=relief-centers"),
        fetch("/api/disaster-ops?endpoint=disaster-zones"),
      ])

      const centers = await centersRes.json()
      const zones = await zonesRes.json()

      setReliefCenters(centers)
      setDisasterZones(zones)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    }
  }

  const optimizeAllocation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/disaster-ops?endpoint=optimize-allocation")
      const results = await response.json()
      setAllocations(results)
      console.log("[v0] Optimization results:", results)
    } catch (error) {
      console.error("[v0] Error optimizing allocation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return "bg-destructive"
    if (severity >= 6) return "bg-orange-500"
    if (severity >= 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPriorityBadge = (priority: number) => {
    if (priority >= 5) return <Badge variant="destructive">Critical</Badge>
    if (priority >= 4) return <Badge variant="secondary">High</Badge>
    if (priority >= 3) return <Badge className="bg-yellow-500">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      {/* Map Container */}
      <div className="lg:col-span-3">
        <Card className="h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Real-Time Operations Map</h2>
            <Button onClick={optimizeAllocation} disabled={isLoading} className="gap-2">
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              Optimize Routes
            </Button>
          </div>

          {/* Mock Map Display */}
          <div
            ref={mapRef}
            className="relative h-full bg-muted rounded-lg overflow-hidden min-h-[400px]"
            style={{
              backgroundImage: `url('/satellite-map-view-of-new-york-city-with-streets-a.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Relief Centers */}
            {reliefCenters.map((center, index) => (
              <div
                key={center.location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${20 + index * 25}%`,
                  top: `${30 + index * 15}%`,
                }}
                onClick={() => setSelectedLocation(center.location)}
              >
                <div className="relief-center-marker w-6 h-6 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="mt-1 text-xs font-medium bg-card px-2 py-1 rounded shadow-sm">
                  {center.location.name}
                </div>
              </div>
            ))}

            {/* Disaster Zones */}
            {disasterZones.map((zone, index) => (
              <div
                key={zone.location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${60 + index * 20}%`,
                  top: `${40 + index * 20}%`,
                }}
                onClick={() => setSelectedLocation(zone.location)}
              >
                <div
                  className={`disaster-zone-marker w-8 h-8 flex items-center justify-center ${getSeverityColor(zone.severity)}`}
                >
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="mt-1 text-xs font-medium bg-card px-2 py-1 rounded shadow-sm">{zone.location.name}</div>
              </div>
            ))}

            {/* Routes */}
            {allocations.map((allocation, index) => (
              <svg key={`route-${index}`} className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={`M ${20 + (index % 2) * 25}% ${30 + (index % 2) * 15}% Q ${40 + index * 10}% ${20 + index * 10}% ${60 + index * 20}% ${40 + index * 20}%`}
                  className="route-line"
                  fill="none"
                />
              </svg>
            ))}
          </div>
        </Card>
      </div>

      {/* Information Panel */}
      <div className="space-y-4">
        {/* Selected Location Info */}
        {selectedLocation && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">{selectedLocation.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Type: {selectedLocation.type.replace("_", " ").toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground">
              Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>
          </Card>
        )}

        {/* Relief Centers Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Relief Centers ({reliefCenters.length})
          </h3>
          <div className="space-y-2">
            {reliefCenters.map((center) => (
              <div key={center.location.id} className="text-sm">
                <div className="font-medium">{center.location.name}</div>
                <div className="text-muted-foreground">Resources: {center.resources.length} types</div>
                <div className="text-xs text-muted-foreground">Capacity: {center.capacity.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Disaster Zones Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Active Zones ({disasterZones.length})
          </h3>
          <div className="space-y-3">
            {disasterZones.map((zone) => (
              <div key={zone.location.id} className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{zone.location.name}</div>
                  {getPriorityBadge(zone.priority)}
                </div>
                <div className="text-muted-foreground">Severity: {zone.severity}/10</div>
                <div className="text-muted-foreground">Affected: {zone.population_affected.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  Resources needed: {zone.resources_needed.length} types
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Allocations */}
        {allocations.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              Active Routes ({allocations.length})
            </h3>
            <div className="space-y-2">
              {allocations.map((allocation, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">Route {index + 1}</div>
                  <div className="text-muted-foreground">ETA: {allocation.estimated_delivery_time.toFixed(1)}h</div>
                  <div className="text-xs text-muted-foreground">
                    Resources: {allocation.resources_allocated.length} types
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Dynamic Routing Panel */}
        <DynamicRoutingPanel />
      </div>
    </div>
  )
}
