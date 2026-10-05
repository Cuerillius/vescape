import { Pressable, StyleSheet, View } from 'react-native'

import { theme } from '@/constants/theme'

const WIDTH = 44
const HEIGHT = 26
const THUMB = 20
const PAD = 2

interface SwitchProps {
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
  /** Names the setting for screen readers. */
  accessibilityLabel?: string
  testID?: string
}

/** shadcn-style switch: a monochrome pill whose thumb rides to the primary-filled end when on. */
export function Switch({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
  testID,
}: SwitchProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      style={[styles.track, value ? styles.trackOn : styles.trackOff, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    padding: PAD - 1,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: theme.ui.primary,
    borderColor: theme.ui.primary,
    alignItems: 'flex-end',
  },
  trackOff: {
    backgroundColor: theme.ui.muted,
    borderColor: theme.ui.border,
    alignItems: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
  },
  thumbOn: {
    backgroundColor: theme.ui.primaryForeground,
  },
  thumbOff: {
    backgroundColor: theme.ui.mutedForeground,
  },
})
