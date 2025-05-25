import { useState, useEffect, useCallback } from "react"

interface TimelineEntry {
  text: string
  brainActivity: { [key: string]: number }
}

export const useTimeline = (timeline: TimelineEntry[]) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFastSpeed, setIsFastSpeed] = useState(false)

  const currentEntry = timeline[currentIndex] || { text: "", brainActivity: {} }

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || timeline.length <= 1) return

    const currentSpeed = isFastSpeed ? 1000 : 2000 // Fast: 1s, Normal: 2s

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= timeline.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, currentSpeed)

    return () => clearInterval(timer)
  }, [isPlaying, isFastSpeed, timeline.length])

  // Control functions
  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const goToNext = useCallback(() => {
    if (currentIndex < timeline.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, timeline.length])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const goToStart = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(false)
  }, [])

  const goToEnd = useCallback(() => {
    setCurrentIndex(timeline.length - 1)
    setIsPlaying(false)
  }, [timeline.length])

  const toggleSpeed = useCallback(() => {
    setIsFastSpeed(!isFastSpeed)
  }, [isFastSpeed])

  return {
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
  }
} 