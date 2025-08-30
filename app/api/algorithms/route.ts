import { type NextRequest, NextResponse } from "next/server"

// Enhanced algorithm simulation for frontend integration
interface OptimizationRequest {
  algorithm: "genetic" | "simulated_annealing" | "multi_objective"
  relief_centers: any[]
  disaster_zones: any[]
  parameters?: {
    population_size?: number
    generations?: number
    mutation_rate?: number
    initial_temp?: number
    cooling_rate?: number
  }
}

interface OptimizationResult {
  algorithm_used: string
  total_cost: number
  coverage_score: number
  time_efficiency: number
  execution_time: number
  routes: Array<{
    from_center: string
    to_zone: string
    distance: number
    estimated_time: number
    resources_allocated: any[]
  }>
  performance_metrics: {
    zones_covered: number
    resource_utilization: number
    average_response_time: number
  }
}

// Simulate advanced optimization algorithms
function simulateGeneticAlgorithm(centers: any[], zones: any[], params: any): OptimizationResult {
  const startTime = Date.now()

  // Simulate genetic algorithm optimization
  const routes = zones.map((zone, index) => {
    const assignedCenter = centers[index % centers.length]
    const distance = Math.random() * 50 + 10 // 10-60 km
    const estimatedTime = distance / 50 // hours

    return {
      from_center: assignedCenter.location.id,
      to_zone: zone.location.id,
      distance,
      estimated_time: estimatedTime,
      resources_allocated: zone.resources_needed || [],
    }
  })

  const totalCost = routes.reduce((sum, route) => sum + route.distance, 0)
  const coverageScore = 0.85 + Math.random() * 0.1 // 85-95%
  const timeEfficiency = 1.0 / (1.0 + totalCost / routes.length)

  return {
    algorithm_used: "Genetic Algorithm",
    total_cost: totalCost,
    coverage_score: coverageScore,
    time_efficiency: timeEfficiency,
    execution_time: (Date.now() - startTime) / 1000,
    routes,
    performance_metrics: {
      zones_covered: routes.length,
      resource_utilization: 0.78,
      average_response_time: totalCost / routes.length / 50,
    },
  }
}

function simulateSimulatedAnnealing(centers: any[], zones: any[], params: any): OptimizationResult {
  const startTime = Date.now()

  // Simulate simulated annealing optimization
  const routes = zones.map((zone, index) => {
    // SA tends to find good local optima
    const assignedCenter = centers[Math.floor(Math.random() * centers.length)]
    const distance = Math.random() * 45 + 8 // Slightly better than random
    const estimatedTime = distance / 50

    return {
      from_center: assignedCenter.location.id,
      to_zone: zone.location.id,
      distance,
      estimated_time: estimatedTime,
      resources_allocated: zone.resources_needed || [],
    }
  })

  const totalCost = routes.reduce((sum, route) => sum + route.distance, 0)
  const coverageScore = 0.8 + Math.random() * 0.1 // 80-90%
  const timeEfficiency = 1.0 / (1.0 + totalCost / routes.length)

  return {
    algorithm_used: "Simulated Annealing",
    total_cost: totalCost,
    coverage_score: coverageScore,
    time_efficiency: timeEfficiency,
    execution_time: (Date.now() - startTime) / 1000,
    routes,
    performance_metrics: {
      zones_covered: routes.length,
      resource_utilization: 0.72,
      average_response_time: totalCost / routes.length / 50,
    },
  }
}

function simulateMultiObjective(centers: any[], zones: any[], params: any): OptimizationResult {
  const startTime = Date.now()

  // Simulate multi-objective optimization (NSGA-II)
  const routes = zones.map((zone, index) => {
    // Multi-objective tends to balance all criteria
    const priorityWeight = zone.priority || 3
    const bestCenterIndex = zones.indexOf(zone) % centers.length
    const assignedCenter = centers[bestCenterIndex]

    // Distance influenced by priority
    const distance = ((Math.random() * 40 + 5) * (6 - priorityWeight)) / 5
    const estimatedTime = distance / 50

    return {
      from_center: assignedCenter.location.id,
      to_zone: zone.location.id,
      distance,
      estimated_time: estimatedTime,
      resources_allocated: zone.resources_needed || [],
    }
  })

  const totalCost = routes.reduce((sum, route) => sum + route.distance, 0)
  const coverageScore = 0.88 + Math.random() * 0.08 // 88-96%
  const timeEfficiency = 1.0 / (1.0 + totalCost / routes.length)

  return {
    algorithm_used: "Multi-Objective (NSGA-II)",
    total_cost: totalCost,
    coverage_score: coverageScore,
    time_efficiency: timeEfficiency,
    execution_time: (Date.now() - startTime) / 1000,
    routes,
    performance_metrics: {
      zones_covered: routes.length,
      resource_utilization: 0.85,
      average_response_time: totalCost / routes.length / 50,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OptimizationRequest = await request.json()
    const { algorithm, relief_centers, disaster_zones, parameters = {} } = body

    let result: OptimizationResult

    switch (algorithm) {
      case "genetic":
        result = simulateGeneticAlgorithm(relief_centers, disaster_zones, parameters)
        break
      case "simulated_annealing":
        result = simulateSimulatedAnnealing(relief_centers, disaster_zones, parameters)
        break
      case "multi_objective":
        result = simulateMultiObjective(relief_centers, disaster_zones, parameters)
        break
      default:
        return NextResponse.json({ error: "Invalid algorithm specified" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Algorithm optimization error:", error)
    return NextResponse.json({ error: "Optimization failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "algorithms") {
    return NextResponse.json({
      available_algorithms: [
        {
          id: "genetic",
          name: "Genetic Algorithm",
          description: "Evolutionary optimization for complex resource allocation",
          parameters: ["population_size", "generations", "mutation_rate"],
          best_for: "Large-scale optimization with multiple constraints",
        },
        {
          id: "simulated_annealing",
          name: "Simulated Annealing",
          description: "Temperature-based optimization for local optima avoidance",
          parameters: ["initial_temp", "cooling_rate", "min_temp"],
          best_for: "Quick optimization with good local solutions",
        },
        {
          id: "multi_objective",
          name: "Multi-Objective (NSGA-II)",
          description: "Pareto-optimal solutions for multiple competing objectives",
          parameters: ["population_size", "generations"],
          best_for: "Balancing cost, coverage, and response time",
        },
      ],
    })
  }

  return NextResponse.json({ message: "Algorithm optimization API ready" })
}
