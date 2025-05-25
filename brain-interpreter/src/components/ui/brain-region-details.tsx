"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BrainRegionData {
  function: string
  region: string
  activation: number
  color?: string
  fill?: string
  description: string
}

interface BrainRegionDetailsProps {
  chartData: BrainRegionData[]
}

const BrainRegionDetails: React.FC<BrainRegionDetailsProps> = ({ chartData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Brain Region Details</CardTitle>
        <CardDescription>Detailed information about each active brain region</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chartData.map((data) => (
            <div
              key={data.function}
              className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div 
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                style={{ backgroundColor: data.fill || data.color }} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-foreground truncate">{data.region}</h4>
                  <Badge
                    variant={data.activation > 0.7 ? "default" : data.activation > 0.4 ? "secondary" : "outline"}
                    className="ml-2 flex-shrink-0"
                  >
                    {(data.activation * 100).toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{data.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default BrainRegionDetails 