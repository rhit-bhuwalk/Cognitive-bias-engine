import brainMapping from "../../lib/brainMapping"

interface CotAnalysis {
  [key: string]: number
}

interface BrainChartData {
  function: string
  region: string
  activation: number
  fill: string
  color: string
  description: string
}

export const prepareBrainChartData = (cotAnalysis: CotAnalysis): BrainChartData[] => {
  return Object.entries(cotAnalysis)
    .map(([functionName, activation]) => ({
      function: functionName,
      region: brainMapping[functionName as keyof typeof brainMapping]?.region || functionName,
      activation: Math.round(activation * 100) / 100,
      fill: brainMapping[functionName as keyof typeof brainMapping]?.color || "#8b5cf6",
      color: brainMapping[functionName as keyof typeof brainMapping]?.color || "#8b5cf6",
      description: brainMapping[functionName as keyof typeof brainMapping]?.description || "",
    }))
    .sort((a, b) => b.activation - a.activation)
}

export const calculateBrainStats = (chartData: BrainChartData[]) => {
  const maxActivation = Math.max(...chartData.map((d) => d.activation))
  const activeRegions = chartData.filter((d) => d.activation > 0.1).length
  const avgActivation = chartData.reduce((sum, d) => sum + d.activation, 0) / chartData.length

  return {
    maxActivation,
    activeRegions,
    avgActivation,
  }
} 