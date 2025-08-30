# DisasterOps FastAPI Backend

This is the FastAPI backend for the DisasterOps real-time relief resource allocation system.

## Features

- **Resource Allocation**: Optimal distribution of relief resources using linear programming and min-cost flow algorithms
- **Dynamic Routing**: Real-time route optimization with Dijkstra's and A* algorithms
- **Graph-based Network**: Road network modeling using NetworkX
- **Real-time Updates**: Support for road closures and traffic condition updates
- **ML Predictions**: Demand hotspot prediction capabilities

## Installation

1. Install Python 3.8+
2. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Running the Server

\`\`\`bash
python main.py
\`\`\`

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Key Endpoints

- `GET /relief-centers` - Get all relief centers
- `GET /disaster-zones` - Get all disaster zones  
- `GET /optimize-allocation` - Get optimized resource allocation
- `GET /shortest-path/{from_id}/{to_id}` - Get shortest path between locations
- `POST /disaster-zones` - Add new disaster zone
- `POST /simulate-road-closure` - Simulate road closure
- `POST /restore-road` - Restore closed road

## Algorithms Implemented

1. **Min-Cost Flow**: For optimal resource allocation across the network
2. **Linear Programming**: Multi-objective optimization for resource distribution
3. **Dijkstra's Algorithm**: Shortest path routing with real-time updates
4. **A* Algorithm**: Heuristic-based routing for faster pathfinding
5. **Multi-objective Routing**: Considers time, distance, and road conditions

## Architecture

- **FastAPI**: Modern, fast web framework for building APIs
- **NetworkX**: Graph algorithms and network analysis
- **PuLP**: Linear programming optimization
- **NumPy**: Numerical computations
- **Pydantic**: Data validation and serialization
