import { useEffect, useMemo, useState } from 'react'

import type { ResolvedTheme } from '@/constants/theme'
import {
  composeSwisstopoStyle,
  loadSwisstopoStyle,
  type SwisstopoStyle,
} from '@/modules/map/lib/swisstopoStyle'

/**
 * The composed Swisstopo style document, or null while the official style is still loading or
 * could not be fetched; callers fall back to Swiss-styled Streets meanwhile.
 */
export function useSwisstopoStyle(enabled: boolean, theme: ResolvedTheme): string | null {
  const [official, setOfficial] = useState<SwisstopoStyle | null>(null)

  useEffect(() => {
    if (!enabled || official) return
    let active = true
    loadSwisstopoStyle().then(
      (style) => {
        if (active) setOfficial(style)
      },
      () => {},
    )
    return () => {
      active = false
    }
  }, [enabled, official])

  return useMemo(
    () => (official ? composeSwisstopoStyle(official, theme) : null),
    [official, theme],
  )
}
