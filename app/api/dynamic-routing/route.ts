import { type NextRequest, NextResponse } from "next/server"

// Mock dynamic routing functionality for demo
interface RouteSegment {
  from: string
  to: string
  distance: number
  time: number
  road_condition: string
  traffic_level: string
}

interface RouteInfo {
  route_id: string
  origin: string
  destination: string
  waypoints: string[]
  total_distance: number
  estimated_time: number
  priority: number
  segments: RouteSegment[]
}

// Mock network state
const networkConditions = new Map<string, { condition: string; traffic: string }>()

// Initialize with sample conditions
const initializeNetwork = () => {
  const segments = ["rc1-rc2", "rc1-dz1", "rc1-dz2", "rc2-dz1", "rc2-dz2", "dz1-dz2"]

  segments.forEach((segment) => {
    networkConditions.set(segment, {
      condition: "good",
      traffic: "light",
    })
  })
}

// Initialize on first load
if (networkConditions.size === 0) {
  initializeNetwork()
}

const getSegmentKey = (from: string, to: string) => `${from}-${to}`

const calculateMockRoute = (origin: string, destination: string): RouteInfo => {
  // Simple mock routing logic
  const waypoints = [origin, destination]
  const segmentKey = getSegmentKey(origin, destination)
  const conditions = networkConditions.get(segmentKey) || { condition: "good", traffic: "light" }

  // Base distance and time
  const baseDistance = Math.random() * 30 + 10 // 10-40 km
  const baseTime = baseDistance / 50 // Base speed 50 km/h

  // Apply condition and traffic multipliers
  const conditionMultiplier =
    {
      excellent: 0.9,
      good: 1.0,
      fair: 1.2,
      poor: 1.5,
      damaged: 2.0,
      blocked: 10.0,
    }[conditions.condition] || 1.0

  const trafficMultiplier =
    {
      light: 1.0,
      moderate: 1.3,
      heavy: 1.8,
      severe: 2.5,
    }[conditions.traffic] || 1.0

  const effectiveTime = baseTime * conditionMultiplier * trafficMultiplier

  const segments: RouteSegment[] = [
    {
      from: origin,
      to: destination,
      distance: baseDistance,
      time: effectiveTime,
      road_condition: conditions.condition,
      traffic_level: conditions.traffic,
    },
  ]

  return {
    route_id: `route_${origin}_${destination}_${Date.now()}`,
    origin,
    destination,
    waypoints,
    total_distance: baseDistance,
    estimated_time: effectiveTime,
    priority: 3,
    segments,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  switch (action) {
    case "route":
      const origin = searchParams.get("origin")
      const destination = searchParams.get("destination")

      if (!origin || !destination) {
        return NextResponse.json({ error: "Origin and destination required" }, { status: 400 })
      }

      const route = calculateMockRoute(origin, destination)
      return NextResponse.json(route)

    case "alternatives":
      const altOrigin = searchParams.get("origin")
      const altDestination = searchParams.get("destination")

      if (!altOrigin || !altDestination) {
        return NextResponse.json({ error: "Origin and destination required" }, { status: 400 })
      }

      // Generate 2-3 alternative routes with slight variations
      const alternatives = []
      for (let i = 0; i < 3; i++) {
        const altRoute = calculateMockRoute(altOrigin, altDestination)
        altRoute.route_id = `alt_${i}_${altRoute.route_id}`
        // Add some variation
        altRoute.total_distance *= 0.9 + Math.random() * 0.3
        altRoute.estimated_time *= 0.9 + Math.random() * 0.3
        alternatives.push(altRoute)
      }

      return NextResponse.json({ alternatives })

    case "network-stats":
      const totalSegments = networkConditions.size
      const blockedSegments = Array.from(networkConditions.values()).filter((c) => c.condition === "blocked").length

      const trafficDist = Array.from(networkConditions.values()).reduce(
        (acc, c) => {
          acc[c.traffic] = (acc[c.traffic] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const conditionDist = Array.from(networkConditions.values()).reduce(
        (acc, c) => {
          acc[c.condition] = (acc[c.condition] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return NextResponse.json({
        total_segments: totalSegments,
        blocked_segments: blockedSegments,
        passable_segments: totalSegments - blockedSegments,
        active_routes: Math.floor(Math.random() * 5) + 1,
        traffic_distribution: trafficDist,
        condition_distribution: conditionDist,
        cache_size: Math.floor(Math.random() * 20) + 5,
      })

    default:
      return NextResponse.json({ message: "Dynamic routing API ready" })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const type = searchParams.get("type")

  if (action === "simulate") {
    if (type === "traffic") {
      // Simulate traffic changes
      const segments = Array.from(networkConditions.keys())
      const segmentsToUpdate = segments.slice(0, Math.floor(segments.length / 2))

      segmentsToUpdate.forEach((segment) => {
        const conditions = networkConditions.get(segment)!
        const trafficLevels = ["light", "moderate", "heavy", "severe"]
        conditions.traffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)]
        networkConditions.set(segment, conditions)
      })

      return NextResponse.json({ message: "Traffic conditions simulated" })
    }

    if (type === "incidents") {
      // Simulate road incidents
      const segments = Array.from(networkConditions.keys())
      const segmentsToUpdate = segments.slice(0, Math.floor(segments.length / 3))

      segmentsToUpdate.forEach((segment) => {
        const conditions = networkConditions.get(segment)!
        const roadConditions = ["fair", "poor", "damaged", "blocked"]
        conditions.condition = roadConditions[Math.floor(Math.random() * roadConditions.length)]
        networkConditions.set(segment, conditions)
      })

      return NextResponse.json({ message: "Road incidents simulated" })
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
