import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated'

import { theme, type ThemeColor } from '@/constants/theme'

interface ProgressProps {
  /** 0–1, or null for an empty track. Updates on the UI thread without re-rendering React. */
  value: SharedValue<number | null>
  color?: ThemeColor
  /** `lg` is a thick bar, for one that carries a heading row. */
  size?: 'default' | 'lg'
}

/** Horizontal bar showing how full a value is. */
export function Progress({ value, color = theme.ui.primary, size = 'default' }: ProgressProps) {
  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(1, Math.max(0, value.value ?? 0)) * 100}%`,
  }))
  return (
    <View style={[styles.track, size === 'lg' && styles.trackLg]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.ui.muted,
    overflow: 'hidden',
  },
  trackLg: {
    height: 10,
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
})
