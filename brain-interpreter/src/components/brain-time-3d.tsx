"use client"

import type React from "react"
import { useState, useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Grid, Text } from "@react-three/drei"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Activity } from "lucide-react"
import * as THREE from "three"
import brainMapping from "../../lib/brainMapping"
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

interface BrainTimeVisualization3DProps {
  timeline: TimelineEntry[]
}

// Individual heatmap cell component
interface HeatmapCellProps {
  position: [number, number, number]
  activation: number
  color: string
  label: string
  description: string
  functionName: string
}

function HeatmapCell({ position, activation, color, label, description }: Omit<HeatmapCellProps, 'functionName'>) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  
  // Animate the cell based on activation level
  useFrame((state) => {
    if (meshRef.current) {
      const baseHeight = 0.1
      const height = baseHeight + activation * 2 // Height represents activation intensity
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 * activation
      meshRef.current.scale.set(1, height * pulse, 1)
    }
  })

  // Convert hex color to RGB and adjust intensity based on activation
  const activationColor = useMemo(() => {
    const baseColor = new THREE.Color(color)
    const intensity = 0.2 + activation * 0.8 // Minimum 20% intensity
    return baseColor.multiplyScalar(intensity)
  }, [color, activation])

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={activationColor}
          emissive={activationColor}
          emissiveIntensity={activation * 0.3}
          transparent
          opacity={0.6 + activation * 0.4}
        />
      </mesh>
      
      {/* Label that appears on hover */}
      {hovered && (
        <Html
          position={[0, 2, 0]}
          center
          distanceFactor={6}
        >
          <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs pointer-events-none z-50">
            <h4 className="font-semibold text-foreground mb-1">{label}</h4>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }} 
              />
              <span className="font-medium text-sm">
                {(activation * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Position: ({position[0]}, {position[1]}, {position[2]})
            </p>
          </div>
        </Html>
      )}
    </group>
  )
}

// 3D Axis component
function AxisLine({ start, end, color, label }: { 
  start: [number, number, number], 
  end: [number, number, number], 
  color: string,
  label: string 
}) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <group>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }))} />
      <Text
        position={end}
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

// 3D Heatmap visualization component
function Heatmap3DScene({ cotAnalysis }: { cotAnalysis: CotAnalysis }) {
  // Convert brain functions to a grid layout
  const heatmapCells = useMemo(() => {
    const entries = Object.entries(cotAnalysis)
    const gridSize = Math.ceil(Math.sqrt(entries.length))
    
    return entries.map(([functionName, activation], index) => {
      const mapping = brainMapping[functionName as keyof typeof brainMapping]
      if (!mapping) return null
      
      // Calculate grid position
      const x = (index % gridSize) - gridSize / 2
      const z = Math.floor(index / gridSize) - gridSize / 2
      const y = 0 // Base level
      
      return {
        position: [x, y, z] as [number, number, number],
        activation: Math.round(activation * 100) / 100,
        color: mapping.color,
        label: mapping.region,
        description: mapping.description,
        functionName,
      }
    }).filter((cell): cell is NonNullable<typeof cell> => cell !== null)
  }, [cotAnalysis])

  // Calculate grid boundaries for axes
  const maxCoord = Math.ceil(Math.sqrt(Object.keys(cotAnalysis).length) / 2) + 1

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      
      {/* Grid base */}
      <Grid
        args={[maxCoord * 2, maxCoord * 2]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#4b5563"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, -0.05, 0]}
      />
      
      {/* 3D Axes */}
      <AxisLine 
        start={[-maxCoord, 0, 0]} 
        end={[maxCoord, 0, 0]} 
        color="#ef4444" 
        label="X" 
      />
      <AxisLine 
        start={[0, 0, 0]} 
        end={[0, 4, 0]} 
        color="#22c55e" 
        label="Y" 
      />
      <AxisLine 
        start={[0, 0, -maxCoord]} 
        end={[0, 0, maxCoord]} 
        color="#3b82f6" 
        label="Z" 
      />
      
      {/* Axis labels at origin */}
      <Text
        position={[-maxCoord - 0.5, -0.5, 0]}
        fontSize={0.3}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
      >
        X-Axis
      </Text>
      <Text
        position={[0, 4.5, 0]}
        fontSize={0.3}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
      >
        Y-Axis (Activation)
      </Text>
      <Text
        position={[0, -0.5, maxCoord + 0.5]}
        fontSize={0.3}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
      >
        Z-Axis
      </Text>
      
      {/* Heatmap cells */}
      {heatmapCells.map((cell, index) => (
        <HeatmapCell
          key={`${cell.functionName}-${index}`}
          position={cell.position}
          activation={cell.activation}
          color={cell.color}
          label={cell.label}
          description={cell.description}
        />
      ))}
      
      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={25}
        minDistance={5}
        maxPolarAngle={Math.PI / 2} // Prevent going below the ground
      />
    </>
  )
}

// Loading component
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading 3D Heatmap...</p>
      </div>
    </Html>
  )
}

const BrainTimeVisualization3D: React.FC<BrainTimeVisualization3DProps> = ({ timeline }) => {
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

  // Prepare data for charts and stats
  const chartData = prepareBrainChartData(cotAnalysis)
  const { maxActivation, activeRegions, avgActivation } = calculateBrainStats(chartData)

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            3D Brain Activity Heatmap
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive 3D heatmap visualization with X, Y, Z axes showing cognitive function activation over time
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

      {/* 3D Heatmap Visualization */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            3D Heatmap with XYZ Axes
          </CardTitle>
          <CardDescription>
            Interactive 3D heatmap (drag to rotate, scroll to zoom, hover for details). Height represents activation intensity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Canvas
              camera={{ position: [8, 6, 8], fov: 60 }}
              style={{ height: '100%', width: '100%' }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <Heatmap3DScene cotAnalysis={cotAnalysis} />
              </Suspense>
            </Canvas>
          </div>
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

export default BrainTimeVisualization3D