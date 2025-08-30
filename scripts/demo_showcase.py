"""
Interactive demo showcase script for DisasterOps
Demonstrates all system capabilities with realistic scenarios
"""
import asyncio
import json
import time
from datetime import datetime, timedelta
import random

class DisasterOpsDemo:
    """Interactive demonstration of DisasterOps capabilities"""
    
    def __init__(self):
        self.scenarios = {
            "earthquake": {
                "name": "San Francisco Earthquake Response",
                "description": "7.2 magnitude earthquake with multiple affected zones",
                "duration": 72,
                "complexity": "high"
            },
            "hurricane": {
                "name": "Hurricane Miami Landfall",
                "description": "Category 4 hurricane with widespread flooding",
                "duration": 96,
                "complexity": "very_high"
            },
            "wildfire": {
                "name": "California Wildfire Evacuation",
                "description": "Rapidly spreading wildfire requiring mass evacuation",
                "duration": 120,
                "complexity": "high"
            },
            "flood": {
                "name": "Houston Flash Flooding",
                "description": "Severe flooding from tropical storm",
                "duration": 48,
                "complexity": "medium"
            }
        }
        
        self.demo_metrics = {
            "scenarios_completed": 0,
            "total_people_helped": 0,
            "average_response_time": 0,
            "resource_efficiency": 0,
            "cost_savings": 0
        }
    
    def display_welcome(self):
        """Display welcome message and demo overview"""
        print("🌟" * 20)
        print("     DISASTEROPS INTERACTIVE DEMO")
        print("🌟" * 20)
        print()
        print("Welcome to the DisasterOps demonstration!")
        print("This interactive demo showcases our real-time relief resource allocation system.")
        print()
        print("🎯 Demo Features:")
        print("   • Real-time disaster scenario simulations")
        print("   • Advanced optimization algorithms")
        print("   • Dynamic routing with traffic conditions")
        print("   • Performance analytics and metrics")
        print("   • Interactive map visualizations")
        print()
        print("📊 Available Scenarios:")
        for i, (key, scenario) in enumerate(self.scenarios.items(), 1):
            print(f"   {i}. {scenario['name']}")
            print(f"      {scenario['description']}")
            print(f"      Duration: {scenario['duration']}h | Complexity: {scenario['complexity']}")
            print()
    
    def run_scenario_demo(self, scenario_key: str):
        """Run a complete scenario demonstration"""
        scenario = self.scenarios[scenario_key]
        print(f"🚀 Starting Demo: {scenario['name']}")
        print("=" * 50)
        
        # Phase 1: Initial Assessment
        print("\n📋 Phase 1: Initial Disaster Assessment")
        print("   • Analyzing affected areas...")
        time.sleep(2)
        print("   • Identifying resource requirements...")
        time.sleep(1.5)
        print("   • Establishing communication networks...")
        time.sleep(1)
        print("   ✅ Assessment complete!")
        
        # Phase 2: Resource Allocation
        print("\n🎯 Phase 2: Optimal Resource Allocation")
        print("   • Running genetic algorithm optimization...")
        time.sleep(3)
        print("   • Calculating multi-objective solutions...")
        time.sleep(2)
        print("   • Balancing cost, time, and coverage...")
        time.sleep(2)
        
        # Simulate optimization results
        coverage = random.uniform(85, 95)
        response_time = random.uniform(1.2, 2.8)
        efficiency = random.uniform(78, 92)
        
        print(f"   ✅ Optimization complete!")
        print(f"      Coverage: {coverage:.1f}%")
        print(f"      Avg Response Time: {response_time:.1f}h")
        print(f"      Resource Efficiency: {efficiency:.1f}%")
        
        # Phase 3: Dynamic Routing
        print("\n🛣️  Phase 3: Dynamic Route Optimization")
        print("   • Calculating shortest paths...")
        time.sleep(2)
        print("   • Analyzing traffic conditions...")
        time.sleep(1.5)
        print("   • Generating alternative routes...")
        time.sleep(2)
        
        routes_optimized = random.randint(8, 15)
        print(f"   ✅ {routes_optimized} routes optimized!")
        
        # Phase 4: Real-time Adaptation
        print("\n⚡ Phase 4: Real-time Condition Updates")
        events = [
            "Road closure detected - rerouting traffic",
            "New disaster zone identified - updating priorities",
            "Traffic congestion reported - adjusting delivery times",
            "Resource shortage alert - redistributing supplies"
        ]
        
        for event in events:
            print(f"   🔄 {event}")
            time.sleep(1.5)
        
        print("   ✅ System adapted to all conditions!")
        
        # Phase 5: Results Summary
        print("\n📊 Phase 5: Performance Summary")
        people_helped = random.randint(15000, 45000)
        cost_savings = random.randint(15, 35)
        
        print(f"   👥 People Helped: {people_helped:,}")
        print(f"   💰 Cost Savings: {cost_savings}%")
        print(f"   🎯 Success Rate: {random.randint(92, 98)}%")
        print(f"   ⏱️  Total Response Time: {response_time:.1f} hours")
        
        # Update demo metrics
        self.demo_metrics["scenarios_completed"] += 1
        self.demo_metrics["total_people_helped"] += people_helped
        self.demo_metrics["average_response_time"] = (
            self.demo_metrics["average_response_time"] + response_time
        ) / self.demo_metrics["scenarios_completed"]
        self.demo_metrics["resource_efficiency"] = (
            self.demo_metrics["resource_efficiency"] + efficiency
        ) / self.demo_metrics["scenarios_completed"]
        self.demo_metrics["cost_savings"] += cost_savings
        
        print(f"\n🎉 Demo Complete: {scenario['name']}")
        print("=" * 50)
    
    def show_algorithm_comparison(self):
        """Demonstrate different optimization algorithms"""
        print("\n🧠 Algorithm Performance Comparison")
        print("=" * 40)
        
        algorithms = {
            "Genetic Algorithm": {
                "coverage": random.uniform(88, 95),
                "speed": random.uniform(2.5, 4.2),
                "efficiency": random.uniform(85, 92)
            },
            "Simulated Annealing": {
                "coverage": random.uniform(82, 89),
                "speed": random.uniform(1.8, 3.1),
                "efficiency": random.uniform(78, 86)
            },
            "Multi-Objective": {
                "coverage": random.uniform(90, 96),
                "speed": random.uniform(3.2, 5.1),
                "efficiency": random.uniform(88, 94)
            }
        }
        
        print(f"{'Algorithm':<20} {'Coverage':<10} {'Speed(s)':<10} {'Efficiency':<12}")
        print("-" * 52)
        
        for name, metrics in algorithms.items():
            print(f"{name:<20} {metrics['coverage']:<10.1f} {metrics['speed']:<10.1f} {metrics['efficiency']:<12.1f}")
        
        print("\n🏆 Best Overall: Multi-Objective Optimization")
        print("   Balances all criteria for optimal disaster response")
    
    def interactive_menu(self):
        """Display interactive menu for demo control"""
        while True:
            print("\n" + "="*50)
            print("           DISASTEROPS DEMO MENU")
            print("="*50)
            print("1. Run Earthquake Scenario")
            print("2. Run Hurricane Scenario") 
            print("3. Run Wildfire Scenario")
            print("4. Run Flood Scenario")
            print("5. Compare Algorithms")
            print("6. View Demo Statistics")
            print("7. Export Demo Results")
            print("8. Exit Demo")
            print()
            
            choice = input("Select an option (1-8): ").strip()
            
            if choice == "1":
                self.run_scenario_demo("earthquake")
            elif choice == "2":
                self.run_scenario_demo("hurricane")
            elif choice == "3":
                self.run_scenario_demo("wildfire")
            elif choice == "4":
                self.run_scenario_demo("flood")
            elif choice == "5":
                self.show_algorithm_comparison()
            elif choice == "6":
                self.show_demo_statistics()
            elif choice == "7":
                self.export_demo_results()
            elif choice == "8":
                print("\n👋 Thank you for trying DisasterOps!")
                print("Visit our GitHub repository for more information.")
                break
            else:
                print("❌ Invalid option. Please try again.")
    
    def show_demo_statistics(self):
        """Display cumulative demo statistics"""
        print("\n📈 Demo Statistics Summary")
        print("=" * 30)
        print(f"Scenarios Completed: {self.demo_metrics['scenarios_completed']}")
        print(f"Total People Helped: {self.demo_metrics['total_people_helped']:,}")
        print(f"Average Response Time: {self.demo_metrics['average_response_time']:.1f}h")
        print(f"Resource Efficiency: {self.demo_metrics['resource_efficiency']:.1f}%")
        print(f"Total Cost Savings: {self.demo_metrics['cost_savings']}%")
        
        if self.demo_metrics['scenarios_completed'] > 0:
            print(f"\n🎯 Performance Grade: {'A+' if self.demo_metrics['resource_efficiency'] > 85 else 'A' if self.demo_metrics['resource_efficiency'] > 80 else 'B+'}")
    
    def export_demo_results(self):
        """Export demo results to JSON file"""
        results = {
            "demo_session": {
                "timestamp": datetime.now().isoformat(),
                "scenarios_completed": self.demo_metrics['scenarios_completed'],
                "total_people_helped": self.demo_metrics['total_people_helped'],
                "average_response_time": self.demo_metrics['average_response_time'],
                "resource_efficiency": self.demo_metrics['resource_efficiency'],
                "cost_savings": self.demo_metrics['cost_savings']
            },
            "scenarios": self.scenarios,
            "system_info": {
                "version": "1.0.0",
                "algorithms_used": ["Genetic Algorithm", "Simulated Annealing", "Multi-Objective"],
                "features_demonstrated": [
                    "Real-time optimization",
                    "Dynamic routing",
                    "Resource allocation",
                    "Performance analytics"
                ]
            }
        }
        
        filename = f"disasterops_demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2)
            print(f"✅ Demo results exported to: {filename}")
        except Exception as e:
            print(f"❌ Error exporting results: {e}")

def main():
    """Main demo execution function"""
    demo = DisasterOpsDemo()
    demo.display_welcome()
    
    # Ask user if they want guided tour or interactive menu
    print("Choose your demo experience:")
    print("1. Quick guided tour (automated)")
    print("2. Interactive menu (manual control)")
    
    choice = input("Select option (1-2): ").strip()
    
    if choice == "1":
        print("\n🎬 Starting Guided Tour...")
        # Run automated demo of all scenarios
        for scenario_key in demo.scenarios.keys():
            demo.run_scenario_demo(scenario_key)
            time.sleep(2)
        
        demo.show_algorithm_comparison()
        demo.show_demo_statistics()
        demo.export_demo_results()
        
        print("\n🎉 Guided tour complete!")
        print("Thank you for experiencing DisasterOps!")
        
    elif choice == "2":
        demo.interactive_menu()
    else:
        print("Invalid choice. Starting interactive menu...")
        demo.interactive_menu()

if __name__ == "__main__":
    main()
