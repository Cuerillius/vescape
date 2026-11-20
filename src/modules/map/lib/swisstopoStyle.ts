import type { ResolvedTheme } from '@/constants/theme'
import { getSwissMapStyle } from '@/modules/map/constants/swissStyleMapStyle'
import { SWISSTOPO_PALETTES } from '@/modules/map/constants/swisstopoPalette'

/**
 * The official Swisstopo Light Base Map (public, keyless MapLibre style). It is fetched at runtime
 * and drawn as-is inside Switzerland and Liechtenstein, so every layer, icon and label swisstopo
 * ships keeps working when the style is updated. Only the relief shading is swapped out (see
 * `composeSwisstopoStyle`); dark appearance recolors the layers without dropping any.
 */
export const SWISSTOPO_STYLE_URL =
  'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.lightbasemap.vt/style.json'

export interface SwisstopoStyleLayer {
  id: string
  type: string
  source?: string
  layout?: Record<string, unknown>
  paint?: Record<string, unknown>
  [key: string]: unknown
}

export interface SwisstopoStyle {
  glyphs: string
  sprite: string
  sources: Record<string, unknown>
  layers: SwisstopoStyleLayer[]
}

let pendingStyle: Promise<SwisstopoStyle> | null = null

/** Fetches the official style once per app run; a failed attempt is retried on the next call. */
export function loadSwisstopoStyle(): Promise<SwisstopoStyle> {
  pendingStyle ??= fetch(SWISSTOPO_STYLE_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`Swisstopo style HTTP ${response.status}`)
      return response.json() as Promise<SwisstopoStyle>
    })
    .catch((error: unknown) => {
      pendingStyle = null
      throw error
    })
  return pendingStyle
}

/**
 * Official layers that cover a buffer around the border (the vector features themselves stop at
 * the border), which would show up as a hard-edged shape in the Streets area.
 */
const RELIEF_LAYER_IDS = new Set(['background', 'hillshade_grey', 'hillshade_yellow'])

/** Swisstopo's glyph server only hosts Frutiger Neue; the Streets labels use the closest weights. */
const STREETS_FONT_BY_WEIGHT: Record<string, string> = {
  Bold: 'Frutiger Neue Condensed Bold',
  Medium: 'Frutiger Neue Condensed Medium',
}

function frutigerStack(fonts: unknown): string[] {
  const dinWeight = Array.isArray(fonts) ? /DIN Pro (\w+)/.exec(String(fonts[0]))?.[1] : undefined
  return [STREETS_FONT_BY_WEIGHT[dinWeight ?? ''] ?? 'Frutiger Neue Condensed Regular']
}

/** Streets layers re-homed onto the Swisstopo glyph set; sprite icons are not available there. */
function streetsLayers(theme: ResolvedTheme): SwisstopoStyleLayer[] {
  const style = JSON.parse(getSwissMapStyle(theme)) as { layers: SwisstopoStyleLayer[] }
  return style.layers.map((layer) => {
    const { 'icon-image': _iconImage, ...layout } = layer.layout ?? {}
    return {
      ...layer,
      id: `streets-${layer.id}`,
      ...(layer.type === 'symbol' && {
        layout: { ...layout, 'text-font': frutigerStack(layout['text-font']) },
      }),
    }
  })
}

const HILLSHADE_PAINT: Record<ResolvedTheme, Record<string, unknown>> = {
  light: {
    'hillshade-exaggeration': 0.4,
    'hillshade-shadow-color': '#6f7a8c',
    'hillshade-highlight-color': '#ffffff',
    'hillshade-accent-color': '#a7b0bf',
  },
  dark: {
    'hillshade-exaggeration': 0.5,
    'hillshade-shadow-color': '#02050b',
    'hillshade-highlight-color': '#4b586d',
    'hillshade-accent-color': '#0a111d',
  },
}

/** The official style versions its sources (`base_v1.0.0`); the municipality polygons live in `base`. */
function baseSourceId(official: SwisstopoStyle): string {
  const id = Object.keys(official.sources).find((key) => key.startsWith('base'))
  if (!id) throw new Error('Swisstopo style has no base source')
  return id
}

