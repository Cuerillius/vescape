import { StyleSheet } from 'react-native'
import IconBatteryVertical from '@tabler/icons-react-native/IconBatteryVertical'
import IconBatteryVerticalCharging from '@tabler/icons-react-native/IconBatteryVerticalCharging'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'

import { MonoValue } from '@/components/base/MonoValue'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { BatteryFill } from '@/screens/main/dashboard/BatteryFill'

/** Ride dashboard battery readout: charge fill behind percent and voltage. */
export function BatteryCard({
  percent,
  voltage,
  charging,
  onPress,
}: {
  percent: SharedValue<number | null>
  voltage: SharedValue<number | null>
  charging: boolean
  onPress?: () => void
}) {
  const foregroundColor = useResolvedColor(theme.ui.foreground)
  const text = useDerivedValue(
    () => `${Math.round(percent.value ?? 0)}%  |  ${(voltage.value ?? 0).toFixed(1)}V`,
  )

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      accessibilityLabel="Battery"
      testID="dashboard-battery"
    >
      <BatteryFill percent={percent} charging={charging} />
      <MonoValue
        text={text}
        size={16}
        weight="800"
        color={theme.ui.foreground}
        style={styles.flex}
      />
      {charging ? (
        <IconBatteryVerticalCharging size={26} color={foregroundColor} />
      ) : (
        <IconBatteryVertical size={26} color={foregroundColor} />
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  flex: {
    flex: 1,
  },
})
