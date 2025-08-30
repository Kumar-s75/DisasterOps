"""
Advanced algorithms for resource allocation and routing optimization
"""
import networkx as nx
import numpy as np
from typing import List, Dict, Tuple
from pulp import LpMaximize, LpProblem, LpVariable, lpSum, LpStatus, value
import heapq

class ResourceAllocator:
    """Implements various resource allocation algorithms"""
    
    def __init__(self, relief_centers: List, disaster_zones: List, road_network: nx.Graph):
        self.relief_centers = relief_centers
        self.disaster_zones = disaster_zones
        self.road_network = road_network
    
    def min_cost_flow_allocation(self) -> Dict:
        """
        Implement minimum cost flow algorithm for optimal resource allocation
        """
        # Create flow network
        flow_network = nx.DiGraph()
        
        # Add source node
        flow_network.add_node("source", demand=-sum(sum(r.quantity for r in rc.resources) for rc in self.relief_centers))
        
        # Add relief centers as intermediate nodes
        for rc in self.relief_centers:
            flow_network.add_node(f"rc_{rc.location.id}", demand=0)
            total_resources = sum(r.quantity for r in rc.resources)
            flow_network.add_edge("source", f"rc_{rc.location.id}", capacity=total_resources, weight=0)
        
        # Add disaster zones as sink nodes
        for dz in self.disaster_zones:
            demand = sum(r.quantity for r in dz.resources_needed)
            flow_network.add_node(f"dz_{dz.location.id}", demand=demand)
            
            # Connect relief centers to disaster zones
            for rc in self.relief_centers:
                try:
                    cost = nx.shortest_path_length(self.road_network, rc.location.id, dz.location.id, weight='weight')
                    capacity = min(sum(r.quantity for r in rc.resources), demand)
                    flow_network.add_edge(f"rc_{rc.location.id}", f"dz_{dz.location.id}", 
                                        capacity=capacity, weight=cost * dz.priority)
                except nx.NetworkXNoPath:
                    continue
        
        # Solve min cost flow
        try:
            flow_cost, flow_dict = nx.network_simplex(flow_network)
            return {"cost": flow_cost, "flow": flow_dict}
        except nx.NetworkXUnfeasible:
            return {"error": "No feasible solution found"}
    
    def linear_programming_allocation(self) -> Dict:
        """
        Use linear programming for optimal resource allocation
        """
        # Create LP problem
        prob = LpProblem("Resource_Allocation", LpMaximize)
        
        # Decision variables: x[i][j] = amount of resources from center i to zone j
        allocation_vars = {}
        for i, rc in enumerate(self.relief_centers):
            for j, dz in enumerate(self.disaster_zones):
                allocation_vars[(i, j)] = LpVariable(f"x_{i}_{j}", lowBound=0)
        
        # Objective: Maximize coverage weighted by priority
        objective = []
        for i, rc in enumerate(self.relief_centers):
            for j, dz in enumerate(self.disaster_zones):
                try:
                    distance = nx.shortest_path_length(self.road_network, rc.location.id, dz.location.id, weight='weight')
                    priority_weight = dz.priority / (1 + distance)  # Higher priority, lower distance = better
                    objective.append(priority_weight * allocation_vars[(i, j)])
                except nx.NetworkXNoPath:
                    continue
        
        prob += lpSum(objective)
        
        # Constraints
        # Supply constraints: don't exceed relief center capacity
        for i, rc in enumerate(self.relief_centers):
            total_supply = sum(r.quantity for r in rc.resources)
            prob += lpSum([allocation_vars[(i, j)] for j in range(len(self.disaster_zones))]) <= total_supply
        
        # Demand constraints: try to meet disaster zone needs
        for j, dz in enumerate(self.disaster_zones):
            total_demand = sum(r.quantity for r in dz.resources_needed)
            prob += lpSum([allocation_vars[(i, j)] for i in range(len(self.relief_centers))]) <= total_demand
        
        # Solve
        prob.solve()
        
        if LpStatus[prob.status] == "Optimal":
            solution = {}
            for i, rc in enumerate(self.relief_centers):
                for j, dz in enumerate(self.disaster_zones):
                    if value(allocation_vars[(i, j)]) > 0:
                        solution[f"{rc.location.id}_to_{dz.location.id}"] = value(allocation_vars[(i, j)])
            return {"status": "optimal", "allocation": solution, "objective_value": value(prob.objective)}
        else:
            return {"status": "infeasible", "message": "No optimal solution found"}

