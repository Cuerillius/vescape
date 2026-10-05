import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useDerivedValue, type DerivedValue, type SharedValue } from 'react-native-reanimated'

import { MonoValue } from '@/components/base/MonoValue'
import { Text } from '@/components/base/Text'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { interaction, theme } from '@/constants/theme'

/** Live number as text. No reading shows as zero; the status row already says "Not connected". */
export function useLiveNumberText(
  value: SharedValue<number | null>,
  decimals: number,
  unit: string,
): DerivedValue<string> {
  return useDerivedValue(() => {
    const v = value.value
    const n = v == null || !Number.isFinite(v) ? 0 : v
    return `${decimals === 0 ? Math.round(n) : n.toFixed(decimals)}${unit}`
  })
}

/** Caption over a live value, centred in a small card. */
export function MetricTile({
  label,
  value,
  onPress,
  testID,
}: {
  label: string
  value: DerivedValue<string>
  onPress?: () => void
  testID?: string
}) {
  return (
    <Card onPress={onPress} accessibilityLabel={label} style={styles.tile} testID={testID}>
      <Text style={styles.tileLabel} numberOfLines={1}>
        {label}
      </Text>
      <MonoValue
        text={value}
        size={16}
        weight="700"
        align="center"
        color={theme.ui.foreground}
        style={styles.stretch}
      />
    </Card>
  )
}

/** A bar with independent left/right headings over a thick bar. `fraction` is 0–1 or null. */
export function DualMetricBar({
  left,
  right,
  fraction,
  onPress,
}: {
  left: ReactNode
  right: ReactNode
  fraction: SharedValue<number | null>
  onPress?: () => void
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      android_ripple={onPress ? interaction.ripple : undefined}
      style={styles.bar}
    >
      <View style={styles.dualHeading}>
        <View style={styles.barHeading}>{left}</View>
        <View style={styles.barHeading}>{right}</View>
      </View>
      <Progress value={fraction} size="lg" />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  stretch: {
    alignSelf: 'stretch',
  },
  tile: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tileLabel: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '500',
  },
  bar: {
    gap: 10,
  },
  barHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 26,
  },
  dualHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
