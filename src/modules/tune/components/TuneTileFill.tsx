import { StyleSheet, View } from 'react-native'

import { theme } from '@/constants/theme'

const TRACK_HEIGHT = 5

/** A bar along the bottom edge of a tune tile, filled to `fraction` of the range. */
export function TuneTileFill({ fraction }: { fraction: number | null }) {
  const filled = fraction == null ? 0 : Math.min(1, Math.max(0, fraction))
  return (
    <View pointerEvents="none" style={styles.track}>
      <View style={[styles.fill, { width: `${filled * 100}%` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TRACK_HEIGHT,
    backgroundColor: theme.ui.border,
  },
  fill: {
    height: TRACK_HEIGHT,
    backgroundColor: theme.ui.foreground,
  },
})
