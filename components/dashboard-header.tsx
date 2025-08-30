"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, User, Activity } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">DisasterOps</h1>
          <p className="text-sm text-muted-foreground">Real-Time Relief Resource Allocation</p>
        </div>

        <div className="flex items-center gap-4">
          {/* System Status */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              System Online
            </Badge>
          </div>

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative bg-transparent">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs"></span>
          </Button>

          {/* Settings */}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Profile */}
          <Button variant="outline" size="sm">
            <User className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Coordinator</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
