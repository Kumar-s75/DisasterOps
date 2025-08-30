"""
Dynamic Routing System for DisasterOps
Real-time route optimization with adaptive algorithms
"""
import networkx as nx
import numpy as np
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import heapq
import asyncio
import json
from collections import defaultdict
import threading
import time

class RoadCondition(Enum):
    EXCELLENT = 1.0
    GOOD = 1.2
    FAIR = 1.5
    POOR = 2.0
    DAMAGED = 3.0
    BLOCKED = float('inf')

class TrafficLevel(Enum):
    LIGHT = 1.0
    MODERATE = 1.3
    HEAVY = 1.8
    SEVERE = 2.5

@dataclass
class RouteSegment:
    from_node: str
    to_node: str
    base_distance: float
    base_time: float
    road_condition: RoadCondition = RoadCondition.GOOD
    traffic_level: TrafficLevel = TrafficLevel.LIGHT
    last_updated: datetime = field(default_factory=datetime.now)
    
    @property
    def effective_time(self) -> float:
        """Calculate effective travel time considering conditions"""
        return self.base_time * self.road_condition.value * self.traffic_level.value
    
    @property
    def is_passable(self) -> bool:
        """Check if route segment is passable"""
        return self.road_condition != RoadCondition.BLOCKED

@dataclass
class DynamicRoute:
    route_id: str
    origin: str
    destination: str
    waypoints: List[str]
    segments: List[RouteSegment]
    total_distance: float
    estimated_time: float
    priority: int
    created_at: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)
    
    def recalculate_metrics(self):
        """Recalculate route metrics based on current conditions"""
        self.total_distance = sum(seg.base_distance for seg in self.segments)
        self.estimated_time = sum(seg.effective_time for seg in self.segments)
        self.last_updated = datetime.now()

