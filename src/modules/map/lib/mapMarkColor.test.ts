import { describe, expect, test } from 'bun:test'

import { muteMarkColor } from '@/modules/map/lib/mapMarkColor'

function saturation(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max === min ? 0 : (max - min) / (1 - Math.abs(max + min - 1))
}

describe('muteMarkColor', () => {
  test('keeps the hue and lightness family but lowers saturation', () => {
    const muted = muteMarkColor('#22c55e', 0.5)
    expect(saturation(muted)).toBeLessThan(saturation('#22c55e'))
    expect(saturation(muted)).toBeGreaterThan(0.2)
    // Still green: the green channel stays dominant.
    expect(parseInt(muted.slice(3, 5), 16)).toBeGreaterThan(parseInt(muted.slice(1, 3), 16))
  })

  test('leaves greys and non-hex colors alone', () => {
    expect(muteMarkColor('#808080')).toBe('#808080')
    expect(muteMarkColor('rgba(1,2,3,0.5)')).toBe('rgba(1,2,3,0.5)')
  })
})
