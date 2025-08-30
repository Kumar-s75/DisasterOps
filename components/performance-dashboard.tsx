"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  Truck,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface PerformanceMetrics {
  system_health: number
  response_time: number
  throughput: number
  success_rate: number
  resource_utilization: number
  cost_efficiency: number
  user_satisfaction: number
}

interface SystemStats {
  active_routes: number
  completed_deliveries: number
  pending_requests: number
  blocked_roads: number
  operational_centers: number
  total_resources_deployed: number
}

interface AlertItem {
  id: string
  type: "warning" | "error" | "info"
  message: string
  timestamp: string
  resolved: boolean
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    system_health: 94,
    response_time: 1.2,
    throughput: 87,
    success_rate: 96,
    resource_utilization: 78,
    cost_efficiency: 85,
    user_satisfaction: 92,
  })

  const [systemStats, setSystemStats] = useState<SystemStats>({
    active_routes: 12,
    completed_deliveries: 156,
    pending_requests: 8,
    blocked_roads: 3,
    operational_centers: 5,
    total_resources_deployed: 2340,
  })

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "1",
      type: "warning",
      message: "High traffic detected on Route 101 - estimated delay 15 minutes",
      timestamp: "2 minutes ago",
      resolved: false,
    },
    {
      id: "2",
      type: "info",
      message: "New relief center activated in downtown area",
      timestamp: "5 minutes ago",
      resolved: false,
    },
    {
      id: "3",
      type: "error",
      message: "Road closure reported on Highway 85 - rerouting in progress",
      timestamp: "8 minutes ago",
      resolved: true,
    },
  ])

  useEffect(() => {
    // Simulate real-time metric updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        system_health: Math.max(85, Math.min(99, prev.system_health + (Math.random() - 0.5) * 2)),
        response_time: Math.max(0.5, Math.min(3.0, prev.response_time + (Math.random() - 0.5) * 0.2)),
        throughput: Math.max(70, Math.min(95, prev.throughput + (Math.random() - 0.5) * 3)),
        success_rate: Math.max(90, Math.min(99, prev.success_rate + (Math.random() - 0.5) * 1)),
        resource_utilization: Math.max(60, Math.min(90, prev.resource_utilization + (Math.random() - 0.5) * 2)),
        cost_efficiency: Math.max(75, Math.min(95, prev.cost_efficiency + (Math.random() - 0.5) * 1.5)),
        user_satisfaction: Math.max(85, Math.min(98, prev.user_satisfaction + (Math.random() - 0.5) * 1)),
      }))

      setSystemStats((prev) => ({
        ...prev,
        active_routes: Math.max(5, Math.min(20, prev.active_routes + Math.floor((Math.random() - 0.5) * 3))),
        completed_deliveries: prev.completed_deliveries + Math.floor(Math.random() * 2),
        pending_requests: Math.max(0, Math.min(15, prev.pending_requests + Math.floor((Math.random() - 0.5) * 2))),
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (value: number) => {
    if (value >= 90) return "text-green-600"
    if (value >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* System Health Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.system_health)}`}>
                  {metrics.system_health.toFixed(0)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{metrics.response_time.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.success_rate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cost Efficiency</p>
                <p className="text-2xl font-bold text-primary">{metrics.cost_efficiency.toFixed(0)}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Throughput</span>
                    <span>{metrics.throughput.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.throughput} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Resource Utilization</span>
                    <span>{metrics.resource_utilization.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.resource_utilization} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>User Satisfaction</span>
                    <span>{metrics.user_satisfaction.toFixed(0)}%</span>
                  </div>
                  <Progress value={metrics.user_satisfaction} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time Trend</span>
                    <Badge variant="outline" className="text-green-600">
                      ↓ 12% improvement
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cost Efficiency</span>
                    <Badge variant="outline" className="text-green-600">
                      ↑ 8% improvement
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Resource Utilization</span>
                    <Badge variant="outline" className="text-blue-600">
                      → stable
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <Badge variant="outline" className="text-green-600">
                      ↑ 3% improvement
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Active Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{systemStats.active_routes}</div>
                    <div className="text-sm text-muted-foreground">Active Routes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemStats.completed_deliveries}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{systemStats.pending_requests}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{systemStats.blocked_roads}</div>
                    <div className="text-sm text-muted-foreground">Blocked Roads</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Resource Deployment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {systemStats.total_resources_deployed.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Resources Deployed</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Operational Centers</span>
                    <span className="font-medium">{systemStats.operational_centers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage Areas</span>
                    <span className="font-medium">15</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      alert.resolved ? "bg-muted/50 opacity-60" : "bg-card"
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    </div>
                    {alert.resolved && (
                      <Badge variant="outline" className="text-green-600">
                        Resolved
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
