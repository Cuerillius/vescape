import { describe, expect, test } from 'bun:test'

import {
  composeSwisstopoStyle,
  darkenColor,
  type SwisstopoStyle,
} from '@/modules/map/lib/swisstopoStyle'

const OFFICIAL: SwisstopoStyle = {
  glyphs: 'https://example.test/fonts/{fontstack}/{range}.pbf',
  sprite: 'https://example.test/sprite',
  sources: { 'base_v1.0.0': { type: 'vector', url: 'https://example.test/base.json' } },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#fcfcfc' } },
    { id: 'hillshade_grey', type: 'fill', source: 'relief_v1.0.0' },
    { id: 'hillshade_yellow', type: 'fill', source: 'relief_v1.0.0' },
    {
      id: 'water',
      type: 'fill',
      source: 'base_v1.0.0',
      paint: { 'fill-color': ['interpolate', ['linear'], ['zoom'], 4, 'rgb(209, 228, 240)'] },
    },
  ],
}

interface Layer {
  id: string
  type: string
  source?: string
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
}

function compose(theme: 'light' | 'dark') {
  return JSON.parse(composeSwisstopoStyle(OFFICIAL, theme)) as {
    glyphs: string
    sources: Record<string, unknown>
    layers: Layer[]
  }
}

describe('composeSwisstopoStyle', () => {
  test('keeps official layers in order and swaps the bleeding relief for one global hillshade', () => {
    const ids = compose('light').layers.map((layer) => layer.id)
    expect(ids.slice(-3)).toEqual(['swisstopo-land', 'swisstopo-hillshade', 'water'])
    expect(ids).not.toContain('hillshade_grey')
    expect(ids).not.toContain('background')
  })

  test('uses the official glyphs, so Streets labels move to Frutiger without sprite icons', () => {
    const style = compose('light')
    expect(style.glyphs).toBe(OFFICIAL.glyphs)
    const labels = style.layers.filter(
      (layer) => layer.id.startsWith('streets-') && layer.type === 'symbol',
    )
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      const [font] = (label.layout?.['text-font'] ?? []) as string[]
      expect(font).toStartWith('Frutiger Neue')
      expect(label.layout).not.toHaveProperty('icon-image')
    }
  })

  test('puts the land base on the official municipality polygons', () => {
    const land = compose('light').layers.find((layer) => layer.id === 'swisstopo-land')
    expect(land?.source).toBe('base_v1.0.0')
    // Neighbouring countries have polygons in the same layer; filling those paints a rectangle.
    expect(JSON.stringify((land as { filter?: unknown }).filter)).toContain('canton')
    expect(JSON.stringify((land as { filter?: unknown }).filter)).not.toContain('country')
  })

  test('light leaves official colors untouched, dark recolors nested expression values', () => {
    const lightWater = compose('light').layers.at(-1)
    expect(JSON.stringify(lightWater?.paint)).toContain('rgb(209, 228, 240)')
    const darkWater = compose('dark').layers.at(-1)
    expect(JSON.stringify(darkWater?.paint)).not.toContain('rgb(209, 228, 240)')
    expect(JSON.stringify(darkWater?.paint)).toContain('rgba(')
  })
})

describe('darkenColor', () => {
  test('flips light colors dark and keeps alpha', () => {
    expect(darkenColor('rgba(255, 255, 255, 0.5)')).toBe('rgba(23, 23, 23, 0.5)')
    expect(darkenColor('#000000')).toBe('rgba(222, 222, 222, 1)')
  })

  test('leaves non-colors alone', () => {
    expect(darkenColor('river')).toBe('river')
    expect(darkenColor('exponential')).toBe('exponential')
  })
})
