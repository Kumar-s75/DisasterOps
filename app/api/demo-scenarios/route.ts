import { type NextRequest, NextResponse } from "next/server"

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

// Simulate scenario state
const activeScenarios = new Map<string, any>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  switch (action) {
    case "scenarios":
      return NextResponse.json({ scenarios: DEMO_SCENARIOS })

    case "active":
      return NextResponse.json({
        active_scenarios: Array.from(activeScenarios.entries()).map(([id, data]) => ({
          scenario_id: id,
          ...data,
        })),
      })

    default:
      return NextResponse.json({ message: "Demo scenarios API ready" })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario_id, action, event_type } = body

    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenario_id)
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 })
    }

    switch (action) {
      case "start":
        activeScenarios.set(scenario_id, {
          started_at: new Date().toISOString(),
          status: "running",
          current_time: 0,
          events: [],
        })
        return NextResponse.json({
          message: `Started scenario: ${scenario.name}`,
          scenario: scenario,
        })

      case "stop":
        if (activeScenarios.has(scenario_id)) {
          const scenarioData = activeScenarios.get(scenario_id)
          scenarioData.status = "stopped"
          scenarioData.stopped_at = new Date().toISOString()
          activeScenarios.set(scenario_id, scenarioData)
        }
        return NextResponse.json({ message: `Stopped scenario: ${scenario.name}` })

      case "trigger_event":
        if (activeScenarios.has(scenario_id)) {
          const scenarioData = activeScenarios.get(scenario_id)
          const event = {
            type: event_type,
            timestamp: new Date().toISOString(),
            description: getEventDescription(event_type),
          }
          scenarioData.events.push(event)
          activeScenarios.set(scenario_id, scenarioData)

          return NextResponse.json({
            message: `Triggered ${event_type} event`,
            event: event,
          })
        }
        return NextResponse.json({ error: "Scenario not active" }, { status: 400 })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Demo scenario error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getEventDescription(eventType: string): string {
  switch (eventType) {
    case "road_closure":
      return "Major road closure due to debris - traffic being rerouted"
    case "traffic_surge":
      return "Heavy traffic congestion detected - estimated delays up to 30 minutes"
    case "new_disaster_zone":
      return "New emergency zone identified - immediate response required"
    case "resource_shortage":
      return "Critical resource shortage at relief center - resupply needed"
    default:
      return `Unknown event: ${eventType}`
  }
}
