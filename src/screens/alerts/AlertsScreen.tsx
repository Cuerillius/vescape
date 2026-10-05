import { useMemo } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Accordion, type AccordionItem } from '@/components/ui/Accordion'
import { CardDescription } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { BoardTopSpeedCard } from '@/modules/alerts/components/BoardTopSpeedCard'
import { ALERT_CONTROL_ICONS } from '@/modules/alerts/constants/alertControlIcons'
import { MetricAlerts } from '@/modules/alerts/components/MetricAlerts'
import { useBoardMetricAlerts } from '@/modules/alerts/hooks/useMetricAlerts'
import {
  boardAlertPresetSelection,
  boardTopSpeedKmh,
} from '@/modules/alerts/lib/boardAlertSettings'
import { useAlertsStore } from '@/modules/alerts/store/alertsStore'
import { MetricDetailGauge } from '@/modules/board/components/MetricDetailGauge'
import { presentTelemetryMetric, telemetryByControlId } from '@/modules/board/constants/telemetry'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { ALERT_CONTROL_IDS, controlAlertState } from '@/modules/alerts/lib/alertSummary'

/** Controls whose alerts are previewed on a live gauge: the live value the gauge follows. */
const GAUGE_VALUES: Partial<Record<string, SharedValue<number | null>>> = {
  'motor-current': liveTelemetryRuntime.values.motorCurrent,
  'batt-current': liveTelemetryRuntime.values.batteryCurrent,
}

/** One control's alert setup: preset levels, or the rider's own rules. */
function ControlAlerts({ controlId, unit }: { controlId: string; unit: string }) {
  const controller = useBoardMetricAlerts(controlId)
  const gaugeValue = GAUGE_VALUES[controlId]
  const metric = telemetryByControlId[controlId]
  return (
    <>
      {gaugeValue && metric ? <MetricDetailGauge metric={metric} value={gaugeValue} /> : null}
      <MetricAlerts controller={controller} unit={unit} />
    </>
  )
}

/**
 * Every alert in one place, for the active board: its top speed, which scales the speed alerts,
 * and one row per control to set preset levels or add its own rules. The control detail screens
 * only draw where these alerts would trigger.
 */
export function AlertsScreen() {
  const units = useUnitSystem()
  const board = useBoardStore((s) => s.boards.find((b) => b.id === s.activeBoardId))
  const updateBoard = useBoardStore((s) => s.updateBoard)
  const rules = useAlertsStore((s) => s.rules)

  const items = useMemo<AccordionItem[]>(() => {
    const selection = boardAlertPresetSelection(board)
    return ALERT_CONTROL_IDS.map((controlId) => {
      const metric = telemetryByControlId[controlId]!
      return {
        key: controlId,
        title: metric.label,
        summary: controlAlertState(controlId, selection, rules).summary,
        icon: ALERT_CONTROL_ICONS[controlId],
        testID: `alerts-${controlId}`,
        content: (
          <ControlAlerts controlId={controlId} unit={presentTelemetryMetric(metric, units).unit} />
        ),
      }
    })
  }, [board, rules, units])

  if (!board) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <CardDescription style={styles.empty}>
          Alerts belong to a board. Add one to set up what it warns you about.
        </CardDescription>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <BoardTopSpeedCard
          value={boardTopSpeedKmh(board)}
          onChange={(kmh) => void updateBoard({ ...board, topSpeedKmh: kmh })}
        />
        <Accordion items={items} defaultOpenKey="" />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  empty: { padding: 16 },
})