class DynamicRoutingEngine:
    """Advanced dynamic routing engine with real-time optimization"""
    
    def __init__(self):
        self.road_network = nx.DiGraph()
        self.route_segments: Dict[Tuple[str, str], RouteSegment] = {}
        self.active_routes: Dict[str, DynamicRoute] = {}
        self.traffic_history: Dict[Tuple[str, str], List[Tuple[datetime, TrafficLevel]]] = defaultdict(list)
        self.condition_history: Dict[Tuple[str, str], List[Tuple[datetime, RoadCondition]]] = defaultdict(list)
        self.route_cache: Dict[Tuple[str, str], List[str]] = {}
        self.cache_expiry: Dict[Tuple[str, str], datetime] = {}
        self.update_lock = threading.Lock()
        
    def initialize_network(self, locations: List[Dict], connections: List[Dict]):
        """Initialize the road network with locations and connections"""
        # Add nodes
        for location in locations:
            self.road_network.add_node(
                location['id'],
                lat=location['lat'],
                lng=location['lng'],
                type=location['type'],
                name=location.get('name', '')
            )
        
        # Add edges with route segments
        for connection in connections:
            from_id = connection['from']
            to_id = connection['to']
            distance = connection['distance']
            base_time = connection.get('time', distance / 50)  # Default 50 km/h
            
            segment = RouteSegment(
                from_node=from_id,
                to_node=to_id,
                base_distance=distance,
                base_time=base_time
            )
            
            self.route_segments[(from_id, to_id)] = segment
            self.road_network.add_edge(
                from_id, to_id,
                weight=segment.effective_time,
                distance=distance,
                segment=segment
            )
    
    def update_road_condition(self, from_node: str, to_node: str, condition: RoadCondition):
        """Update road condition for a specific segment"""
        with self.update_lock:
            segment_key = (from_node, to_node)
            if segment_key in self.route_segments:
                segment = self.route_segments[segment_key]
                old_condition = segment.road_condition
                segment.road_condition = condition
                segment.last_updated = datetime.now()
                
                # Update network edge weight
                if self.road_network.has_edge(from_node, to_node):
                    if condition == RoadCondition.BLOCKED:
                        self.road_network.remove_edge(from_node, to_node)
                    else:
                        self.road_network[from_node][to_node]['weight'] = segment.effective_time
                
                # Record in history
                self.condition_history[segment_key].append((datetime.now(), condition))
                
                # Invalidate affected route cache
                self._invalidate_cache_for_segment(from_node, to_node)
                
                # Trigger route recalculation for affected routes
                self._recalculate_affected_routes(from_node, to_node)
                
                print(f"[Dynamic Routing] Road condition updated: {from_node} -> {to_node}: {old_condition.name} -> {condition.name}")
    
    def update_traffic_level(self, from_node: str, to_node: str, traffic: TrafficLevel):
        """Update traffic level for a specific segment"""
        with self.update_lock:
            segment_key = (from_node, to_node)
            if segment_key in self.route_segments:
                segment = self.route_segments[segment_key]
                old_traffic = segment.traffic_level
                segment.traffic_level = traffic
                segment.last_updated = datetime.now()
                
                # Update network edge weight
                if self.road_network.has_edge(from_node, to_node):
                    self.road_network[from_node][to_node]['weight'] = segment.effective_time
                
                # Record in history
                self.traffic_history[segment_key].append((datetime.now(), traffic))
                
                # Invalidate affected route cache
                self._invalidate_cache_for_segment(from_node, to_node)
                
                print(f"[Dynamic Routing] Traffic updated: {from_node} -> {to_node}: {old_traffic.name} -> {traffic.name}")
    
    def find_optimal_route(self, origin: str, destination: str, priority: int = 3, 
                          avoid_nodes: Set[str] = None, max_detour: float = 2.0) -> Optional[DynamicRoute]:
        """Find optimal route considering current conditions"""
        avoid_nodes = avoid_nodes or set()
        
        # Check cache first
        cache_key = (origin, destination)
        if (cache_key in self.route_cache and 
            cache_key in self.cache_expiry and 
            datetime.now() < self.cache_expiry[cache_key]):
            waypoints = self.route_cache[cache_key]
        else:
            # Calculate new route
            waypoints = self._calculate_route(origin, destination, avoid_nodes, priority)
            if not waypoints:
                return None
            
            # Cache the result
            self.route_cache[cache_key] = waypoints
            self.cache_expiry[cache_key] = datetime.now() + timedelta(minutes=5)
        
        # Build route segments
        segments = []
        total_distance = 0
        estimated_time = 0
        
        for i in range(len(waypoints) - 1):
            from_node = waypoints[i]
            to_node = waypoints[i + 1]
            
            segment_key = (from_node, to_node)
            if segment_key in self.route_segments:
                segment = self.route_segments[segment_key]
                segments.append(segment)
                total_distance += segment.base_distance
                estimated_time += segment.effective_time
        
        # Create dynamic route
        route = DynamicRoute(
            route_id=f"route_{origin}_{destination}_{int(time.time())}",
            origin=origin,
            destination=destination,
            waypoints=waypoints,
            segments=segments,
            total_distance=total_distance,
            estimated_time=estimated_time,
            priority=priority
        )
        
        # Store active route
        self.active_routes[route.route_id] = route
        
        return route
    
    def _calculate_route(self, origin: str, destination: str, avoid_nodes: Set[str], priority: int) -> List[str]:
        """Calculate route using appropriate algorithm based on priority"""
        if priority >= 4:  # High priority - use A* with heuristic
            return self._astar_route(origin, destination, avoid_nodes)
        else:  # Normal priority - use Dijkstra
            return self._dijkstra_route(origin, destination, avoid_nodes)
    
    def _astar_route(self, origin: str, destination: str, avoid_nodes: Set[str]) -> List[str]:
        """A* algorithm with geographic heuristic"""
        def heuristic(node1: str, node2: str) -> float:
            if node1 not in self.road_network.nodes or node2 not in self.road_network.nodes:
                return 0
            
            n1_data = self.road_network.nodes[node1]
            n2_data = self.road_network.nodes[node2]
            
            # Euclidean distance as heuristic
            lat_diff = n1_data['lat'] - n2_data['lat']
            lng_diff = n1_data['lng'] - n2_data['lng']
            return np.sqrt(lat_diff**2 + lng_diff**2) * 111  # Rough km conversion
        
        try:
            # Create temporary graph without avoided nodes
            temp_graph = self.road_network.copy()
            for node in avoid_nodes:
                if node in temp_graph:
                    temp_graph.remove_node(node)
            
            path = nx.astar_path(temp_graph, origin, destination, 
                               heuristic=heuristic, weight='weight')
            return path
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []
    
    def _dijkstra_route(self, origin: str, destination: str, avoid_nodes: Set[str]) -> List[str]:
        """Dijkstra's algorithm for shortest path"""
        try:
            # Create temporary graph without avoided nodes
            temp_graph = self.road_network.copy()
            for node in avoid_nodes:
                if node in temp_graph:
                    temp_graph.remove_node(node)
            
            path = nx.shortest_path(temp_graph, origin, destination, weight='weight')
            return path
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []
    
    def find_alternative_routes(self, origin: str, destination: str, num_alternatives: int = 3) -> List[DynamicRoute]:
        """Find multiple alternative routes"""
        alternatives = []
        avoid_edges = set()
        
        for i in range(num_alternatives):
            # Create temporary graph without avoided edges
            temp_graph = self.road_network.copy()
            for edge in avoid_edges:
                if temp_graph.has_edge(edge[0], edge[1]):
                    temp_graph.remove_edge(edge[0], edge[1])
            
            try:
                path = nx.shortest_path(temp_graph, origin, destination, weight='weight')
                
                # Create route
                route = self._create_route_from_path(path, f"alt_{i}")
                if route:
                    alternatives.append(route)
                    
                    # Add edges from this path to avoid list for next iteration
                    for j in range(len(path) - 1):
                        avoid_edges.add((path[j], path[j + 1]))
                
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                break
        
        return alternatives
    
    def _create_route_from_path(self, path: List[str], route_suffix: str) -> Optional[DynamicRoute]:
        """Create DynamicRoute from path"""
        if len(path) < 2:
            return None
        
        segments = []
        total_distance = 0
        estimated_time = 0
        
        for i in range(len(path) - 1):
            segment_key = (path[i], path[i + 1])
            if segment_key in self.route_segments:
                segment = self.route_segments[segment_key]
                segments.append(segment)
                total_distance += segment.base_distance
                estimated_time += segment.effective_time
        
        return DynamicRoute(
            route_id=f"route_{path[0]}_{path[-1]}_{route_suffix}_{int(time.time())}",
            origin=path[0],
            destination=path[-1],
            waypoints=path,
            segments=segments,
            total_distance=total_distance,
            estimated_time=estimated_time,
            priority=3
        )
    
    def _invalidate_cache_for_segment(self, from_node: str, to_node: str):
        """Invalidate route cache entries that use the affected segment"""
        to_remove = []
        for cache_key in self.route_cache:
            path = self.route_cache[cache_key]
            for i in range(len(path) - 1):
                if path[i] == from_node and path[i + 1] == to_node:
                    to_remove.append(cache_key)
                    break
        
        for key in to_remove:
            del self.route_cache[key]
            if key in self.cache_expiry:
                del self.cache_expiry[key]
    
    def _recalculate_affected_routes(self, from_node: str, to_node: str):
        """Recalculate active routes that use the affected segment"""
        for route in self.active_routes.values():
            for segment in route.segments:
                if segment.from_node == from_node and segment.to_node == to_node:
                    route.recalculate_metrics()
                    print(f"[Dynamic Routing] Recalculated route {route.route_id}: {route.estimated_time:.2f}h")
                    break
    
    def get_route_status(self, route_id: str) -> Optional[Dict]:
        """Get current status of a route"""
        if route_id not in self.active_routes:
            return None
        
        route = self.active_routes[route_id]
        
        # Check for any blocked segments
        blocked_segments = [seg for seg in route.segments if not seg.is_passable]
        
        # Calculate delay factors
        delay_factor = sum(seg.traffic_level.value * seg.road_condition.value for seg in route.segments) / len(route.segments)
        
        return {
            'route_id': route_id,
            'status': 'blocked' if blocked_segments else 'active',
            'estimated_time': route.estimated_time,
            'total_distance': route.total_distance,
            'delay_factor': delay_factor,
            'blocked_segments': len(blocked_segments),
            'last_updated': route.last_updated.isoformat(),
            'waypoints': route.waypoints
        }
    
    def simulate_traffic_conditions(self):
        """Simulate changing traffic conditions for demo"""
        import random
        
        # Randomly update traffic on some segments
        segments_to_update = random.sample(list(self.route_segments.keys()), 
                                         min(3, len(self.route_segments)))
        
        for segment_key in segments_to_update:
            new_traffic = random.choice(list(TrafficLevel))
            self.update_traffic_level(segment_key[0], segment_key[1], new_traffic)
    
    def simulate_road_incidents(self):
        """Simulate road incidents for demo"""
        import random
        
        # Randomly create road incidents
        segments_to_affect = random.sample(list(self.route_segments.keys()), 
                                         min(2, len(self.route_segments)))
        
        for segment_key in segments_to_affect:
            # 70% chance of degraded condition, 30% chance of blocked
            if random.random() < 0.7:
                new_condition = random.choice([RoadCondition.POOR, RoadCondition.DAMAGED])
            else:
                new_condition = RoadCondition.BLOCKED
            
            self.update_road_condition(segment_key[0], segment_key[1], new_condition)
    
    def get_network_statistics(self) -> Dict:
        """Get current network statistics"""
        total_segments = len(self.route_segments)
        blocked_segments = sum(1 for seg in self.route_segments.values() if not seg.is_passable)
        
        # Traffic distribution
        traffic_dist = defaultdict(int)
        for seg in self.route_segments.values():
            traffic_dist[seg.traffic_level.name] += 1
        
        # Condition distribution
        condition_dist = defaultdict(int)
        for seg in self.route_segments.values():
            condition_dist[seg.road_condition.name] += 1
        
        return {
            'total_segments': total_segments,
            'blocked_segments': blocked_segments,
            'passable_segments': total_segments - blocked_segments,
            'active_routes': len(self.active_routes),
            'traffic_distribution': dict(traffic_dist),
            'condition_distribution': dict(condition_dist),
            'cache_size': len(self.route_cache)
        }

# Global routing engine instance
routing_engine = DynamicRoutingEngine()
