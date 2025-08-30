"""
Demonstration script for advanced resource allocation algorithms
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import networkx as nx
import numpy as np
import matplotlib.pyplot as plt
from advanced_algorithms import GeneticAlgorithmOptimizer, SimulatedAnnealingOptimizer, MultiObjectiveOptimizer
import time
import json

# Mock data structures to match the backend models
class MockLocation:
    def __init__(self, id, name, lat, lng, type):
        self.id = id
        self.name = name
        self.lat = lat
        self.lng = lng
        self.type = type

class MockResource:
    def __init__(self, id, name, quantity, unit):
        self.id = id
        self.name = name
        self.quantity = quantity
        self.unit = unit

class MockReliefCenter:
    def __init__(self, location, resources, capacity):
        self.location = location
        self.resources = resources
        self.capacity = capacity

class MockDisasterZone:
    def __init__(self, location, severity, population_affected, resources_needed, priority):
        self.location = location
        self.severity = severity
        self.population_affected = population_affected
        self.resources_needed = resources_needed
        self.priority = priority

def create_sample_data():
    """Create sample data for algorithm testing"""
    
    # Relief Centers
    relief_centers = [
        MockReliefCenter(
            location=MockLocation("rc1", "Central Relief Hub", 40.7128, -74.0060, "relief_center"),
            resources=[
                MockResource("food", "Food Packages", 1000, "packages"),
                MockResource("water", "Water Bottles", 5000, "bottles"),
                MockResource("medical", "Medical Kits", 200, "kits")
            ],
            capacity=10000
        ),
        MockReliefCenter(
            location=MockLocation("rc2", "North Relief Station", 40.7589, -73.9851, "relief_center"),
            resources=[
                MockResource("food", "Food Packages", 800, "packages"),
                MockResource("water", "Water Bottles", 3000, "bottles"),
                MockResource("blankets", "Blankets", 500, "pieces")
            ],
            capacity=8000
        ),
        MockReliefCenter(
            location=MockLocation("rc3", "South Relief Depot", 40.6892, -74.0445, "relief_center"),
            resources=[
                MockResource("medical", "Medical Kits", 300, "kits"),
                MockResource("blankets", "Blankets", 800, "pieces"),
                MockResource("tools", "Emergency Tools", 150, "sets")
            ],
            capacity=6000
        )
    ]
    
    # Disaster Zones
    disaster_zones = [
        MockDisasterZone(
            location=MockLocation("dz1", "Flood Zone Alpha", 40.7505, -73.9934, "disaster_zone"),
            severity=8,
            population_affected=5000,
            resources_needed=[
                MockResource("food", "Food Packages", 500, "packages"),
                MockResource("water", "Water Bottles", 2000, "bottles")
            ],
            priority=5
        ),
        MockDisasterZone(
            location=MockLocation("dz2", "Earthquake Zone Beta", 40.7282, -74.0776, "disaster_zone"),
            severity=6,
            population_affected=3000,
            resources_needed=[
                MockResource("medical", "Medical Kits", 100, "kits"),
                MockResource("blankets", "Blankets", 300, "pieces")
            ],
            priority=4
        ),
        MockDisasterZone(
            location=MockLocation("dz3", "Hurricane Zone Gamma", 40.6782, -73.9442, "disaster_zone"),
            severity=9,
            population_affected=8000,
            resources_needed=[
                MockResource("food", "Food Packages", 800, "packages"),
                MockResource("water", "Water Bottles", 3000, "bottles"),
                MockResource("medical", "Medical Kits", 200, "kits")
            ],
            priority=5
        ),
        MockDisasterZone(
            location=MockLocation("dz4", "Fire Zone Delta", 40.7614, -73.9776, "disaster_zone"),
            severity=7,
            population_affected=2000,
            resources_needed=[
                MockResource("medical", "Medical Kits", 80, "kits"),
                MockResource("blankets", "Blankets", 200, "pieces")
            ],
            priority=3
        )
    ]
    
    # Create road network
    road_network = nx.Graph()
    all_locations = [rc.location for rc in relief_centers] + [dz.location for dz in disaster_zones]
    
    for i, loc1 in enumerate(all_locations):
        for j, loc2 in enumerate(all_locations):
            if i != j:
                # Calculate distance using simplified formula
                distance = np.sqrt((loc1.lat - loc2.lat)**2 + (loc1.lng - loc2.lng)**2) * 111  # Rough km conversion
                travel_time = distance / 50  # Assume 50 km/h average speed
                road_network.add_edge(loc1.id, loc2.id, weight=travel_time, distance=distance)
    
    return relief_centers, disaster_zones, road_network

def benchmark_algorithms():
    """Benchmark different optimization algorithms"""
    print("🚀 DisasterOps Algorithm Benchmarking")
    print("=" * 50)
    
    # Create sample data
    relief_centers, disaster_zones, road_network = create_sample_data()
    
    print(f"📊 Test Setup:")
    print(f"   Relief Centers: {len(relief_centers)}")
    print(f"   Disaster Zones: {len(disaster_zones)}")
    print(f"   Road Network Edges: {road_network.number_of_edges()}")
    print()
    
    results = {}
    
    # Test Genetic Algorithm
    print("🧬 Testing Genetic Algorithm...")
    ga_optimizer = GeneticAlgorithmOptimizer(population_size=30, generations=50, mutation_rate=0.1)
    start_time = time.time()
    ga_solution = ga_optimizer.optimize_allocation(relief_centers, disaster_zones, road_network)
    ga_time = time.time() - start_time
    
    results['genetic_algorithm'] = {
        'total_cost': ga_solution.total_cost,
        'coverage_score': ga_solution.coverage_score,
        'time_efficiency': ga_solution.time_efficiency,
        'execution_time': ga_time,
        'routes': len(ga_solution.routes)
    }
    
    print(f"   ✅ Completed in {ga_time:.2f}s")
    print(f"   📈 Coverage Score: {ga_solution.coverage_score:.4f}")
    print(f"   💰 Total Cost: {ga_solution.total_cost:.2f}")
    print()
    
    # Test Simulated Annealing
    print("🌡️  Testing Simulated Annealing...")
    sa_optimizer = SimulatedAnnealingOptimizer(initial_temp=1000, cooling_rate=0.95)
    start_time = time.time()
    sa_solution = sa_optimizer.optimize(relief_centers, disaster_zones, road_network)
    sa_time = time.time() - start_time
    
    results['simulated_annealing'] = {
        'total_cost': sa_solution.total_cost,
        'coverage_score': sa_solution.coverage_score,
        'time_efficiency': sa_solution.time_efficiency,
        'execution_time': sa_time,
        'routes': len(sa_solution.routes)
    }
    
    print(f"   ✅ Completed in {sa_time:.2f}s")
    print(f"   📈 Coverage Score: {sa_solution.coverage_score:.4f}")
    print(f"   💰 Total Cost: {sa_solution.total_cost:.2f}")
    print()
    
    # Test Multi-Objective Optimization
    print("🎯 Testing Multi-Objective Optimization...")
    mo_optimizer = MultiObjectiveOptimizer(population_size=30, generations=30)
    start_time = time.time()
    mo_solutions = mo_optimizer.optimize(relief_centers, disaster_zones, road_network)
    mo_time = time.time() - start_time
    
    # Select best solution from Pareto front
    best_mo_solution = max(mo_solutions, key=lambda s: s.coverage_score - s.total_cost * 0.1)
    
    results['multi_objective'] = {
        'total_cost': best_mo_solution.total_cost,
        'coverage_score': best_mo_solution.coverage_score,
        'time_efficiency': best_mo_solution.time_efficiency,
        'execution_time': mo_time,
        'routes': len(best_mo_solution.routes),
        'pareto_solutions': len(mo_solutions)
    }
    
    print(f"   ✅ Completed in {mo_time:.2f}s")
    print(f"   📈 Best Coverage Score: {best_mo_solution.coverage_score:.4f}")
    print(f"   💰 Best Total Cost: {best_mo_solution.total_cost:.2f}")
    print(f"   🎯 Pareto Solutions Found: {len(mo_solutions)}")
    print()
    
    # Summary comparison
    print("📊 Algorithm Comparison Summary")
    print("-" * 50)
    print(f"{'Algorithm':<20} {'Cost':<10} {'Coverage':<10} {'Time(s)':<8}")
    print("-" * 50)
    
    for alg_name, result in results.items():
        print(f"{alg_name.replace('_', ' ').title():<20} {result['total_cost']:<10.2f} {result['coverage_score']:<10.4f} {result['execution_time']:<8.2f}")
    
    print()
    
    # Find best algorithm for each metric
    best_cost = min(results.items(), key=lambda x: x[1]['total_cost'])
    best_coverage = max(results.items(), key=lambda x: x[1]['coverage_score'])
    fastest = min(results.items(), key=lambda x: x[1]['execution_time'])
    
    print("🏆 Best Performers:")
    print(f"   💰 Lowest Cost: {best_cost[0].replace('_', ' ').title()} ({best_cost[1]['total_cost']:.2f})")
    print(f"   📈 Best Coverage: {best_coverage[0].replace('_', ' ').title()} ({best_coverage[1]['coverage_score']:.4f})")
    print(f"   ⚡ Fastest: {fastest[0].replace('_', ' ').title()} ({fastest[1]['execution_time']:.2f}s)")
    
    # Save results to JSON
    with open('algorithm_benchmark_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Results saved to 'algorithm_benchmark_results.json'")
    
    return results

def demonstrate_real_time_optimization():
    """Demonstrate real-time optimization with changing conditions"""
    print("\n🔄 Real-Time Optimization Demonstration")
    print("=" * 50)
    
    relief_centers, disaster_zones, road_network = create_sample_data()
    
    # Initial optimization
    print("📍 Initial Optimization...")
    ga_optimizer = GeneticAlgorithmOptimizer(population_size=20, generations=30)
    initial_solution = ga_optimizer.optimize_allocation(relief_centers, disaster_zones, road_network)
    
    print(f"   Initial Cost: {initial_solution.total_cost:.2f}")
    print(f"   Initial Coverage: {initial_solution.coverage_score:.4f}")
    
    # Simulate road closure
    print("\n🚧 Simulating Road Closure...")
    # Remove some edges to simulate road closures
    edges_to_remove = list(road_network.edges())[:3]
    for edge in edges_to_remove:
        road_network.remove_edge(edge[0], edge[1])
    
    print(f"   Closed {len(edges_to_remove)} roads")
    
    # Re-optimize
    print("🔄 Re-optimizing with road closures...")
    updated_solution = ga_optimizer.optimize_allocation(relief_centers, disaster_zones, road_network)
    
    print(f"   Updated Cost: {updated_solution.total_cost:.2f}")
    print(f"   Updated Coverage: {updated_solution.coverage_score:.4f}")
    print(f"   Cost Change: {updated_solution.total_cost - initial_solution.total_cost:+.2f}")
    
    # Add new disaster zone
    print("\n🆘 Adding Emergency Disaster Zone...")
    new_zone = MockDisasterZone(
        location=MockLocation("dz_emergency", "Emergency Zone", 40.7200, -74.0100, "disaster_zone"),
        severity=10,
        population_affected=10000,
        resources_needed=[
            MockResource("food", "Food Packages", 1000, "packages"),
            MockResource("water", "Water Bottles", 4000, "bottles"),
            MockResource("medical", "Medical Kits", 300, "kits")
        ],
        priority=5
    )
    
    disaster_zones.append(new_zone)
    
    # Add connections for new zone
    for rc in relief_centers:
        distance = np.sqrt((new_zone.location.lat - rc.location.lat)**2 + (new_zone.location.lng - rc.location.lng)**2) * 111
        travel_time = distance / 50
        road_network.add_edge(new_zone.location.id, rc.location.id, weight=travel_time, distance=distance)
    
    # Re-optimize with new zone
    print("🔄 Re-optimizing with new emergency zone...")
    final_solution = ga_optimizer.optimize_allocation(relief_centers, disaster_zones, road_network)
    
    print(f"   Final Cost: {final_solution.total_cost:.2f}")
    print(f"   Final Coverage: {final_solution.coverage_score:.4f}")
    print(f"   Total Zones Covered: {len(final_solution.routes)}")
    
    print("\n✅ Real-time optimization demonstration completed!")

if __name__ == "__main__":
    print("🌟 DisasterOps Advanced Algorithm Demonstration")
    print("=" * 60)
    
    # Run benchmarks
    benchmark_results = benchmark_algorithms()
    
    # Demonstrate real-time optimization
    demonstrate_real_time_optimization()
    
    print("\n🎉 All demonstrations completed successfully!")
    print("Check 'algorithm_benchmark_results.json' for detailed results.")
