"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map, Truck, AlertTriangle, MapPin, BarChart3, Settings, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: Map, label: "Operations Map", active: true, badge: null },
    { icon: AlertTriangle, label: "Active Zones", active: false, badge: "3" },
    { icon: MapPin, label: "Relief Centers", active: false, badge: "2" },
    { icon: Truck, label: "Active Routes", active: false, badge: "5" },
    { icon: BarChart3, label: "Analytics", active: false, badge: null },
    { icon: Settings, label: "Settings", active: false, badge: null },
  ]

  return (
    <div className={cn("bg-sidebar border-r transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      <div className="p-4">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">Control Panel</h2>
              <p className="text-xs text-muted-foreground">Emergency Operations</p>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <Card className="p-3 mb-6">
            <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button size="sm" className="w-full justify-start gap-2">
                <Plus className="h-3 w-3" />
                Add Disaster Zone
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Truck className="h-3 w-3" />
                Deploy Resources
              </Button>
            </div>
          </Card>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={cn("w-full justify-start gap-3", isCollapsed && "justify-center px-2")}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </nav>

        {/* Status Summary */}
        {!isCollapsed && (
          <Card className="p-3 mt-6">
            <h3 className="text-sm font-medium mb-3">System Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Zones</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Relief Centers</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Routes Active</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resources</span>
                <span className="font-medium text-green-600">Available</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
