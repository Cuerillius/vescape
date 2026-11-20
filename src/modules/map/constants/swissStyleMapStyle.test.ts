import { describe, expect, test } from 'bun:test'

import { getOneDarkMapStyle } from '@/modules/map/constants/oneDarkMapStyle'
import { getSwissMapStyle } from '@/modules/map/constants/swissStyleMapStyle'
import { SWISSTOPO_PALETTES } from '@/modules/map/constants/swisstopoPalette'

interface Layer {
  id: string
  paint?: Record<string, unknown>
}

const layers = (json: string) => (JSON.parse(json) as { layers: Layer[] }).layers
const byId = (list: Layer[]) => new Map(list.map((layer) => [layer.id, layer]))

describe('getSwissMapStyle', () => {
  test('keeps the Streets layer set in both tones', () => {
    const streets = layers(getOneDarkMapStyle(true, true, false)).map((layer) => layer.id)
    for (const theme of ['light', 'dark'] as const) {
      expect(layers(getSwissMapStyle(theme)).map((layer) => layer.id)).toEqual(streets)
    }
  })

  test('paints land and water from the Swisstopo palette', () => {
    for (const theme of ['light', 'dark'] as const) {
      const style = byId(layers(getSwissMapStyle(theme)))
      expect(style.get('background')?.paint?.['background-color']).toBe(
        SWISSTOPO_PALETTES[theme].land,
      )
      expect(style.get('water')?.paint?.['fill-color']).toBe(SWISSTOPO_PALETTES[theme].water)
    }
  })

  test('road layers are recolored rather than left on the Streets colors', () => {
    const streets = byId(layers(getOneDarkMapStyle(true, true, false)))
    const swiss = byId(layers(getSwissMapStyle('light')))
    for (const id of ['road-street', 'road-primary', 'road-motorway']) {
      expect(swiss.get(id)?.paint?.['line-color']).not.toBe(streets.get(id)?.paint?.['line-color'])
    }
  })
})
