"""
Advanced Resource Allocation Algorithms for DisasterOps
Implements state-of-the-art optimization techniques for disaster relief
"""
import networkx as nx
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import heapq
from scipy.optimize import minimize
import random
from datetime import datetime, timedelta

class Priority(Enum):
    CRITICAL = 5
    HIGH = 4
    MEDIUM = 3
    LOW = 2
    MINIMAL = 1

@dataclass
class ResourceRequest:
    resource_type: str
    quantity: int
    urgency: Priority
    deadline: datetime
    location_id: str

@dataclass
class AllocationSolution:
    allocations: Dict[str, Dict[str, int]]  # center_id -> {resource_type: quantity}
    routes: List[Tuple[str, str]]  # (from_center, to_zone)
    total_cost: float
    coverage_score: float
    time_efficiency: float

class GeneticAlgorithmOptimizer:
    """Genetic Algorithm for complex resource allocation optimization"""
    
    def __init__(self, population_size: int = 50, generations: int = 100, mutation_rate: float = 0.1):
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
    
    def optimize_allocation(self, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> AllocationSolution:
        """Use genetic algorithm to find optimal resource allocation"""
        
        # Initialize population
        population = self._initialize_population(relief_centers, disaster_zones)
        
        best_solution = None
        best_fitness = float('-inf')
        
        for generation in range(self.generations):
            # Evaluate fitness for each individual
            fitness_scores = []
            for individual in population:
                fitness = self._evaluate_fitness(individual, relief_centers, disaster_zones, road_network)
                fitness_scores.append(fitness)
                
                if fitness > best_fitness:
                    best_fitness = fitness
                    best_solution = individual
            
            # Selection, crossover, and mutation
            population = self._evolve_population(population, fitness_scores)
            
            # Log progress every 20 generations
            if generation % 20 == 0:
                print(f"Generation {generation}: Best fitness = {best_fitness:.4f}")
        
        return self._convert_to_solution(best_solution, relief_centers, disaster_zones, road_network)
    
    def _initialize_population(self, relief_centers: List, disaster_zones: List) -> List[Dict]:
        """Initialize random population of allocation strategies"""
        population = []
        
        for _ in range(self.population_size):
            individual = {}
            for zone in disaster_zones:
                # Randomly assign a relief center to each disaster zone
                assigned_center = random.choice(relief_centers)
                individual[zone.location.id] = assigned_center.location.id
            population.append(individual)
        
        return population
    
    def _evaluate_fitness(self, individual: Dict, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> float:
        """Evaluate fitness of an allocation strategy"""
        total_distance = 0
        coverage_score = 0
        resource_efficiency = 0
        
        for zone_id, center_id in individual.items():
            zone = next(z for z in disaster_zones if z.location.id == zone_id)
            center = next(c for c in relief_centers if c.location.id == center_id)
            
            try:
                # Calculate distance cost
                distance = nx.shortest_path_length(road_network, center_id, zone_id, weight='weight')
                total_distance += distance
                
                # Calculate coverage score based on priority and resources
                priority_weight = zone.priority / 5.0
                resource_match = self._calculate_resource_match(center, zone)
                coverage_score += priority_weight * resource_match
                
                # Resource efficiency (how well center resources match zone needs)
                resource_efficiency += resource_match
                
            except nx.NetworkXNoPath:
                # Penalize unreachable assignments
                total_distance += 1000
        
        # Fitness function: maximize coverage and efficiency, minimize distance
        fitness = (coverage_score * 0.5 + resource_efficiency * 0.3) - (total_distance * 0.2)
        return fitness
    
    def _calculate_resource_match(self, center, zone) -> float:
        """Calculate how well a center's resources match a zone's needs"""
        total_match = 0
        total_needed = len(zone.resources_needed)
        
        for needed_resource in zone.resources_needed:
            center_resource = next((r for r in center.resources if r.id == needed_resource.id), None)
            if center_resource and center_resource.quantity >= needed_resource.quantity:
                total_match += 1
        
        return total_match / max(total_needed, 1)
    
    def _evolve_population(self, population: List[Dict], fitness_scores: List[float]) -> List[Dict]:
        """Evolve population through selection, crossover, and mutation"""
        new_population = []
        
        # Keep best individuals (elitism)
        elite_count = int(0.1 * self.population_size)
        elite_indices = np.argsort(fitness_scores)[-elite_count:]
        for idx in elite_indices:
            new_population.append(population[idx].copy())
        
        # Generate rest through crossover and mutation
        while len(new_population) < self.population_size:
            # Tournament selection
            parent1 = self._tournament_selection(population, fitness_scores)
            parent2 = self._tournament_selection(population, fitness_scores)
            
            # Crossover
            child = self._crossover(parent1, parent2)
            
            # Mutation
            if random.random() < self.mutation_rate:
                child = self._mutate(child, population)
            
            new_population.append(child)
        
        return new_population
    
    def _tournament_selection(self, population: List[Dict], fitness_scores: List[float]) -> Dict:
        """Select individual using tournament selection"""
        tournament_size = 3
        tournament_indices = random.sample(range(len(population)), tournament_size)
        best_idx = max(tournament_indices, key=lambda i: fitness_scores[i])
        return population[best_idx]
    
    def _crossover(self, parent1: Dict, parent2: Dict) -> Dict:
        """Create child through crossover of two parents"""
        child = {}
        for zone_id in parent1.keys():
            # Randomly choose assignment from either parent
            child[zone_id] = random.choice([parent1[zone_id], parent2[zone_id]])
        return child
    
    def _mutate(self, individual: Dict, population: List[Dict]) -> Dict:
        """Mutate individual by randomly changing some assignments"""
        mutated = individual.copy()
        zone_ids = list(individual.keys())
        
        # Mutate 1-2 random assignments
        num_mutations = random.randint(1, 2)
        for _ in range(num_mutations):
            zone_id = random.choice(zone_ids)
            # Get all possible center assignments from population
            possible_centers = set()
            for ind in population:
                possible_centers.add(ind[zone_id])
            mutated[zone_id] = random.choice(list(possible_centers))
        
        return mutated
    
    def _convert_to_solution(self, best_individual: Dict, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> AllocationSolution:
        """Convert best individual to AllocationSolution format"""
        allocations = {}
        routes = []
        total_cost = 0
        
        for zone_id, center_id in best_individual.items():
            routes.append((center_id, zone_id))
            
            # Calculate cost
            try:
                cost = nx.shortest_path_length(road_network, center_id, zone_id, weight='weight')
                total_cost += cost
            except nx.NetworkXNoPath:
                total_cost += 1000
        
        # Calculate coverage and efficiency scores
        coverage_score = self._evaluate_fitness(best_individual, relief_centers, disaster_zones, road_network)
        time_efficiency = 1.0 / (1.0 + total_cost / len(routes))
        
        return AllocationSolution(
            allocations=allocations,
            routes=routes,
            total_cost=total_cost,
            coverage_score=coverage_score,
            time_efficiency=time_efficiency
        )

class SimulatedAnnealingOptimizer:
    """Simulated Annealing for resource allocation optimization"""
    
    def __init__(self, initial_temp: float = 1000, cooling_rate: float = 0.95, min_temp: float = 1):
        self.initial_temp = initial_temp
        self.cooling_rate = cooling_rate
        self.min_temp = min_temp
    
    def optimize(self, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> AllocationSolution:
        """Use simulated annealing to optimize resource allocation"""
        
        # Initialize with random solution
        current_solution = self._random_solution(relief_centers, disaster_zones)
        current_cost = self._calculate_cost(current_solution, relief_centers, disaster_zones, road_network)
        
        best_solution = current_solution.copy()
        best_cost = current_cost
        
        temperature = self.initial_temp
        
        while temperature > self.min_temp:
            # Generate neighbor solution
            neighbor_solution = self._generate_neighbor(current_solution, relief_centers)
            neighbor_cost = self._calculate_cost(neighbor_solution, relief_centers, disaster_zones, road_network)
            
            # Accept or reject neighbor
            if self._accept_solution(current_cost, neighbor_cost, temperature):
                current_solution = neighbor_solution
                current_cost = neighbor_cost
                
                # Update best solution
                if neighbor_cost < best_cost:
                    best_solution = neighbor_solution.copy()
                    best_cost = neighbor_cost
            
            # Cool down
            temperature *= self.cooling_rate
        
        return self._convert_to_allocation_solution(best_solution, relief_centers, disaster_zones, road_network)
    
    def _random_solution(self, relief_centers: List, disaster_zones: List) -> Dict:
        """Generate random initial solution"""
        solution = {}
        for zone in disaster_zones:
            solution[zone.location.id] = random.choice(relief_centers).location.id
        return solution
    
    def _generate_neighbor(self, solution: Dict, relief_centers: List) -> Dict:
        """Generate neighbor solution by changing 1-2 assignments"""
        neighbor = solution.copy()
        zone_ids = list(solution.keys())
        
        # Change 1-2 random assignments
        num_changes = random.randint(1, 2)
        for _ in range(num_changes):
            zone_id = random.choice(zone_ids)
            neighbor[zone_id] = random.choice(relief_centers).location.id
        
        return neighbor
    
    def _calculate_cost(self, solution: Dict, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> float:
        """Calculate total cost of a solution"""
        total_cost = 0
        
        for zone_id, center_id in solution.items():
            try:
                distance = nx.shortest_path_length(road_network, center_id, zone_id, weight='weight')
                zone = next(z for z in disaster_zones if z.location.id == zone_id)
                
                # Cost includes distance and priority weight
                priority_multiplier = (6 - zone.priority) / 5.0  # Higher priority = lower cost multiplier
                total_cost += distance * priority_multiplier
                
            except nx.NetworkXNoPath:
                total_cost += 10000  # High penalty for unreachable zones
        
        return total_cost
    
    def _accept_solution(self, current_cost: float, neighbor_cost: float, temperature: float) -> bool:
        """Decide whether to accept neighbor solution"""
        if neighbor_cost < current_cost:
            return True
        
        # Accept worse solution with probability based on temperature
        probability = np.exp(-(neighbor_cost - current_cost) / temperature)
        return random.random() < probability
    
    def _convert_to_allocation_solution(self, solution: Dict, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> AllocationSolution:
        """Convert solution to AllocationSolution format"""
        routes = [(center_id, zone_id) for zone_id, center_id in solution.items()]
        total_cost = self._calculate_cost(solution, relief_centers, disaster_zones, road_network)
        
        return AllocationSolution(
            allocations={},
            routes=routes,
            total_cost=total_cost,
            coverage_score=1.0 / (1.0 + total_cost),
            time_efficiency=1.0 / (1.0 + total_cost / len(routes))
        )

class MultiObjectiveOptimizer:
    """Multi-objective optimization using NSGA-II algorithm"""
    
    def __init__(self, population_size: int = 50, generations: int = 100):
        self.population_size = population_size
        self.generations = generations
    
    def optimize(self, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> List[AllocationSolution]:
        """Return Pareto-optimal solutions for multiple objectives"""
        
        # Initialize population
        population = self._initialize_population(relief_centers, disaster_zones)
        
        for generation in range(self.generations):
            # Evaluate objectives for each individual
            objectives = []
            for individual in population:
                obj = self._evaluate_objectives(individual, relief_centers, disaster_zones, road_network)
                objectives.append(obj)
            
            # Non-dominated sorting and crowding distance
            fronts = self._non_dominated_sort(objectives)
            population = self._select_next_generation(population, objectives, fronts)
        
        # Return Pareto front solutions
        final_objectives = [self._evaluate_objectives(ind, relief_centers, disaster_zones, road_network) for ind in population]
        pareto_front = self._get_pareto_front(population, final_objectives)
        
        return [self._convert_to_solution(sol, relief_centers, disaster_zones, road_network) for sol in pareto_front]
    
    def _initialize_population(self, relief_centers: List, disaster_zones: List) -> List[Dict]:
        """Initialize random population"""
        population = []
        for _ in range(self.population_size):
            individual = {}
            for zone in disaster_zones:
                individual[zone.location.id] = random.choice(relief_centers).location.id
            population.append(individual)
        return population
    
    def _evaluate_objectives(self, individual: Dict, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> Tuple[float, float, float]:
        """Evaluate multiple objectives: minimize cost, maximize coverage, maximize speed"""
        total_cost = 0
        coverage_score = 0
        speed_score = 0
        
        for zone_id, center_id in individual.items():
            zone = next(z for z in disaster_zones if z.location.id == zone_id)
            center = next(c for c in relief_centers if c.location.id == center_id)
            
            try:
                distance = nx.shortest_path_length(road_network, center_id, zone_id, weight='weight')
                total_cost += distance
                
                # Coverage based on resource availability and priority
                resource_match = sum(1 for needed in zone.resources_needed 
                                   if any(r.id == needed.id and r.quantity >= needed.quantity for r in center.resources))
                coverage_score += (resource_match / len(zone.resources_needed)) * zone.priority
                
                # Speed score (inverse of distance)
                speed_score += 1.0 / (1.0 + distance)
                
            except nx.NetworkXNoPath:
                total_cost += 1000
        
        return (total_cost, -coverage_score, -speed_score)  # Minimize all objectives
    
    def _non_dominated_sort(self, objectives: List[Tuple[float, float, float]]) -> List[List[int]]:
        """Perform non-dominated sorting"""
        n = len(objectives)
        domination_count = [0] * n
        dominated_solutions = [[] for _ in range(n)]
        fronts = [[]]
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    if self._dominates(objectives[i], objectives[j]):
                        dominated_solutions[i].append(j)
                    elif self._dominates(objectives[j], objectives[i]):
                        domination_count[i] += 1
            
            if domination_count[i] == 0:
                fronts[0].append(i)
        
        front_idx = 0
        while len(fronts[front_idx]) > 0:
            next_front = []
            for i in fronts[front_idx]:
                for j in dominated_solutions[i]:
                    domination_count[j] -= 1
                    if domination_count[j] == 0:
                        next_front.append(j)
            front_idx += 1
            fronts.append(next_front)
        
        return fronts[:-1]  # Remove empty last front
    
    def _dominates(self, obj1: Tuple[float, float, float], obj2: Tuple[float, float, float]) -> bool:
        """Check if obj1 dominates obj2"""
        return all(o1 <= o2 for o1, o2 in zip(obj1, obj2)) and any(o1 < o2 for o1, o2 in zip(obj1, obj2))
    
    def _select_next_generation(self, population: List[Dict], objectives: List[Tuple], fronts: List[List[int]]) -> List[Dict]:
        """Select next generation using NSGA-II selection"""
        new_population = []
        
        for front in fronts:
            if len(new_population) + len(front) <= self.population_size:
                new_population.extend([population[i] for i in front])
            else:
                # Calculate crowding distance and select best
                remaining = self.population_size - len(new_population)
                crowding_distances = self._calculate_crowding_distance([objectives[i] for i in front])
                sorted_indices = sorted(range(len(front)), key=lambda i: crowding_distances[i], reverse=True)
                new_population.extend([population[front[sorted_indices[i]]] for i in range(remaining)])
                break
        
        return new_population
    
    def _calculate_crowding_distance(self, front_objectives: List[Tuple]) -> List[float]:
        """Calculate crowding distance for a front"""
        n = len(front_objectives)
        distances = [0.0] * n
        
        for obj_idx in range(len(front_objectives[0])):
            # Sort by objective value
            sorted_indices = sorted(range(n), key=lambda i: front_objectives[i][obj_idx])
            
            # Set boundary points to infinity
            distances[sorted_indices[0]] = float('inf')
            distances[sorted_indices[-1]] = float('inf')
            
            # Calculate distances for intermediate points
            obj_range = front_objectives[sorted_indices[-1]][obj_idx] - front_objectives[sorted_indices[0]][obj_idx]
            if obj_range > 0:
                for i in range(1, n - 1):
                    distances[sorted_indices[i]] += (
                        front_objectives[sorted_indices[i + 1]][obj_idx] - 
                        front_objectives[sorted_indices[i - 1]][obj_idx]
                    ) / obj_range
        
        return distances
    
    def _get_pareto_front(self, population: List[Dict], objectives: List[Tuple]) -> List[Dict]:
        """Get Pareto front solutions"""
        fronts = self._non_dominated_sort(objectives)
        return [population[i] for i in fronts[0]]
    
    def _convert_to_solution(self, individual: Dict, relief_centers: List, disaster_zones: List, road_network: nx.Graph) -> AllocationSolution:
        """Convert individual to AllocationSolution"""
        routes = [(center_id, zone_id) for zone_id, center_id in individual.items()]
        objectives = self._evaluate_objectives(individual, relief_centers, disaster_zones, road_network)
        
        return AllocationSolution(
            allocations={},
            routes=routes,
            total_cost=objectives[0],
            coverage_score=-objectives[1],
            time_efficiency=-objectives[2]
        )
