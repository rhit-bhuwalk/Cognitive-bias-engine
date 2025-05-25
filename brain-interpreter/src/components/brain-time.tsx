"use client"

import type React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Brain, Activity } from "lucide-react"
import { useTimeline } from "../lib/use-timeline"
import { prepareBrainChartData, calculateBrainStats } from "../lib/brain-chart-data"
import TimelineControls from "./ui/timeline-controls"
import BrainStats from "./ui/brain-stats"
import BrainRegionDetails from "./ui/brain-region-details"

// Define types
interface CotAnalysis {
  [key: string]: number
}

interface TimelineEntry {
  text: string
  brainActivity: CotAnalysis
}

interface BrainTimeVisualizationProps {
  timeline: TimelineEntry[]
}

const BrainTimeVisualization: React.FC<BrainTimeVisualizationProps> = ({ timeline }) => {
  const {
    currentIndex,
    isPlaying,
    isFastSpeed,
    currentEntry,
    togglePlayPause,
    goToNext,
    goToPrevious,
    goToStart,
    goToEnd,
    toggleSpeed,
  } = useTimeline(timeline)

  const cotAnalysis = currentEntry.brainActivity

  // Prepare data for the chart
  const chartData = prepareBrainChartData(cotAnalysis)
  const { maxActivation, activeRegions, avgActivation } = calculateBrainStats(chartData)

  // Create chart config for shadcn
  const chartConfig: Record<string, { label: string; color: string }> = chartData.reduce((config, item) => {
    config[item.function] = {
      label: item.region,
      color: item.fill,
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Brain Activity Timeline
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visualizing cognitive function activation over time with associated thought processes
        </p>
      </div>

      {/* Timeline Controls */}
      <TimelineControls
        currentIndex={currentIndex}
        timelineLength={timeline.length}
        isPlaying={isPlaying}
        isFastSpeed={isFastSpeed}
        onTogglePlayPause={togglePlayPause}
        onGoToNext={goToNext}
        onGoToPrevious={goToPrevious}
        onGoToStart={goToStart}
        onGoToEnd={goToEnd}
        onToggleSpeed={toggleSpeed}
      />

      {/* Current Text Display */}
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Current Thought Process</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{currentEntry.text}</p>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Regional Activation Levels
          </CardTitle>
          <CardDescription>Cognitive function activation across brain regions (hover for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="region"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => (value.length > 15 ? value.substring(0, 15) + "..." : value)}
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-4 max-w-xs">
                          <h4 className="font-semibold text-foreground mb-2">{data.region}</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">{data.description}</p>
                            <div className="flex items-center gap-2 pt-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
                              <span className="font-medium">Activation: {(data.activation * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="activation" 
                  radius={[4, 4, 0, 0]} 
                  className="hover:opacity-80 transition-all duration-300" 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Enhanced Legend */}
      <BrainRegionDetails chartData={chartData} />

      {/* Stats Cards */}
      <BrainStats
        maxActivation={maxActivation}
        activeRegions={activeRegions}
        avgActivation={avgActivation}
      />
    </div>
  )
}

export default BrainTimeVisualization 