/**
 * One style document: Streets in the Swisstopo palette everywhere, with the untouched official map
 * on top inside Switzerland. The official `administrative_unit` polygons (municipalities, which
 * exist only inside the border) get the land color, so the official layers sit on an opaque base in
 * the exact shape of the country. One global hillshade covers both sides, so the relief has no seam.
 */
export function composeSwisstopoStyle(official: SwisstopoStyle, theme: ResolvedTheme): string {
  const swissLayers = official.layers
    .filter((layer) => !RELIEF_LAYER_IDS.has(layer.id))
    .map((layer) => (theme === 'dark' ? darkenLayer(layer) : layer))

  return JSON.stringify({
    version: 8,
    name: `Swisstopo ${theme}`,
    glyphs: official.glyphs,
    sprite: official.sprite,
    sources: {
      ...official.sources,
      composite: { url: 'mapbox://mapbox.mapbox-streets-v8', type: 'vector' },
      'swisstopo-dem': {
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        type: 'raster-dem',
        tileSize: 514,
      },
    },
    layers: [
      ...streetsLayers(theme),
      {
        id: 'swisstopo-land',
        type: 'fill',
        source: baseSourceId(official),
        'source-layer': 'administrative_unit',
        // Country polygons also exist for the neighbours and fill the whole tile; cantons and
        // municipalities only exist inside Switzerland and Liechtenstein.
        filter: ['in', ['get', 'class'], ['literal', ['canton', 'municipality']]],
        paint: { 'fill-color': SWISSTOPO_PALETTES[theme].land, 'fill-antialias': false },
      },
      {
        id: 'swisstopo-hillshade',
        type: 'hillshade',
        source: 'swisstopo-dem',
        paint: HILLSHADE_PAINT[theme],
      },
      ...swissLayers,
    ],
  })
}

const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))$/i

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

function parseColor(value: string): Rgba | null {
  const text = value.trim()
  if (text.startsWith('#')) {
    const hex =
      text.length === 4 ? [...text.slice(1)].map((digit) => digit + digit).join('') : text.slice(1)
    if (hex.length < 6) return null
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    }
  }
  const numbers = (/\(([^)]*)\)/.exec(text)?.[1] ?? '').split(',').map((part) => parseFloat(part))
  if (numbers.length < 3 || numbers.slice(0, 3).some(Number.isNaN)) return null
  const alpha = numbers[3] ?? 1
  if (text.startsWith('rgb')) return { r: numbers[0]!, g: numbers[1]!, b: numbers[2]!, a: alpha }
  return { ...hslToRgb(numbers[0]!, numbers[1]! / 100, numbers[2]! / 100), a: alpha }
}

function hslToRgb(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))
  return { r: f(0), g: f(8), b: f(4) }
}

function rgbToHsl({ r, g, b }: Rgba) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255] as const
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === rn
      ? (gn - bn) / d + (gn < bn ? 6 : 0)
      : max === gn
        ? (bn - rn) / d + 2
        : (rn - gn) / d + 4
  return { h: h * 60, s, l }
}

/** Light-to-dark: flips lightness into a dark range and mutes saturation, keeping hue and alpha. */
export function darkenColor(value: string): string {
  const parsed = COLOR_PATTERN.test(value) ? parseColor(value) : null
  if (!parsed) return value
  const { h, s, l } = rgbToHsl(parsed)
  const rgb = hslToRgb(h, s * 0.8, 0.09 + (1 - l) * 0.78)
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${parsed.a})`
}

function darkenValue(value: unknown): unknown {
  if (typeof value === 'string') return darkenColor(value)
  if (Array.isArray(value)) return value.map(darkenValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, darkenValue(item)]))
  }
  return value
}

function darkenLayer(layer: SwisstopoStyleLayer): SwisstopoStyleLayer {
  return layer.paint
    ? { ...layer, paint: darkenValue(layer.paint) as Record<string, unknown> }
    : layer
}
