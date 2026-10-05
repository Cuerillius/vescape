import { useUnitSystem } from '@/hooks/useUnitSystem'
import { speedFromKmh, speedInputToKmh, speedUnit } from '@/helpers/units'
import { stepDelta } from '@/helpers/numberStep'
import { StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'
import { useShallow } from 'zustand/react/shallow'

import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { theme } from '@/constants/theme'
import {
  DEFAULT_HISTORY_METRIC_HOT_RANGES,
  type HistoryMetricHotRanges,
  type HistoryMetricKey,
} from '@/modules/history/lib/metricColorScale'
import { Stepper } from '@/components/ui/Stepper'
import { Switch } from '@/components/ui/Switch'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'

const HOT_RANGE_METRICS: {
  key: Exclude<HistoryMetricKey, 'battery'>
  label: string
  unit: string
  min: number
  max: number
}[] = [
  { key: 'speed', label: 'Speed', unit: 'km/h', min: 0, max: 120 },
  { key: 'duty', label: 'Duty', unit: '%', min: 0, max: 100 },
  { key: 'tempMotor', label: 'Motor temp', unit: '°C', min: 0, max: 140 },
  { key: 'tempController', label: 'Controller temp', unit: '°C', min: 0, max: 140 },
  { key: 'motorCurrent', label: 'Motor current', unit: 'A', min: 0, max: 200 },
  { key: 'batteryCurrent', label: 'Battery current', unit: 'A', min: 0, max: 200 },
]

export default function GraphsSettingsScreen() {
  const units = useUnitSystem()
  const { historyMetricGradientsEnabled, historyMetricHotRanges, set } = useSettingsStore(
    useShallow((s) => ({
      historyMetricGradientsEnabled: s.historyMetricGradientsEnabled,
      historyMetricHotRanges: s.historyMetricHotRanges,
      set: s.set,
    })),
  )

  const setHotRangeValue = (
    metric: Exclude<HistoryMetricKey, 'battery'>,
    edge: 'start' | 'end',
    value: number,
  ) => {
    const fallback = DEFAULT_HISTORY_METRIC_HOT_RANGES[metric] ?? { start: 0, end: 1 }
    const current = historyMetricHotRanges[metric] ?? fallback
    const nextRanges: HistoryMetricHotRanges = {
      ...historyMetricHotRanges,
      [metric]: { ...current, [edge]: value },
    }
    void set('historyMetricHotRanges', nextRanges)
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Hot graph ramps start at Start and reach full warning color at End.
        </SettingsDescription>
        <SettingsGroup>
          <SettingsLink
            icon={IconGauge}
            label="Graph hot gradients"
            hint="Color live, history, and map graphs by metric value"
            right={
              <Switch
                accessibilityLabel="Graph hot gradients"
                value={historyMetricGradientsEnabled}
                onValueChange={(v) => void set('historyMetricGradientsEnabled', v)}
              />
            }
          />
        </SettingsGroup>
        {HOT_RANGE_METRICS.map((metric) => {
          const fallback = DEFAULT_HISTORY_METRIC_HOT_RANGES[metric.key] ?? { start: 0, end: 1 }
          const range = historyMetricHotRanges[metric.key] ?? fallback

          const isSpeed = metric.key === 'speed'
          const display = (value: number) => (isSpeed ? speedFromKmh(value, units) : value)
          const unit = isSpeed ? speedUnit(units) : metric.unit
          const formatValue = (value: number) => String(Number(value.toFixed(1)))
          const stepperProps = {
            formatValue,
            step: isSpeed ? stepDelta : 1,
            unit,
            min: display(metric.min),
            max: display(metric.max),
          }

          return (
            <SettingsGroup key={metric.key} title={metric.label}>
              <SettingsLink
                icon={IconChartLine}
                label="Start"
                hint={`Default: ${formatValue(display(fallback.start))}\u2013${formatValue(display(fallback.end))} ${unit}`}
                right={
                  <Stepper
                    {...stepperProps}
                    label={`${metric.label} start`}
                    value={display(range.start)}
                    onChange={(nextValue) => {
                      const clampedValue = isSpeed
                        ? speedInputToKmh(nextValue, range.start, units, metric.min, metric.max)
                        : Math.min(metric.max, Math.max(metric.min, nextValue))
                      if (clampedValue !== range.start) {
                        setHotRangeValue(metric.key, 'start', clampedValue)
                      }
                    }}
                  />
                }
              />
              <SettingsLink
                icon={IconChartLine}
                label="End"
                right={
                  <Stepper
                    {...stepperProps}
                    label={`${metric.label} end`}
                    value={display(range.end)}
                    onChange={(nextValue) => {
                      const clampedValue = isSpeed
                        ? speedInputToKmh(nextValue, range.end, units, metric.min, metric.max)
                        : Math.min(metric.max, Math.max(metric.min, nextValue))
                      if (clampedValue !== range.end) {
                        setHotRangeValue(metric.key, 'end', clampedValue)
                      }
                    }}
                  />
                }
              />
            </SettingsGroup>
          )
        })}
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
