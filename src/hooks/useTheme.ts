import { create } from 'zustand'

import {
  accentColors,
  coloredAction,
  resolveAdaptiveColor,
  telemetryColors,
  uiColors,
  type ResolvedTheme,
  type ThemeColor,
} from '@/constants/theme'

interface ThemeState {
  resolvedTheme: ResolvedTheme
  outdoorLight: number
  setResolution: (resolvedTheme: ResolvedTheme, outdoorLight: number) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  resolvedTheme: 'dark',
  outdoorLight: 0,
  setResolution: (resolvedTheme, outdoorLight) => set({ resolvedTheme, outdoorLight }),
}))

/** Plain zinc UI-kit colors for Skia and other renderers that cannot resolve adaptive tokens. */
export function useResolvedUiColors() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  return uiColors[resolvedTheme]
}

/** Plain accent strings for Mapbox, Skia, Reanimated worklets, and solid action pairs. */
export function useResolvedAccentColors() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  return accentColors[resolvedTheme]
}

/** Plain metric colors for Skia, Mapbox, Reanimated worklets, and chart data structures. */
export function useResolvedTelemetryColors() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  return telemetryColors[resolvedTheme]
}

/** Resolve one adaptive token when a renderer-facing API accepts a caller-selected color. */
export function useResolvedColor(color: ThemeColor): string {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  return resolveAdaptiveColor(color, resolvedTheme)
}

/**
 * Background of a colored-action button (trash, Ride it, accent/tune/success/destructive, tonal
 * circles, map-sheet delete/save/vote, group-ride CTA): the accent tints the surface beneath at
 * `coloredAction.tint`. Pass the accent as a resolved hex or adaptive token.
 */
export function useColoredAction(accent: ThemeColor): string {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  return `rgba(${hexToRgb(resolveAdaptiveColor(accent, resolvedTheme))},${coloredAction.tint})`
}

/** Foreground (label, icon, border) of a colored-action button: the accent in the active appearance. */
export function useColoredActionForeground(accent: ThemeColor): string {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  return resolveAdaptiveColor(accent, resolvedTheme)
}

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '')
  const [r, g, b] =
    value.length === 3
      ? value.split('').map((c) => Number.parseInt(c + c, 16))
      : [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16))
  return `${r},${g},${b}`
}
