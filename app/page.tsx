"use client"

import { useState } from "react"
import { DisasterOpsMap } from "@/components/disaster-ops-map"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DemoControlPanel } from "@/components/demo-control-panel"
import { GuidedTour } from "@/components/guided-tour"
import { PerformanceDashboard } from "@/components/performance-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DisasterOpsPage() {
  const [showTour, setShowTour] = useState(true)

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 overflow-auto">
          {showTour && <GuidedTour onComplete={() => setShowTour(false)} />}

          <Tabs defaultValue="operations" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="operations">Operations Map</TabsTrigger>
              <TabsTrigger value="demo">Demo Control</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="operations" className="h-full">
              <DisasterOpsMap />
            </TabsContent>

            <TabsContent value="demo" className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-2">
                  <DisasterOpsMap />
                </div>
                <div>
                  <DemoControlPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full">
              <PerformanceDashboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