class DynamicRouter:
    """Implements dynamic routing algorithms"""
    
    def __init__(self, road_network: nx.Graph):
        self.road_network = road_network
        self.traffic_conditions = {}
    
    def dijkstra_with_updates(self, start: str, end: str, blocked_roads: List[Tuple[str, str]] = None) -> Dict:
        """
        Dijkstra's algorithm with real-time road condition updates
        """
        # Create a copy of the network
        temp_network = self.road_network.copy()
        
        # Remove blocked roads
        if blocked_roads:
            for road in blocked_roads:
                if temp_network.has_edge(road[0], road[1]):
                    temp_network.remove_edge(road[0], road[1])
        
        try:
            path = nx.shortest_path(temp_network, start, end, weight='weight')
            distance = nx.shortest_path_length(temp_network, start, end, weight='weight')
            return {
                "path": path,
                "distance": distance,
                "status": "success"
            }
        except nx.NetworkXNoPath:
            return {
                "path": [],
                "distance": float('inf'),
                "status": "no_path_found"
            }
    
    def a_star_routing(self, start: str, end: str, locations_dict: Dict) -> Dict:
        """
        A* algorithm for routing with heuristic
        """
        def heuristic(node1: str, node2: str) -> float:
            if node1 in locations_dict and node2 in locations_dict:
                loc1 = locations_dict[node1]
                loc2 = locations_dict[node2]
                # Euclidean distance as heuristic
                return np.sqrt((loc1['lat'] - loc2['lat'])**2 + (loc1['lng'] - loc2['lng'])**2)
            return 0
        
        try:
            path = nx.astar_path(self.road_network, start, end, heuristic=heuristic, weight='weight')
            distance = nx.astar_path_length(self.road_network, start, end, heuristic=heuristic, weight='weight')
            return {
                "path": path,
                "distance": distance,
                "algorithm": "A*",
                "status": "success"
            }
        except nx.NetworkXNoPath:
            return {
                "path": [],
                "distance": float('inf'),
                "algorithm": "A*",
                "status": "no_path_found"
            }
    
    def multi_objective_routing(self, start: str, end: str, objectives: Dict[str, float]) -> Dict:
        """
        Multi-objective routing considering time, distance, and road conditions
        """
        # Modify edge weights based on multiple objectives
        temp_network = self.road_network.copy()
        
        for u, v, data in temp_network.edges(data=True):
            # Combine objectives: time, distance, road condition
            time_weight = data.get('weight', 1) * objectives.get('time', 1)
            distance_weight = data.get('distance', 1) * objectives.get('distance', 0.5)
            condition_weight = self.traffic_conditions.get((u, v), 1) * objectives.get('condition', 0.3)
            
            temp_network[u][v]['combined_weight'] = time_weight + distance_weight + condition_weight
        
        try:
            path = nx.shortest_path(temp_network, start, end, weight='combined_weight')
            total_weight = nx.shortest_path_length(temp_network, start, end, weight='combined_weight')
            return {
                "path": path,
                "total_weight": total_weight,
                "objectives_used": objectives,
                "status": "success"
            }
        except nx.NetworkXNoPath:
            return {
                "path": [],
                "total_weight": float('inf'),
                "objectives_used": objectives,
                "status": "no_path_found"
            }
    
    def update_traffic_conditions(self, road: Tuple[str, str], condition_factor: float):
        """Update traffic conditions for dynamic routing"""
        self.traffic_conditions[road] = condition_factor
        # Also update reverse direction
        self.traffic_conditions[(road[1], road[0])] = condition_factor

class DemandPredictor:
    """ML-based demand prediction (simplified implementation)"""
    
    def __init__(self):
        self.historical_data = []
    
    def predict_demand_hotspots(self, current_conditions: Dict) -> List[Dict]:
        """
        Predict demand hotspots using simplified ML approach
        """
        # Simplified prediction based on severity and population
        hotspots = []
        
        for zone_data in current_conditions.get('disaster_zones', []):
            severity = zone_data.get('severity', 1)
            population = zone_data.get('population_affected', 0)
            
            # Simple scoring algorithm (replace with actual ML model)
            demand_score = (severity * 0.6 + (population / 1000) * 0.4) * np.random.uniform(0.8, 1.2)
            
            if demand_score > 5:  # Threshold for high demand
                hotspots.append({
                    'zone_id': zone_data.get('id'),
                    'predicted_demand_score': demand_score,
                    'recommended_resources': self._calculate_resource_needs(severity, population),
                    'urgency_level': 'high' if demand_score > 7 else 'medium'
                })
        
        return sorted(hotspots, key=lambda x: x['predicted_demand_score'], reverse=True)
    
    def _calculate_resource_needs(self, severity: int, population: int) -> Dict:
        """Calculate estimated resource needs based on severity and population"""
        base_food_ratio = 0.3  # 30% of population needs food aid
        base_water_ratio = 0.5  # 50% needs water
        base_medical_ratio = 0.1  # 10% needs medical aid
        
        severity_multiplier = severity / 10
        
        return {
            'food_packages': int(population * base_food_ratio * severity_multiplier),
            'water_bottles': int(population * base_water_ratio * severity_multiplier * 3),  # 3 bottles per person
            'medical_kits': int(population * base_medical_ratio * severity_multiplier),
            'blankets': int(population * 0.2 * severity_multiplier)  # 20% need blankets
        }
