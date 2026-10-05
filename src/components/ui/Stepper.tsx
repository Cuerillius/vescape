import { StyleSheet, View } from 'react-native'
import IconMinus from '@tabler/icons-react-native/IconMinus'
import IconPlus from '@tabler/icons-react-native/IconPlus'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'

interface StepperProps {
  value: number
  unit?: string
  min: number
  max: number
  /** A function returns the distance to the next clean step, for converted units. */
  step: number | ((value: number, direction: 1 | -1) => number)
  /** Presentation only; stepping and bounds keep the full numeric precision. */
  formatValue?: (value: number) => string
  onChange: (nextValue: number) => void
  /** Names the quantity for screen readers: "Decrease <label>" / "Increase <label>". */
  label: string
  testIDPrefix?: string
}

/** shadcn-style stepper: an outlined group of a minus button, the value, and a plus button. */
export function Stepper({
  value,
  unit,
  min,
  max,
  step,
  formatValue,
  onChange,
  label,
  testIDPrefix,
}: StepperProps) {
  const stepFor = (direction: 1 | -1) =>
    typeof step === 'function' ? step(value, direction) : step

  return (
    <View style={styles.group}>
      <Button
        icon={IconMinus}
        variant="outline"
        accessibilityLabel={`Decrease ${label}`}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - stepFor(-1)))}
        testID={testIDPrefix ? `${testIDPrefix}-decrement` : undefined}
      />
      <Text
        style={styles.value}
        accessibilityLabel={`${label} ${formatValue ? formatValue(value) : value}${unit ?? ''}`}
      >
        {formatValue ? formatValue(value) : value}
        {unit}
      </Text>
      <Button
        icon={IconPlus}
        variant="outline"
        accessibilityLabel={`Increase ${label}`}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + stepFor(1)))}
        testID={testIDPrefix ? `${testIDPrefix}-increment` : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    minWidth: 44,
    textAlign: 'center',
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
})
