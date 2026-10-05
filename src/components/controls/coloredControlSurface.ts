import { theme, type ThemeColor } from '@/constants/theme'
import { useColoredAction, useColoredActionForeground } from '@/hooks/useTheme'

/**
 * The colored-action surface a selection control (switch, radio) sits on, resolved to plain strings
 * so worklets can interpolate them: the accent tints the surface beneath when selected and is
 * transparent otherwise.
 */
export function useColoredControlSurface(accent: ThemeColor) {
  const tint = useColoredActionForeground(accent)
  return {
    tint,
    tintSoft: theme.alpha(tint, 0.6),
    selected: useColoredAction(accent),
    unselected: theme.alpha(tint, 0),
  }
}
