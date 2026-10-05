import { useMemo } from 'react'
import { StyleSheet } from 'react-native'

import { HeaderBackButton } from '@/components/base/HeaderBackButton'
import { theme, uiColors } from '@/constants/theme'
import { useThemeStore } from '@/hooks/useTheme'

/**
 * Default stack header options: the header takes the screen's own `theme.ui.background` zinc
 * surface, with a borderless back arrow, a left-aligned title and a hairline underneath.
 */
export function useStackHeaderOptions() {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme)
  const ui = uiColors[resolvedTheme]
  return useMemo(
    () => ({
      headerStyle: {
        backgroundColor: ui.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: ui.border,
      },
      headerTintColor: ui.foreground,
      headerTitleAlign: 'left' as const,
      headerTitleStyle: { fontFamily: theme.font('600'), fontSize: 19 },
      headerShadowVisible: false,
      headerLeft: () => <HeaderBackButton />,
      headerLeftContainerStyle: { paddingLeft: 6 },
      headerRightContainerStyle: { paddingRight: 10 },
      cardStyle: { backgroundColor: ui.background },
    }),
    [ui.background, ui.border, ui.foreground],
  )
}
