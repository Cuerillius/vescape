import type { ReactNode } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated'

import { theme } from '@/constants/theme'
import { useMainTabBarHeight } from '@/screens/main/MainTabBar'

// Above every map overlay (up to 44) so the view covers the map as well as the Ride dashboard, and
// below the tab bar (60) that switches away from it.
const COVER_VIEW_Z_INDEX = 50
const FADE_TIMING = { duration: 220 } as const
const SIDE_PADDING = 16

/**
 * The shell of a tab that covers the Ride dashboard and the map (Board, Profile): opaque, scrolling,
 * clear of the tab bar. Stays mounted and fades.
 */
export function CoverTabView({
  visible,
  testID,
  children,
}: {
  visible: boolean
  testID: string
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  const tabBarHeight = useMainTabBarHeight()
  const fade = useDerivedValue(() => withTiming(visible ? 1 : 0, FADE_TIMING))
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.root, fadeStyle]}
      testID={testID}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: tabBarHeight + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: COVER_VIEW_Z_INDEX,
    backgroundColor: theme.ui.background,
  },
  content: {
    paddingHorizontal: SIDE_PADDING,
    gap: 20,
  },
})
