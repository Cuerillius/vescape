import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { theme } from '@/constants/theme'
import { deriveBatteryConfig } from '@/modules/battery/lib'
import type { DerivedBatteryConfig } from '@/modules/battery/lib/types'
import { AlertPresetControl } from '@/modules/alerts/components/AlertPresetControl'
import { AlertRuleList } from '@/modules/alerts/components/AlertRuleList'
import type { MetricAlertsController } from '@/modules/alerts/hooks/useMetricAlerts'
import { useBoardStore } from '@/modules/board/store/boardStore'

interface MetricAlertsProps {
  controller: MetricAlertsController | null
  unit: string
}

/**
 * A control's whole alert setup: preset levels with their gauge, or — once the rider hits edit —
 * their own rules. One block, one source of truth per metric, used by the Alerts screen and by
 * the add-board wizard through their respective {@link MetricAlertsController}s.
 *
 * A `null` controller means no Board: Alert Rules are board-owned (#254), so instead of controls
 * that would silently write nowhere, the block explains that and offers the way forward.
 */
export function MetricAlerts({ controller, unit }: MetricAlertsProps) {
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  const batteryConfig = useBatteryConfig(controller?.controlId)

  if (!controller) return <NoBoardNotice />

  const { metric, level, hasBatteryConfig } = controller
  // Battery presets are SoC %-based — a hard block, not a prompt, without a valid battery config.
  const batteryBlocked = metric === 'battery' && !hasBatteryConfig
  const isCustom = level === 'custom'

  return (
    <View style={styles.container}>
      {metric ? (
        <AlertPresetControl
          metric={metric}
          level={level}
          onLevelChange={controller.setLevel}
          boardTopSpeedKmh={controller.topSpeedKmh}
          matchBoardConfig={controller.matchBoardConfig}
          onMatchBoardConfigChange={controller.setMatchBoardConfig}
          configBases={controller.configBases}
          disabled={batteryBlocked}
          ruleSnapshot={controller.ruleSnapshot}
          onCustomize={controller.customize}
          onDiscardCustom={() => setConfirmingDiscard(true)}
        />
      ) : null}

      {controller.error && !isCustom && metric ? (
        <Text style={styles.error}>{controller.error}</Text>
      ) : null}

      {batteryBlocked ? (
        <Text style={styles.note}>
          Battery presets need a valid battery configuration — they alert on state-of-charge %. Set
          up this board&apos;s battery to enable them.
        </Text>
      ) : null}

      {isCustom || !metric ? (
        <View style={styles.rules}>
          <AlertRuleList controller={controller} unit={unit} batteryConfig={batteryConfig} />
        </View>
      ) : null}

      <ConfirmModal
        visible={confirmingDiscard}
        title="Discard custom alerts"
        message={`Delete ${controller.rules.length} custom ${
          controller.rules.length === 1 ? 'alert' : 'alerts'
        } and return to presets?`}
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          controller.discardCustom()
          setConfirmingDiscard(false)
        }}
        onCancel={() => setConfirmingDiscard(false)}
      />
    </View>
  )
}

/** Battery rules are state-of-charge %, so the list and form need the board's derived config. */
function useBatteryConfig(controlId: string | undefined): DerivedBatteryConfig | null {
  const board = useBoardStore((s) => s.boards.find((b) => b.id === s.activeBoardId))
  return useMemo(() => {
    if (controlId !== 'battery') return null
    const derived = deriveBatteryConfig(board?.batteryConfig ?? null)
    return derived.warning == null ? derived : null
  }, [controlId, board?.batteryConfig])
}

/** The section header already carries the alert bell and the screen its own add-board path, so
 * this is the sentence alone — no second icon, no competing call to action. */
function NoBoardNotice() {
  return (
    <Text style={styles.note}>
      Alerts belong to a board — add yours to set up what it warns you about.
    </Text>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  error: { color: theme.status.error.text, fontSize: 12 },
  rules: {
    gap: 8,
  },
  note: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
})
