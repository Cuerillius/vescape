import type { ChartSeriesData } from '@/components/charts/line/types'

export interface MetricWindowStats {
  /** Sample with the largest magnitude, sign kept — a regen spike is a peak too. */
  peak: number
  /** Time-weighted mean, so a burst of samples does not outweigh a quiet stretch. */
  average: number
  lowest: number
  /** Seconds spent at or beyond `nearThreshold` in magnitude; 0 when no threshold was given. */
  secondsNear: number
}

/** A stall longer than this is a gap in the stream, not a value held — it carries no weight. */
const MAX_HOLD_MS = 1000

/** Peak, average and time near a threshold over the series a live chart is showing. */
export function computeWindowStats(
  { ts, vs }: ChartSeriesData,
  nearThreshold?: number | null,
): MetricWindowStats | null {
  if (vs.length === 0) return null

  let peak = vs[0]
  let lowest = vs[0]
  let weighted = 0
  let weight = 0
  let nearMs = 0
  for (let i = 0; i < vs.length; i++) {
    const value = vs[i]
    if (Math.abs(value) > Math.abs(peak)) peak = value
    if (value < lowest) lowest = value
    const holdMs = i + 1 < vs.length ? Math.min(ts[i + 1] - ts[i], MAX_HOLD_MS) : 0
    weighted += value * holdMs
    weight += holdMs
    if (nearThreshold != null && Math.abs(value) >= nearThreshold) nearMs += holdMs
  }

  return {
    peak,
    average: weight > 0 ? weighted / weight : vs[vs.length - 1],
    lowest,
    secondsNear: nearMs / 1000,
  }
}
