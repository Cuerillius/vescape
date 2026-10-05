import { describe, expect, test } from 'bun:test'

import { mapStyleForTheme } from '@/modules/map/lib/mapTheme'

describe('mapStyleForTheme', () => {
  test('retired saved styles render as their replacement', () => {
    expect(mapStyleForTheme('onedark')).toBe('colorful')
    expect(mapStyleForTheme('outdoors')).toBe('colorful')
    expect(mapStyleForTheme('satellite')).toBe('satelliteLegacy')
  })

  test('current styles survive unchanged', () => {
    for (const style of ['colorful', 'colorfulDark', 'satelliteLegacy', 'mapy'] as const) {
      expect(mapStyleForTheme(style)).toBe(style)
    }
  })
})
