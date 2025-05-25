"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Activity } from "lucide-react"

interface BrainStatsProps {
  maxActivation: number
  activeRegions: number
  avgActivation: number
}

const BrainStats: React.FC<BrainStatsProps> = ({
  maxActivation,
  activeRegions,
  avgActivation,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peak Activation</p>
              <p className="text-2xl font-bold text-purple-600">{(maxActivation * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Regions</p>
              <p className="text-2xl font-bold text-blue-600">{activeRegions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Activation</p>
              <p className="text-2xl font-bold text-green-600">
                {(avgActivation * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BrainStats 