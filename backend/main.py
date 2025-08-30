from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import networkx as nx
import numpy as np
from datetime import datetime
import json
from dynamic_routing import routing_engine, RoadCondition, TrafficLevel, DynamicRoute

app = FastAPI(title="DisasterOps API", description="Real-Time Relief Resource Allocation System")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Location(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    type: str  # "relief_center", "disaster_zone", "city"

class Resource(BaseModel):
    id: str
    name: str
    quantity: int
    unit: str

class ReliefCenter(BaseModel):
    location: Location
    resources: List[Resource]
    capacity: int

class DisasterZone(BaseModel):
    location: Location
    severity: int  # 1-10 scale
    population_affected: int
    resources_needed: List[Resource]
    priority: int  # 1-5 scale

class Route(BaseModel):
    from_location: str
    to_location: str
    distance: float
    travel_time: float
    road_condition: str  # "good", "damaged", "blocked"

class AllocationResult(BaseModel):
    relief_center_id: str
    disaster_zone_id: str
    resources_allocated: List[Resource]
    route: List[Dict[str, float]]
    estimated_delivery_time: float

# In-memory storage (replace with database in production)
relief_centers: List[ReliefCenter] = []
disaster_zones: List[DisasterZone] = []
road_network = nx.Graph()

# Initialize sample data
def initialize_sample_data():
    global relief_centers, disaster_zones, road_network
    
    # Sample relief centers
    relief_centers = [
        ReliefCenter(
            location=Location(id="rc1", name="Central Relief Hub", lat=40.7128, lng=-74.0060, type="relief_center"),
            resources=[
                Resource(id="food", name="Food Packages", quantity=1000, unit="packages"),
                Resource(id="water", name="Water Bottles", quantity=5000, unit="bottles"),
                Resource(id="medical", name="Medical Kits", quantity=200, unit="kits")
            ],
            capacity=10000
        ),
        ReliefCenter(
            location=Location(id="rc2", name="North Relief Station", lat=40.7589, lng=-73.9851, type="relief_center"),
            resources=[
                Resource(id="food", name="Food Packages", quantity=800, unit="packages"),
                Resource(id="water", name="Water Bottles", quantity=3000, unit="bottles"),
                Resource(id="blankets", name="Blankets", quantity=500, unit="pieces")
            ],
            capacity=8000
        )
    ]
    
    # Sample disaster zones
    disaster_zones = [
        DisasterZone(
            location=Location(id="dz1", name="Flood Zone Alpha", lat=40.7505, lng=-73.9934, type="disaster_zone"),
            severity=8,
            population_affected=5000,
            resources_needed=[
                Resource(id="food", name="Food Packages", quantity=500, unit="packages"),
                Resource(id="water", name="Water Bottles", quantity=2000, unit="bottles")
            ],
            priority=5
        ),
        DisasterZone(
            location=Location(id="dz2", name="Earthquake Zone Beta", lat=40.7282, lng=-74.0776, type="disaster_zone"),
            severity=6,
            population_affected=3000,
            resources_needed=[
                Resource(id="medical", name="Medical Kits", quantity=100, unit="kits"),
                Resource(id="blankets", name="Blankets", quantity=300, unit="pieces")
            ],
            priority=4
        )
    ]
    
    # Build road network
    locations = [rc.location for rc in relief_centers] + [dz.location for dz in disaster_zones]
    for i, loc1 in enumerate(locations):
        for j, loc2 in enumerate(locations):
            if i != j:
                # Calculate distance using Haversine formula (simplified)
                distance = calculate_distance(loc1.lat, loc1.lng, loc2.lat, loc2.lng)
                travel_time = distance / 50  # Assume 50 km/h average speed
                road_network.add_edge(loc1.id, loc2.id, weight=travel_time, distance=distance)

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = np.radians(lat1)
    lat2_rad = np.radians(lat2)
    delta_lat = np.radians(lat2 - lat1)
    delta_lng = np.radians(lng2 - lng1)
    
    a = np.sin(delta_lat/2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(delta_lng/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    
    return R * c

def initialize_dynamic_routing():
    """Initialize the dynamic routing engine with sample data"""
    # Create locations for routing
    locations = []
    for rc in relief_centers:
        locations.append({
            'id': rc.location.id,
            'lat': rc.location.lat,
            'lng': rc.location.lng,
            'type': rc.location.type,
            'name': rc.location.name
        })
    
    for dz in disaster_zones:
        locations.append({
            'id': dz.location.id,
            'lat': dz.location.lat,
            'lng': dz.location.lng,
            'type': dz.location.type,
            'name': dz.location.name
        })
    
    # Create connections (all-to-all for demo)
    connections = []
    for i, loc1 in enumerate(locations):
        for j, loc2 in enumerate(locations):
            if i != j:
                distance = calculate_distance(loc1['lat'], loc1['lng'], loc2['lat'], loc2['lng'])
                connections.append({
                    'from': loc1['id'],
                    'to': loc2['id'],
                    'distance': distance,
                    'time': distance / 50  # 50 km/h average
                })
    
    routing_engine.initialize_network(locations, connections)
    print("[Dynamic Routing] Routing engine initialized with sample network")

@app.on_event("startup")
async def startup_event():
    initialize_sample_data()
    initialize_dynamic_routing()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "DisasterOps API is running", "timestamp": datetime.now()}

@app.get("/relief-centers", response_model=List[ReliefCenter])
async def get_relief_centers():
    return relief_centers

@app.get("/disaster-zones", response_model=List[DisasterZone])
async def get_disaster_zones():
    return disaster_zones

@app.post("/disaster-zones", response_model=DisasterZone)
async def create_disaster_zone(zone: DisasterZone):
    disaster_zones.append(zone)
    # Update road network
    for rc in relief_centers:
        distance = calculate_distance(zone.location.lat, zone.location.lng, rc.location.lat, rc.location.lng)
        travel_time = distance / 50
        road_network.add_edge(zone.location.id, rc.location.id, weight=travel_time, distance=distance)
    return zone

@app.get("/optimize-allocation", response_model=List[AllocationResult])
async def optimize_resource_allocation():
    """Optimize resource allocation using graph algorithms and linear programming"""
    results = []
    
    # Sort disaster zones by priority (highest first)
    sorted_zones = sorted(disaster_zones, key=lambda x: x.priority, reverse=True)
    
    for zone in sorted_zones:
        best_allocation = None
        min_delivery_time = float('inf')
        
        for center in relief_centers:
            # Check if center has required resources
            can_fulfill = True
            for needed_resource in zone.resources_needed:
                center_resource = next((r for r in center.resources if r.id == needed_resource.id), None)
                if not center_resource or center_resource.quantity < needed_resource.quantity:
                    can_fulfill = False
                    break
            
            if can_fulfill:
                # Calculate shortest path
                try:
                    path = nx.shortest_path(road_network, center.location.id, zone.location.id, weight='weight')
                    delivery_time = nx.shortest_path_length(road_network, center.location.id, zone.location.id, weight='weight')
                    
                    if delivery_time < min_delivery_time:
                        min_delivery_time = delivery_time
                        
                        # Create route coordinates
                        route_coords = []
                        for node_id in path:
                            location = next((loc for loc in [rc.location for rc in relief_centers] + [dz.location for dz in disaster_zones] if loc.id == node_id), None)
                            if location:
                                route_coords.append({"lat": location.lat, "lng": location.lng})
                        
                        best_allocation = AllocationResult(
                            relief_center_id=center.location.id,
                            disaster_zone_id=zone.location.id,
                            resources_allocated=zone.resources_needed.copy(),
                            route=route_coords,
                            estimated_delivery_time=delivery_time
                        )
                except nx.NetworkXNoPath:
                    continue
        
        if best_allocation:
            results.append(best_allocation)
            
            # Update resource quantities (simulate allocation)
            center = next(rc for rc in relief_centers if rc.location.id == best_allocation.relief_center_id)
            for allocated_resource in best_allocation.resources_allocated:
                center_resource = next(r for r in center.resources if r.id == allocated_resource.id)
                center_resource.quantity -= allocated_resource.quantity
    
    return results

@app.get("/shortest-path/{from_id}/{to_id}")
async def get_shortest_path(from_id: str, to_id: str):
    """Get shortest path between two locations"""
    try:
        path = nx.shortest_path(road_network, from_id, to_id, weight='weight')
        distance = nx.shortest_path_length(road_network, from_id, to_id, weight='weight')
        
        # Convert path to coordinates
        route_coords = []
        for node_id in path:
            location = next((loc for loc in [rc.location for rc in relief_centers] + [dz.location for dz in disaster_zones] if loc.id == node_id), None)
            if location:
                route_coords.append({"lat": location.lat, "lng": location.lng, "id": location.id, "name": location.name})
        
        return {
            "path": path,
            "distance": distance,
            "route_coordinates": route_coords
        }
    except nx.NetworkXNoPath:
        raise HTTPException(status_code=404, detail="No path found between locations")

@app.post("/simulate-road-closure")
async def simulate_road_closure(from_id: str, to_id: str):
    """Simulate road closure and update network"""
    if road_network.has_edge(from_id, to_id):
        road_network.remove_edge(from_id, to_id)
        return {"message": f"Road between {from_id} and {to_id} has been closed"}
    else:
        raise HTTPException(status_code=404, detail="Road not found")

@app.post("/restore-road")
async def restore_road(from_id: str, to_id: str):
    """Restore a closed road"""
    # Find locations
    loc1 = next((loc for loc in [rc.location for rc in relief_centers] + [dz.location for dz in disaster_zones] if loc.id == from_id), None)
    loc2 = next((loc for loc in [rc.location for rc in relief_centers] + [dz.location for dz in disaster_zones] if loc.id == to_id), None)
    
    if loc1 and loc2:
        distance = calculate_distance(loc1.lat, loc1.lng, loc2.lat, loc2.lng)
        travel_time = distance / 50
        road_network.add_edge(from_id, to_id, weight=travel_time, distance=distance)
        return {"message": f"Road between {from_id} and {to_id} has been restored"}
    else:
        raise HTTPException(status_code=404, detail="Locations not found")

@app.get("/dynamic-routes/{origin}/{destination}")
async def get_dynamic_route(origin: str, destination: str, priority: int = 3):
    """Get optimized dynamic route between two locations"""
    route = routing_engine.find_optimal_route(origin, destination, priority)
    
    if not route:
        raise HTTPException(status_code=404, detail="No route found")
    
    return {
        "route_id": route.route_id,
        "origin": route.origin,
        "destination": route.destination,
        "waypoints": route.waypoints,
        "total_distance": route.total_distance,
        "estimated_time": route.estimated_time,
        "priority": route.priority,
        "segments": [
            {
                "from": seg.from_node,
                "to": seg.to_node,
                "distance": seg.base_distance,
                "time": seg.effective_time,
                "road_condition": seg.road_condition.name,
                "traffic_level": seg.traffic_level.name
            }
            for seg in route.segments
        ]
    }

@app.get("/alternative-routes/{origin}/{destination}")
async def get_alternative_routes(origin: str, destination: str, num_routes: int = 3):
    """Get multiple alternative routes"""
    alternatives = routing_engine.find_alternative_routes(origin, destination, num_routes)
    
    return {
        "alternatives": [
            {
                "route_id": route.route_id,
                "waypoints": route.waypoints,
                "total_distance": route.total_distance,
                "estimated_time": route.estimated_time,
                "segments_count": len(route.segments)
            }
            for route in alternatives
        ]
    }

@app.post("/update-road-condition")
async def update_road_condition(from_node: str, to_node: str, condition: str):
    """Update road condition for a segment"""
    try:
        road_condition = RoadCondition[condition.upper()]
        routing_engine.update_road_condition(from_node, to_node, road_condition)
        return {"message": f"Road condition updated: {from_node} -> {to_node} = {condition}"}
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid road condition: {condition}")

@app.post("/update-traffic")
async def update_traffic(from_node: str, to_node: str, traffic: str):
    """Update traffic level for a segment"""
    try:
        traffic_level = TrafficLevel[traffic.upper()]
        routing_engine.update_traffic_level(from_node, to_node, traffic_level)
        return {"message": f"Traffic updated: {from_node} -> {to_node} = {traffic}"}
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid traffic level: {traffic}")

@app.get("/route-status/{route_id}")
async def get_route_status(route_id: str):
    """Get current status of a specific route"""
    status = routing_engine.get_route_status(route_id)
    if not status:
        raise HTTPException(status_code=404, detail="Route not found")
    return status

@app.post("/simulate-conditions")
async def simulate_conditions(condition_type: str):
    """Simulate changing conditions for demo"""
    if condition_type == "traffic":
        routing_engine.simulate_traffic_conditions()
        return {"message": "Traffic conditions simulated"}
    elif condition_type == "incidents":
        routing_engine.simulate_road_incidents()
        return {"message": "Road incidents simulated"}
    else:
        raise HTTPException(status_code=400, detail="Invalid condition type")

@app.get("/network-stats")
async def get_network_stats():
    """Get current network statistics"""
    return routing_engine.get_network_statistics()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
