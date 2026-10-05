import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { CardTitle } from '@/components/ui/Card'
import { Stepper } from '@/components/ui/Stepper'
import { theme } from '@/constants/theme'
import { stepDelta } from '@/helpers/numberStep'
import { speedFromKmh, speedInputToKmh, speedUnit } from '@/helpers/units'
import { useUnitSystem } from '@/hooks/useUnitSystem'

const BOARD_TOP_SPEED_MIN = 5
const BOARD_TOP_SPEED_MAX = 150

/**
 * Board Top Speed stepper card (controlled). Scales the speed gauge full-scale and the speed alert
 * preset thresholds. Board-owned (#254): the caller supplies the current value and persists changes
 * (the active Board in Settings, or a draft in the add-board wizard).
 */
export function BoardTopSpeedCard({
  value,
  onChange,
}: {
  value: number
  onChange: (kmh: number) => void
}) {
  const units = useUnitSystem()
  const setTopSpeed = (next: number) => {
    const clamped = speedInputToKmh(next, value, units, BOARD_TOP_SPEED_MIN, BOARD_TOP_SPEED_MAX)
    if (clamped === value) return
    onChange(clamped)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <CardTitle style={styles.title}>Board top speed</CardTitle>
        <Stepper
          value={speedFromKmh(value, units)}
          formatValue={(v) => Number(v.toFixed(1)).toString()}
          unit={` ${speedUnit(units)}`}
          min={speedFromKmh(BOARD_TOP_SPEED_MIN, units)}
          max={speedFromKmh(BOARD_TOP_SPEED_MAX, units)}
          step={(v, direction) => stepDelta(v, direction, 5)}
          label="board top speed"
          onChange={setTopSpeed}
        />
      </View>
      <Text style={styles.hint}>
        Fastest you consider yourself capable of riding this board. Scales speed gauges and alerts.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1 },
  hint: { color: theme.ui.mutedForeground, fontSize: 13, lineHeight: 18 },
})
