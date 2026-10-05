import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native'

import { font, resolveAdaptiveColor, ui, type FontWeight } from '@/constants/theme'
import { useThemeStore } from '@/hooks/useTheme'

/** Map any RN `fontWeight` value to a shipped static Geist weight. Defaults to 400 (Regular). */
const toFontWeight = (weight: TextStyle['fontWeight']): FontWeight => {
  if (weight === undefined) return '400'
  if (weight === 'bold') return '700'
  if (weight === 'normal') return '400'
  const n = Math.min(900, Math.max(300, Number(weight)))
  return String(Math.round(n / 100) * 100) as FontWeight
}

/**
 * App-wide `Text` wrapper. Resolves `fontWeight` from `style` to the matching
 * static Geist family (`theme.font(weight)`) — each weight is a separately
 * named font on both platforms. Pass an
 * explicit `fontFamily` in `style` (`'monospace'` for readouts) to opt out;
 * opted-out styles keep their `fontWeight` untouched.
 * Defaults `color` to the primary text token so unstyled text never falls back
 * to RN's black on the dark surface.
 */
export function Text({ style, ...rest }: TextProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const flat = StyleSheet.flatten(style)
  const weight = toFontWeight(flat?.fontWeight)
  const raleway = flat?.fontFamily
    ? null
    : {
        fontFamily: font(weight),
        fontWeight: undefined,
        fontVariant: ['lining-nums' as const, ...(flat?.fontVariant ?? [])],
      }
  const color = resolveAdaptiveColor(flat?.color ?? ui.foreground, resolvedTheme) as
    | TextStyle['color']
    | undefined
  return <RNText style={[style, { color }, raleway]} {...rest} />
}
