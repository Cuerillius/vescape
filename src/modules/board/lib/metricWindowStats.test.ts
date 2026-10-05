import { describe, expect, it } from 'bun:test'

import { computeWindowStats } from '@/modules/board/lib/metricWindowStats'

describe('computeWindowStats', () => {
  it('returns null for an empty series', () => {
    expect(computeWindowStats({ ts: [], vs: [] })).toBeNull()
  })

  it('weights the average by how long each value was held', () => {
    // 10 for 900 ms, then 100 for the (unweighted) last sample.
    const stats = computeWindowStats({ ts: [0, 900, 1000], vs: [10, 20, 100] })
    expect(stats?.average).toBeCloseTo((10 * 900 + 20 * 100) / 1000)
  })

  it('keeps the sign of the largest-magnitude sample as the peak', () => {
    const stats = computeWindowStats({ ts: [0, 100, 200], vs: [40, -90, 60] })
    expect(stats?.peak).toBe(-90)
    expect(stats?.lowest).toBe(-90)
  })

  it('counts time near a threshold by magnitude and ignores stream gaps', () => {
    const stats = computeWindowStats({ ts: [0, 500, 1000, 60_000], vs: [80, -85, 10, 90] }, 75)
    // 500 ms + 500 ms near; the 59 s hold after the 10 is a gap capped at 1 s but below threshold.
    expect(stats?.secondsNear).toBeCloseTo(1)
  })
})
