import { type NextRequest, NextResponse } from "next/server"

// Mock data for demo purposes (mirrors FastAPI backend)
const mockReliefCenters = [
  {
    location: { id: "rc1", name: "Central Relief Hub", lat: 40.7128, lng: -74.006, type: "relief_center" },
    resources: [
      { id: "food", name: "Food Packages", quantity: 1000, unit: "packages" },
      { id: "water", name: "Water Bottles", quantity: 5000, unit: "bottles" },
      { id: "medical", name: "Medical Kits", quantity: 200, unit: "kits" },
    ],
    capacity: 10000,
  },
  {
    location: { id: "rc2", name: "North Relief Station", lat: 40.7589, lng: -73.9851, type: "relief_center" },
    resources: [
      { id: "food", name: "Food Packages", quantity: 800, unit: "packages" },
      { id: "water", name: "Water Bottles", quantity: 3000, unit: "bottles" },
      { id: "blankets", name: "Blankets", quantity: 500, unit: "pieces" },
    ],
    capacity: 8000,
  },
]

const mockDisasterZones = [
  {
    location: { id: "dz1", name: "Flood Zone Alpha", lat: 40.7505, lng: -73.9934, type: "disaster_zone" },
    severity: 8,
    population_affected: 5000,
    resources_needed: [
      { id: "food", name: "Food Packages", quantity: 500, unit: "packages" },
      { id: "water", name: "Water Bottles", quantity: 2000, unit: "bottles" },
    ],
    priority: 5,
  },
  {
    location: { id: "dz2", name: "Earthquake Zone Beta", lat: 40.7282, lng: -74.0776, type: "disaster_zone" },
    severity: 6,
    population_affected: 3000,
    resources_needed: [
      { id: "medical", name: "Medical Kits", quantity: 100, unit: "kits" },
      { id: "blankets", name: "Blankets", quantity: 300, unit: "pieces" },
    ],
    priority: 4,
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")

  switch (endpoint) {
    case "relief-centers":
      return NextResponse.json(mockReliefCenters)

    case "disaster-zones":
      return NextResponse.json(mockDisasterZones)

    case "optimize-allocation":
      // Simple allocation algorithm for demo
      const allocations = mockDisasterZones.map((zone, index) => ({
        relief_center_id: mockReliefCenters[index % mockReliefCenters.length].location.id,
        disaster_zone_id: zone.location.id,
        resources_allocated: zone.resources_needed,
        route: [
          {
            lat: mockReliefCenters[index % mockReliefCenters.length].location.lat,
            lng: mockReliefCenters[index % mockReliefCenters.length].location.lng,
          },
          { lat: zone.location.lat, lng: zone.location.lng },
        ],
        estimated_delivery_time: Math.random() * 2 + 0.5, // 0.5-2.5 hours
      }))
      return NextResponse.json(allocations)

    default:
      return NextResponse.json({ message: "DisasterOps API is running", timestamp: new Date().toISOString() })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const body = await request.json()

  switch (endpoint) {
    case "disaster-zones":
      mockDisasterZones.push(body)
      return NextResponse.json(body)

    case "simulate-road-closure":
      return NextResponse.json({ message: `Road between ${body.from_id} and ${body.to_id} has been closed` })

    default:
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 })
  }
}
