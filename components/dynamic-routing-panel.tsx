"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Route, Navigation, AlertTriangle, Zap, BarChart3, RefreshCw } from "lucide-react"

interface RouteInfo {
  route_id: string
  origin: string
  destination: string
  waypoints: string[]
  total_distance: number
  estimated_time: number
  priority: number
  segments: Array<{
    from: string
    to: string
    distance: number
    time: number
    road_condition: string
    traffic_level: string
  }>
}

interface NetworkStats {
  total_segments: number
  blocked_segments: number
  passable_segments: number
  active_routes: number
  traffic_distribution: Record<string, number>
  condition_distribution: Record<string, number>
  cache_size: number
}

export function DynamicRoutingPanel() {
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null)
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteInfo[]>([])
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [selectedOrigin, setSelectedOrigin] = useState<string>("")
  const [selectedDestination, setSelectedDestination] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const locations = [
    { id: "rc1", name: "Central Relief Hub" },
    { id: "rc2", name: "North Relief Station" },
    { id: "dz1", name: "Flood Zone Alpha" },
    { id: "dz2", name: "Earthquake Zone Beta" },
  ]

  useEffect(() => {
    fetchNetworkStats()
    const interval = setInterval(fetchNetworkStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNetworkStats = async () => {
    try {
      const response = await fetch("/api/dynamic-routing?action=network-stats")
      if (response.ok) {
        const stats = await response.json()
        setNetworkStats(stats)
      }
    } catch (error) {
      console.error("[v0] Error fetching network stats:", error)
    }
  }

  const calculateRoute = async () => {
    if (!selectedOrigin || !selectedDestination) return

    setIsLoading(true)
    try {
      // Get primary route
      const routeResponse = await fetch(
        `/api/dynamic-routing?action=route&origin=${selectedOrigin}&destination=${selectedDestination}`,
      )
      if (routeResponse.ok) {
        const route = await routeResponse.json()
        setActiveRoute(route)
      }

      // Get alternative routes
      const altResponse = await fetch(
        `/api/dynamic-routing?action=alternatives&origin=${selectedOrigin}&destination=${selectedDestination}`,
      )
      if (altResponse.ok) {
        const alternatives = await altResponse.json()
        setAlternativeRoutes(alternatives.alternatives || [])
      }
    } catch (error) {
      console.error("[v0] Error calculating route:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateConditions = async (type: "traffic" | "incidents") => {
    try {
      const response = await fetch(`/api/dynamic-routing?action=simulate&type=${type}`, { method: "POST" })
      if (response.ok) {
        // Recalculate current route if exists
        if (activeRoute) {
          calculateRoute()
        }
        fetchNetworkStats()
      }
    } catch (error) {
      console.error("[v0] Error simulating conditions:", error)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "bg-green-500"
      case "good":
        return "bg-green-400"
      case "fair":
        return "bg-yellow-500"
      case "poor":
        return "bg-orange-500"
      case "damaged":
        return "bg-red-500"
      case "blocked":
        return "bg-destructive"
      default:
        return "bg-gray-500"
    }
  }

  const getTrafficColor = (traffic: string) => {
    switch (traffic.toLowerCase()) {
      case "light":
        return "bg-green-500"
      case "moderate":
        return "bg-yellow-500"
      case "heavy":
        return "bg-orange-500"
      case "severe":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {/* Route Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Dynamic Route Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Origin</label>
              <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Destination</label>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={calculateRoute}
              disabled={!selectedOrigin || !selectedDestination || isLoading}
              className="flex-1"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Route className="h-4 w-4 mr-2" />}
              Calculate Route
            </Button>
            <Button variant="outline" onClick={() => simulateConditions("traffic")}>
              <Zap className="h-4 w-4 mr-2" />
              Simulate Traffic
            </Button>
            <Button variant="outline" onClick={() => simulateConditions("incidents")}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Simulate Incidents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {activeRoute && (
        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="primary">Primary Route</TabsTrigger>
            <TabsTrigger value="alternatives">Alternatives ({alternativeRoutes.length})</TabsTrigger>
            <TabsTrigger value="segments">Route Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="primary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Optimal Route</span>
                  <Badge variant="outline">{activeRoute.route_id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{activeRoute.total_distance.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">km</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{activeRoute.estimated_time.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{activeRoute.waypoints.length}</div>
                    <div className="text-sm text-muted-foreground">waypoints</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Route Path</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeRoute.waypoints.map((waypoint, index) => (
                      <div key={index} className="flex items-center">
                        <Badge variant="outline" className="text-xs">
                          {locations.find((l) => l.id === waypoint)?.name || waypoint}
                        </Badge>
                        {index < activeRoute.waypoints.length - 1 && (
                          <span className="mx-2 text-muted-foreground">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alternatives">
            <div className="space-y-3">
              {alternativeRoutes.map((route, index) => (
                <Card key={route.route_id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Alternative {index + 1}</h4>
                        <p className="text-sm text-muted-foreground">
                          {route.total_distance.toFixed(1)} km • {route.estimated_time.toFixed(1)} hours
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Select Route
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="segments">
            <Card>
              <CardHeader>
                <CardTitle>Route Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeRoute.segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {locations.find((l) => l.id === segment.from)?.name || segment.from} →{" "}
                          {locations.find((l) => l.id === segment.to)?.name || segment.to}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getConditionColor(segment.road_condition)} variant="secondary">
                          {segment.road_condition}
                        </Badge>
                        <Badge className={getTrafficColor(segment.traffic_level)} variant="secondary">
                          {segment.traffic_level}
                        </Badge>
                        <div className="text-sm text-muted-foreground">{segment.time.toFixed(1)}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Network Statistics */}
      {networkStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Network Health</div>
                <Progress
                  value={(networkStats.passable_segments / networkStats.total_segments) * 100}
                  className="mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {networkStats.passable_segments} / {networkStats.total_segments} segments passable
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Routes</div>
                <div className="text-2xl font-bold text-primary">{networkStats.active_routes}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Traffic Distribution</h4>
                <div className="space-y-1">
                  {Object.entries(networkStats.traffic_distribution).map(([level, count]) => (
                    <div key={level} className="flex justify-between text-sm">
                      <span className="capitalize">{level.toLowerCase()}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Road Conditions</h4>
                <div className="space-y-1">
                  {Object.entries(networkStats.condition_distribution).map(([condition, count]) => (
                    <div key={condition} className="flex justify-between text-sm">
                      <span className="capitalize">{condition.toLowerCase()}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
