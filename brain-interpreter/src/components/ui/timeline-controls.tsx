"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Play, Pause, SkipBack, SkipForward, Settings } from "lucide-react"

interface TimelineControlsProps {
  currentIndex: number
  timelineLength: number
  isPlaying: boolean
  isFastSpeed: boolean
  onTogglePlayPause: () => void
  onGoToNext: () => void
  onGoToPrevious: () => void
  onGoToStart: () => void
  onGoToEnd: () => void
  onToggleSpeed: () => void
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentIndex,
  timelineLength,
  isPlaying,
  isFastSpeed,
  onTogglePlayPause,
  onGoToNext,
  onGoToPrevious,
  onGoToStart,
  onGoToEnd,
  onToggleSpeed,
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline Controls
          </CardTitle>
          <button
            onClick={onToggleSpeed}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
              isFastSpeed
                ? "bg-purple-600 text-white"
                : "border hover:bg-accent"
            }`}
          >
            <Settings className="h-4 w-4" />
            {isFastSpeed ? "Fast" : "Normal"} Speed
          </button>
        </div>
        <CardDescription>
          Step {currentIndex} of {timelineLength - 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentIndex / (timelineLength - 1)) * 100}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onGoToStart}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipBack className="h-4 w-4" />
            Start
          </button>
          <button
            onClick={onGoToPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={onTogglePlayPause}
            disabled={timelineLength <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={onGoToNext}
            disabled={currentIndex === timelineLength - 1}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            onClick={onGoToEnd}
            disabled={currentIndex === timelineLength - 1}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SkipForward className="h-4 w-4" />
            End
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TimelineControls 