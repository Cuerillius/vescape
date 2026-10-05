import { useFormat } from '@/hooks/useFormat'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { speedFromKmh, speedInputToKmh, speedUnit } from '@/helpers/units'
import { stepDelta } from '@/helpers/numberStep'
import { StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconArrowsHorizontal from '@tabler/icons-react-native/IconArrowsHorizontal'
import IconBan from '@tabler/icons-react-native/IconBan'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import { useShallow } from 'zustand/react/shallow'

import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { useHistoryStore } from '@/modules/history/store/historyStore'
import { DEFAULT_RIDE_SPLIT_GAP_MINUTES } from '@/modules/history/lib/sessions'
import { theme } from '@/constants/theme'
import { Stepper } from '@/components/ui/Stepper'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'

const MIN_RIDE_SPLIT_GAP_MINUTES = 1
const MAX_RIDE_SPLIT_GAP_MINUTES = 240

export default function HistorySettingsScreen() {
  const units = useUnitSystem()
  const { formatSpeedWithUnit } = useFormat()
  const {
    rideSplitGapMinutes,
    movingSpeedThresholdKmh,
    freeSpinMaxSpeedDeltaKmh,
    freeSpinStationaryBoardCapKmh,
    set,
  } = useSettingsStore(
    useShallow((s) => ({
      rideSplitGapMinutes: s.rideSplitGapMinutes,
      movingSpeedThresholdKmh: s.movingSpeedThresholdKmh,
      freeSpinMaxSpeedDeltaKmh: s.freeSpinMaxSpeedDeltaKmh,
      freeSpinStationaryBoardCapKmh: s.freeSpinStationaryBoardCapKmh,
      set: s.set,
    })),
  )
  const regroupSessions = useHistoryStore((s) => s.regroupSessions)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          How recorded telemetry becomes rides in your history.
        </SettingsDescription>

        <SettingsGroup title="Rides">
          <SettingsLink
            icon={IconRoute}
            label="Split older rides after"
            hint={`Older rides only. A stop longer than this splits them into separate rides.\nRides recorded now keep their own start and end, whatever happens in between.\nDefault: ${DEFAULT_RIDE_SPLIT_GAP_MINUTES} min.`}
            right={
              <Stepper
                label="ride split gap"
                step={1}
                value={rideSplitGapMinutes}
                unit="min"
                min={MIN_RIDE_SPLIT_GAP_MINUTES}
                max={MAX_RIDE_SPLIT_GAP_MINUTES}
                onChange={(nextValue) => {
                  const clampedValue = Math.min(
                    MAX_RIDE_SPLIT_GAP_MINUTES,
                    Math.max(MIN_RIDE_SPLIT_GAP_MINUTES, nextValue),
                  )
                  if (clampedValue === rideSplitGapMinutes) return
                  void set('rideSplitGapMinutes', clampedValue).then(regroupSessions)
                }}
              />
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Filters">
          <SettingsLink
            icon={IconGauge}
            label="Moving speed threshold"
            hint={`Speeds below this are ignored for avg speed.\nDefault: ${formatSpeedWithUnit(3, units === 'imperial' ? 1 : 0)}.`}
            right={
              <Stepper
                label="moving speed threshold"
                value={speedFromKmh(movingSpeedThresholdKmh, units)}
                formatValue={(value) => String(Number(value.toFixed(1)))}
                step={stepDelta}
                unit={speedUnit(units)}
                min={speedFromKmh(0, units)}
                max={speedFromKmh(20, units)}
                onChange={(nextValue) => {
                  const clampedValue = speedInputToKmh(
                    nextValue,
                    movingSpeedThresholdKmh,
                    units,
                    0,
                    20,
                  )
                  if (clampedValue !== movingSpeedThresholdKmh) {
                    void set('movingSpeedThresholdKmh', clampedValue)
                  }
                }}
              />
            }
          />
          <SettingsLink
            icon={IconArrowsHorizontal}
            label="Free spin speed delta"
            hint={`Max board-vs-GPS speed gap before sample is excluded as free spin. Lower will increase the number of excluded samples.\nDefault: ${formatSpeedWithUnit(12, units === 'imperial' ? 1 : 0)}.`}
            right={
              <Stepper
                label="free spin speed delta"
                value={speedFromKmh(freeSpinMaxSpeedDeltaKmh, units)}
                formatValue={(value) => String(Number(value.toFixed(1)))}
                step={stepDelta}
                unit={speedUnit(units)}
                min={speedFromKmh(1, units)}
                max={speedFromKmh(60, units)}
                onChange={(nextValue) => {
                  const clampedValue = speedInputToKmh(
                    nextValue,
                    freeSpinMaxSpeedDeltaKmh,
                    units,
                    1,
                    60,
                  )
                  if (clampedValue !== freeSpinMaxSpeedDeltaKmh) {
                    void set('freeSpinMaxSpeedDeltaKmh', clampedValue)
                  }
                }}
              />
            }
          />
          <SettingsLink
            icon={IconBan}
            label="Free spin stationary cap"
            hint={`Max board speed allowed when GPS is nearly stationary. Lower will increase the number of excluded samples.\nDefault: ${formatSpeedWithUnit(15, units === 'imperial' ? 1 : 0)}.`}
            right={
              <Stepper
                label="free spin stationary cap"
                value={speedFromKmh(freeSpinStationaryBoardCapKmh, units)}
                formatValue={(value) => String(Number(value.toFixed(1)))}
                step={stepDelta}
                unit={speedUnit(units)}
                min={speedFromKmh(1, units)}
                max={speedFromKmh(60, units)}
                onChange={(nextValue) => {
                  const clampedValue = speedInputToKmh(
                    nextValue,
                    freeSpinStationaryBoardCapKmh,
                    units,
                    1,
                    60,
                  )
                  if (clampedValue !== freeSpinStationaryBoardCapKmh) {
                    void set('freeSpinStationaryBoardCapKmh', clampedValue)
                  }
                }}
              />
            }
          />
        </SettingsGroup>
        <SettingsDescription>
          Filter changes apply to new rides only. Rebuild history to reprocess past rides.
        </SettingsDescription>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 24,
  },
})
