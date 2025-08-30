"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Info,
  MapPin,
  Route,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  component: string
  action?: string
  icon: any
  duration: number
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to DisasterOps",
    description:
      "This guided tour will show you how to use the real-time relief resource allocation system. We'll walk through all major features and demonstrate the system's capabilities.",
    component: "overview",
    icon: Info,
    duration: 30,
  },
  {
    id: "map_overview",
    title: "Operations Map",
    description:
      "The main map displays relief centers (blue pins) and disaster zones (red triangles). Click on any location to see detailed information. The map updates in real-time as conditions change.",
    component: "map",
    icon: MapPin,
    duration: 45,
  },
  {
    id: "relief_centers",
    title: "Relief Centers",
    description:
      "Relief centers are your resource hubs. Each center has different types and quantities of supplies. The system tracks capacity and availability in real-time.",
    component: "relief_centers",
    action: "highlight_centers",
    icon: MapPin,
    duration: 40,
  },
  {
    id: "disaster_zones",
    title: "Disaster Zones",
    description:
      "Disaster zones show areas needing assistance. Color coding indicates severity levels, and priority badges show urgency. Population and resource needs are tracked for each zone.",
    component: "disaster_zones",
    action: "highlight_zones",
    icon: MapPin,
    duration: 40,
  },
  {
    id: "route_optimization",
    title: "Route Optimization",
    description:
      "Click 'Optimize Routes' to see the system calculate the most efficient delivery paths. The algorithm considers distance, traffic, road conditions, and priority levels.",
    component: "routing",
    action: "demo_optimization",
    icon: Route,
    duration: 60,
  },
  {
    id: "dynamic_routing",
    title: "Dynamic Routing",
    description:
      "The routing panel lets you plan specific routes, simulate traffic conditions, and see alternative paths. Routes adapt automatically to changing conditions.",
    component: "dynamic_routing",
    icon: Route,
    duration: 50,
  },
  {
    id: "algorithms",
    title: "Advanced Algorithms",
    description:
      "Choose from multiple optimization algorithms: Genetic Algorithm for complex scenarios, Simulated Annealing for quick solutions, or Multi-Objective for balanced results.",
    component: "algorithms",
    icon: BarChart3,
    duration: 55,
  },
  {
    id: "demo_scenarios",
    title: "Demo Scenarios",
    description:
      "Try pre-built disaster scenarios like earthquakes, hurricanes, or wildfires. Each scenario includes realistic data and demonstrates different system capabilities.",
    component: "demo_control",
    action: "show_scenarios",
    icon: Zap,
    duration: 45,
  },
  {
    id: "real_time_updates",
    title: "Real-time Updates",
    description:
      "Simulate changing conditions like road closures or traffic jams. Watch how the system automatically recalculates routes and adjusts resource allocation.",
    component: "simulation",
    action: "demo_updates",
    icon: Settings,
    duration: 50,
  },
  {
    id: "metrics_analytics",
    title: "Performance Metrics",
    description:
      "Monitor system performance with real-time metrics: response times, coverage percentages, resource efficiency, and cost effectiveness.",
    component: "metrics",
    icon: BarChart3,
    duration: 40,
  },
]

export function GuidedTour({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentTourStep = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  const startTour = () => {
    setIsActive(true)
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentTourStep.id]))
      setCurrentStep((prev) => prev + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const completeTour = () => {
    setCompletedSteps((prev) => new Set([...prev, currentTourStep.id]))
    setIsActive(false)
    onComplete?.()
  }

  const skipTour = () => {
    setIsActive(false)
  }

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  if (!isActive) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">New to DisasterOps?</h3>
              <p className="text-muted-foreground">
                Take a guided tour to learn how to use the disaster relief management system effectively.
              </p>
            </div>
            <Button onClick={startTour} className="gap-2">
              <Play className="h-4 w-4" />
              Start Guided Tour ({TOUR_STEPS.length} steps)
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <currentTourStep.icon className="h-5 w-5 text-primary" />
              {currentTourStep.title}
            </CardTitle>
            <Badge variant="outline">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="min-h-[120px]">
            <p className="text-muted-foreground leading-relaxed">{currentTourStep.description}</p>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button onClick={prevStep} disabled={currentStep === 0} variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button onClick={skipTour} variant="ghost" size="sm">
                Skip Tour
              </Button>
            </div>

            <div className="flex gap-2">
              {currentStep === TOUR_STEPS.length - 1 ? (
                <Button onClick={completeTour} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Complete Tour
                </Button>
              ) : (
                <Button onClick={nextStep} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Step Overview */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Tour Progress</h4>
            <div className="grid grid-cols-5 gap-2">
              {TOUR_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => jumpToStep(index)}
                  className={`p-2 rounded text-xs transition-colors ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : completedSteps.has(step.id)
                        ? "bg-green-100 text-green-800"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <step.icon className="h-3 w-3 mx-auto mb-1" />
                  <div className="truncate">{step.title}</div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
