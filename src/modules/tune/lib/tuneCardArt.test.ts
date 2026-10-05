import { expect, test } from 'bun:test'

import {
  statusCardShader,
  tuneCardFactors,
  tuneCardShader,
  type TuneCardFactors,
} from '@/modules/tune/lib/tuneCardArt'

const CALM: TuneCardFactors = {
  aggressiveness: 0.2,
  noseStiffness: 0.2,
  carveTilt: 0.2,
  brakeTilt: 0.2,
  atrIntensity: 0.2,
}

test('scales each slider across its own range and leaves a missing field at the quiet end', () => {
  const factors = tuneCardFactors({
    kp: 30, // aggressiveness slider = kp - 20 = 10, the top of -5..10
    torquetilt_strength: 0.15, // nose stiffness slider = 5 of 0..10
    turntilt_strength: 15,
    braketilt_strength: 'not a number',
  })
  expect(factors.aggressiveness).toBe(1)
  expect(factors.noseStiffness).toBeCloseTo(0.5)
  expect(factors.carveTilt).toBe(1)
  expect(factors.brakeTilt).toBe(0)
  expect(factors.atrIntensity).toBe(0)
})

test('the same tune always draws the same card, and any changed value draws a different one', () => {
  const first = tuneCardShader(CALM)
  expect(tuneCardShader(CALM)).toEqual(first)
  expect(tuneCardShader({ ...CALM, brakeTilt: 0.7 }).uniforms.seed).not.toBe(first.uniforms.seed)
})

test('tunes with the same aggressiveness differ in shape, not color', () => {
  const soft = tuneCardShader({ ...CALM, noseStiffness: 0, carveTilt: 0, atrIntensity: 0 })
  const busy = tuneCardShader({ ...CALM, noseStiffness: 1, carveTilt: 1, atrIntensity: 1 })
  expect(busy.uniforms.width).toBeLessThan(soft.uniforms.width)
  expect(busy.uniforms.feather).toBeLessThan(soft.uniforms.feather)
  expect(busy.uniforms.angle).toBeGreaterThan(soft.uniforms.angle)
  expect(busy.uniforms.warp).toBeGreaterThan(soft.uniforms.warp)
  expect(busy.uniforms.cell).toBeGreaterThan(soft.uniforms.cell)
  // Only the hash nudge separates the colors; the green-to-red hue is the same.
  const hueGap = Math.abs(soft.uniforms.baseColor[1] - busy.uniforms.baseColor[1])
  expect(hueGap).toBeLessThan(0.1)
})

test('aggressiveness moves the color from green to orange-red', () => {
  const calm = tuneCardShader({ ...CALM, aggressiveness: 0 }).uniforms.baseColor
  const hot = tuneCardShader({ ...CALM, aggressiveness: 1 }).uniforms.baseColor
  expect(calm[1]).toBeGreaterThan(calm[0])
  expect(hot[0]).toBeGreaterThan(hot[1])
})

test('brake tilt widens the white ribbon and zero hides it', () => {
  const none = tuneCardShader({ ...CALM, brakeTilt: 0 }).uniforms
  const full = tuneCardShader({ ...CALM, brakeTilt: 1 }).uniforms
  expect(none.brake).toBe(0)
  expect(full.brakeWidth).toBeGreaterThan(none.brakeWidth)
})

test('a status card takes the state color, hides the brake ribbon, and reads in dark ink', () => {
  const status = statusCardShader('#d97706')
  expect(statusCardShader('#d97706')).toEqual(status)
  expect(status.uniforms.brake).toBe(0)
  const [r, g, b] = status.uniforms.baseColor
  expect(r).toBeGreaterThan(g)
  expect(g).toBeGreaterThan(b)
  expect(r).toBeLessThan(0xd9 / 255)
  expect(status.ink).toMatch(/^#[0-9a-f]{6}$/)
  // Anything the theme resolves to that is not hex or rgb falls back to gray rather than throwing.
  const [fr, fg, fb] = statusCardShader('hsl(10 10% 10%)').uniforms.baseColor
  expect(fr).toBe(fg)
  expect(fg).toBe(fb)
})
