import type { TuneProfileFieldValue } from 'vescape-core'

import { BASIC_SLIDER_BY_ID, clamp } from '@/modules/tune/lib/sliderDefinitions'

/** The five basic sliders that shape a tune's feel, each scaled 0..1 across its own range. */
export interface TuneCardFactors {
  aggressiveness: number
  noseStiffness: number
  carveTilt: number
  brakeTilt: number
  atrIntensity: number
}

type Rgb = [number, number, number]

/** Everything the card shader reads, in the shader's own units. Colors are 0..1 channels. */
export interface TuneCardShaderUniforms {
  /** Sweep angle of the flow, in radians. */
  angle: number
  /** How far the noise bends the ribbons. */
  warp: number
  /** Spatial frequency of that noise. */
  freq: number
  /** Wobble along the main ribbon. */
  ripple: number
  /** Half-width of the main ribbon. */
  width: number
  /** Distance over which the ribbon edge dithers from one tone to the other. */
  feather: number
  /** Grain cell size in logical pixels. */
  cell: number
  /** 0 hides the brake ribbon. */
  brake: number
  brakeWidth: number
  seed: number
  baseColor: Rgb
  /** The base drifts toward this where the noise is high, so it is never one flat color. */
  shadeColor: Rgb
  ribbonColor: Rgb
  brakeColor: Rgb
}

export interface TuneCardShader {
  uniforms: TuneCardShaderUniforms
  /** Dark text color that reads on both tones of this card. */
  ink: string
}

/** The hue runs from green at the calm end to orange-red at the hot end. */
const HUE_CALM = 135
const HUE_HOT = 12
const BRAKE_RIBBON: Rgb = [252 / 255, 250 / 255, 245 / 255]

/** A field the board does not report leaves its factor at the quiet end. */
export function tuneCardFactors(fields: Record<string, TuneProfileFieldValue>): TuneCardFactors {
  const numeric = new Map<string, number | null>(
    Object.entries(fields).map(([id, value]) => [
      id,
      typeof value === 'number' && Number.isFinite(value) ? value : null,
    ]),
  )
  const factor = (sliderId: string): number => {
    const def = BASIC_SLIDER_BY_ID.get(sliderId)
    const value = def?.deriveSliderValue(numeric)
    if (!def || value == null) return 0
    return clamp((value - def.min) / (def.max - def.min), 0, 1)
  }
  return {
    aggressiveness: factor('aggressiveness'),
    noseStiffness: factor('noseStiffness'),
    carveTilt: factor('carveTilt'),
    brakeTilt: factor('brakeTilt'),
    atrIntensity: factor('atrIntensity'),
  }
}

/** Stable value for a set of factors, so the same tune always draws the same card. */
function factorsSeed(factors: TuneCardFactors): number {
  let hash = 7
  for (const value of Object.values(factors)) {
    hash = (Math.imul(hash, 31) + Math.round(value * 100)) | 0
  }
  return Math.abs(hash)
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const h = (((hue % 360) + 360) % 360) / 30
  const a = saturation * Math.min(lightness, 1 - lightness)
  const channel = (n: number) => {
    const k = (n + h) % 12
    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [channel(0), channel(8), channel(4)]
}

/** Reads the `#rgb`, `#rrggbb`, and `rgb()`/`rgba()` forms the theme resolves to; anything else is gray. */
function parseColor(color: string): Rgb {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color)?.[1]
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255) as Rgb
  }
  const channels = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color)
  if (channels) return [1, 2, 3].map((i) => Number(channels[i]) / 255) as Rgb
  return [0.5, 0.5, 0.5]
}

function rgbToHex([r, g, b]: Rgb): string {
  const byte = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${byte(r)}${byte(g)}${byte(b)}`
}

/**
 * Look of a tune card. Each factor owns one visual channel, none shared, so a rider can read the
 * tune off the card: aggressiveness sets the color (green to orange-red), nose stiffness the
 * ribbon's width and how crisp its edge is, carve tilt the sweep angle, brake tilt a second white
 * ribbon, and ATR intensity how turbulent the flow and how coarse the grain are. A hash of all the
 * values only seeds the noise and nudges the hue a few degrees, so tunes that read alike still
 * differ and no factor is drowned out by it.
 */
export function tuneCardShader(factors: TuneCardFactors): TuneCardShader {
  const { aggressiveness, noseStiffness, carveTilt, brakeTilt, atrIntensity } = factors
  const seed = factorsSeed(factors)
  const hue = HUE_CALM + (HUE_HOT - HUE_CALM) * aggressiveness + ((seed % 11) - 5) * 0.8
  return {
    uniforms: {
      angle: -0.12 + carveTilt * 0.85,
      warp: 0.1 + atrIntensity * 0.75,
      freq: 1.4 + atrIntensity * 1.6,
      ripple: 0.04 * (0.4 + atrIntensity),
      width: 0.2 - noseStiffness * 0.13,
      feather: 0.22 - noseStiffness * 0.17,
      cell: 1.1 + atrIntensity * 1.2,
      brake: brakeTilt,
      brakeWidth: 0.015 + brakeTilt * 0.14,
      seed: seed % 1000,
      baseColor: hslToRgb(hue, 0.62, 0.4),
      shadeColor: hslToRgb(hue - 8, 0.66, 0.35),
      ribbonColor: hslToRgb(hue, 0.85, 0.7),
      brakeColor: BRAKE_RIBBON,
    },
    ink: rgbToHex(hslToRgb(hue, 0.6, 0.12)),
  }
}

const BLACK: Rgb = [0, 0, 0]
const WHITE: Rgb = [1, 1, 1]

/**
 * Look of a page that has no tune to draw, such as New tune or an unavailable board: the same
 * gradients and grain in the state's color, with a fixed calm flow and no brake ribbon.
 */
export function statusCardShader(color: string): TuneCardShader {
  const base = parseColor(color)
  const toward = (target: Rgb, level: number): Rgb => [
    base[0] + (target[0] - base[0]) * level,
    base[1] + (target[1] - base[1]) * level,
    base[2] + (target[2] - base[2]) * level,
  ]
  return {
    uniforms: {
      angle: 0.3,
      warp: 0.35,
      freq: 2.2,
      ripple: 0.02,
      width: 0.15,
      feather: 0.12,
      cell: 1.6,
      brake: 0,
      brakeWidth: 0,
      seed: 7,
      baseColor: toward(BLACK, 0.4),
      shadeColor: toward(BLACK, 0.5),
      ribbonColor: toward(WHITE, 0.35),
      brakeColor: BRAKE_RIBBON,
    },
    ink: rgbToHex(toward(BLACK, 0.88)),
  }
}
