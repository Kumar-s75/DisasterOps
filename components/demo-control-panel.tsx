"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Settings,
  BarChart3,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  Truck,
  Download,
  Share,
} from "lucide-react"

interface DemoScenario {
  id: string
  name: string
  description: string
  disaster_type: string
  severity: number
  affected_population: number
  duration_hours: number
  relief_centers: number
  disaster_zones: number
}

interface DemoMetrics {
  response_time: number
  coverage_percentage: number
  resource_efficiency: number
  routes_optimized: number
  people_helped: number
  cost_effectiveness: number
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "earthquake_sf",
    name: "San Francisco Earthquake",
    description: "7.2 magnitude earthquake affecting downtown San Francisco with multiple collapsed buildings",
    disaster_type: "earthquake",
    severity: 8,
    affected_population: 50000,
    duration_hours: 72,
    relief_centers: 4,
    disaster_zones: 6,
  },
  {
    id: "hurricane_miami",
    name: "Hurricane Miami",
    description: "Category 4 hurricane making landfall in Miami with widespread flooding and power outages",
    disaster_type: "hurricane",
    severity: 9,
    affected_population: 120000,
    duration_hours: 96,
    relief_centers: 6,
    disaster_zones: 8,
  },
  {
    id: "wildfire_ca",
    name: "California Wildfire",
    description: "Massive wildfire spreading across Northern California requiring mass evacuations",
    disaster_type: "wildfire",
    severity: 7,
    affected_population: 25000,
    duration_hours: 120,
    relief_centers: 3,
    disaster_zones: 5,
  },
  {
    id: "flood_houston",
    name: "Houston Flooding",
    description: "Severe flooding from tropical storm affecting multiple Houston neighborhoods",
    disaster_type: "flood",
    severity: 6,
    affected_population: 80000,
    duration_hours: 48,
    relief_centers: 5,
    disaster_zones: 7,
  },
]

export function DemoControlPanel() {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState([1])
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [showMetrics, setShowMetrics] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [demoMetrics, setDemoMetrics] = useState<DemoMetrics>({
    response_time: 0,
    coverage_percentage: 0,
    resource_efficiency: 0,
    routes_optimized: 0,
    people_helped: 0,
    cost_effectiveness: 0,
  })

  const currentScenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenario)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && currentScenario) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + simulationSpeed[0]
          if (newTime >= currentScenario.duration_hours) {
            setIsRunning(false)
            return currentScenario.duration_hours
          }
          return newTime
        })

        // Update metrics during simulation
        updateMetrics()
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, simulationSpeed, currentScenario])

  const updateMetrics = () => {
    setDemoMetrics((prev) => ({
      response_time: Math.min(prev.response_time + Math.random() * 0.5, 2.5),
      coverage_percentage: Math.min(prev.coverage_percentage + Math.random() * 2, 95),
      resource_efficiency: Math.min(prev.resource_efficiency + Math.random() * 1.5, 88),
      routes_optimized: prev.routes_optimized + Math.floor(Math.random() * 3),
      people_helped: prev.people_helped + Math.floor(Math.random() * 100),
      cost_effectiveness: Math.min(prev.cost_effectiveness + Math.random() * 1, 92),
    }))
  }

  const startScenario = async () => {
    if (!selectedScenario) return

    setIsRunning(true)
    setCurrentTime(0)
    setDemoMetrics({
      response_time: 0,
      coverage_percentage: 0,
      resource_efficiency: 0,
      routes_optimized: 0,
      people_helped: 0,
      cost_effectiveness: 0,
    })

    // Initialize scenario via API
    try {
      await fetch("/api/demo-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: selectedScenario, action: "start" }),
      })
    } catch (error) {
      console.error("[v0] Error starting scenario:", error)
    }
  }

  const pauseScenario = () => {
    setIsRunning(false)
  }

  const resetScenario = () => {
    setIsRunning(false)
    setCurrentTime(0)
    setDemoMetrics({
      response_time: 0,
      coverage_percentage: 0,
      resource_efficiency: 0,
      routes_optimized: 0,
      people_helped: 0,
      cost_effectiveness: 0,
    })
  }

  const triggerEvent = async (eventType: string) => {
    try {
      await fetch("/api/demo-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: selectedScenario,
          action: "trigger_event",
          event_type: eventType,
        }),
      })
    } catch (error) {
      console.error("[v0] Error triggering event:", error)
    }
  }

  const exportResults = () => {
    const results = {
      scenario: currentScenario,
      metrics: demoMetrics,
      simulation_time: currentTime,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `disaster-ops-demo-${selectedScenario}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Demo Scenario Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Disaster Scenario</label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a scenario to simulate" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_SCENARIOS.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {scenario.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentScenario && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{currentScenario.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{currentScenario.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span>Severity: {currentScenario.severity}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{currentScenario.affected_population.toLocaleString()} affected</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>{currentScenario.relief_centers} relief centers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span>{currentScenario.duration_hours}h duration</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={startScenario} disabled={!selectedScenario || isRunning} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
            <Button onClick={pauseScenario} disabled={!isRunning} variant="outline">
              <Pause className="h-4 w-4" />
            </Button>
            <Button onClick={resetScenario} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      {currentScenario && (
        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="controls">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Simulation Speed: {simulationSpeed[0]}x</label>
                  <Slider
                    value={simulationSpeed}
                    onValueChange={setSimulationSpeed}
                    max={10}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto-optimize Routes</label>
                  <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Real-time Metrics</label>
                  <Switch checked={showMetrics} onCheckedChange={setShowMetrics} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Simulation Progress</label>
                  <Progress value={(currentTime / currentScenario.duration_hours) * 100} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{currentTime.toFixed(1)}h</span>
                    <span>{currentScenario.duration_hours}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{demoMetrics.response_time.toFixed(1)}h</div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{demoMetrics.coverage_percentage.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Coverage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {demoMetrics.resource_efficiency.toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Resource Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {demoMetrics.people_helped.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">People Helped</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Routes Optimized</span>
                      <span>{demoMetrics.routes_optimized}</span>
                    </div>
                    <Progress value={Math.min((demoMetrics.routes_optimized / 50) * 100, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cost Effectiveness</span>
                      <span>{demoMetrics.cost_effectiveness.toFixed(0)}%</span>
                    </div>
                    <Progress value={demoMetrics.cost_effectiveness} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Trigger Demo Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => triggerEvent("road_closure")} variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Simulate Road Closure
                </Button>
                <Button
                  onClick={() => triggerEvent("traffic_surge")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Create Traffic Congestion
                </Button>
                <Button
                  onClick={() => triggerEvent("new_disaster_zone")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Add Emergency Zone
                </Button>
                <Button
                  onClick={() => triggerEvent("resource_shortage")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Simulate Resource Shortage
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Export and Share */}
      {currentScenario && (
        <Card>
          <CardHeader>
            <CardTitle>Demo Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={exportResults} variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Share className="h-4 w-4 mr-2" />
                Share Demo
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Export simulation data and metrics for analysis
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
