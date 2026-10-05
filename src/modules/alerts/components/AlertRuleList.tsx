import { useFormat } from '@/hooks/useFormat'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import IconMessage from '@tabler/icons-react-native/IconMessage'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import IconRadioactive from '@tabler/icons-react-native/IconRadioactive'
import IconTrash from '@tabler/icons-react-native/IconTrash'
import IconVolume from '@tabler/icons-react-native/IconVolume'
import IconVolumeOff from '@tabler/icons-react-native/IconVolumeOff'
import IconWaveSine from '@tabler/icons-react-native/IconWaveSine'

import { Button } from '@/components/ui/Button'
import { Text } from '@/components/base/Text'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { DerivedBatteryConfig } from '@/modules/battery/lib/types'
import { AlertFormSheet } from '@/modules/alerts/components/AlertFormSheet'
import type { DraftAlertRule } from '@/modules/alerts/lib/customAlertRules'
import type { MetricAlertsController } from '@/modules/alerts/hooks/useMetricAlerts'
import type { AlertRuleDraft } from '@/modules/alerts/store/alertsStore'

/**
 * The rider's own Alert Rules for one control: rows with mute + delete, and the add/edit form.
 * Purely a view over a {@link MetricAlertsController}, so the same list serves a saved Board and
 * the add-board wizard's draft.
 */
export function AlertRuleList({
  controller,
  unit,
  batteryConfig,
}: {
  controller: MetricAlertsController
  unit: string
  /** Set for battery, whose rules are state-of-charge % rather than raw volts. */
  batteryConfig: DerivedBatteryConfig | null
}) {
  const [formVisible, setFormVisible] = useState(false)
  const [editRule, setEditRule] = useState<DraftAlertRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DraftAlertRule | null>(null)

  const closeForm = () => {
    setFormVisible(false)
    setEditRule(null)
  }

  const handleSave = async (draft: AlertRuleDraft) => {
    if (editRule) await controller.updateRule(editRule.id, draft)
    else await controller.addRule(draft)
    closeForm()
  }

  return (
    <>
      {controller.rules.map((rule) => (
        <AlertRuleRow
          key={rule.id}
          rule={rule}
          unit={unit}
          batteryConfig={batteryConfig}
          onEdit={() => {
            setEditRule(rule)
            setFormVisible(true)
          }}
          onToggle={() => {
            // intentional-suppression: Alerts store error is rendered by the active form or list
            void controller.toggleRule(rule.id).catch(() => undefined) // Store error renders below.
          }}
          onDelete={() => setDeleteTarget(rule)}
        />
      ))}

      {controller.rules.length === 0 ? (
        <Text style={styles.emptyHintText}>
          No alerts yet — get notified when this crosses a threshold
        </Text>
      ) : null}

      {controller.error ? <Text style={styles.errorText}>{controller.error}</Text> : null}

      <View style={styles.addButtonRow}>
        <Button
          label="Add alert"
          icon={IconPlus}
          variant="outline"
          onPress={() => {
            setEditRule(null)
            setFormVisible(true)
          }}
        />
      </View>

      <AlertFormSheet
        visible={formVisible}
        controlId={controller.controlId}
        unit={unit}
        editRule={editRule}
        batteryConfig={batteryConfig}
        error={controller.error}
        onClose={closeForm}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={deleteTarget != null}
        title="Delete Alert"
        message="Remove this alert? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleteTarget) await controller.removeRule(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export function AlertRuleRow({
  rule,
  unit,
  batteryConfig,
  onEdit,
  onToggle,
  onDelete,
}: {
  rule: DraftAlertRule
  unit: string
  batteryConfig: DerivedBatteryConfig | null
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const { formatSpeedWithUnit } = useFormat()
  const foreground = useResolvedColor(theme.ui.foreground)
  const muted = useResolvedColor(theme.ui.mutedForeground)
  const faint = useResolvedColor(theme.ui.faintForeground)
  const format = (value: number) =>
    rule.controlId === 'speed'
      ? formatSpeedWithUnit(value, 1)
      : formatAlertValue(value, batteryConfig, unit)
  const isGeiger = rule.thresholdMax != null
  const isTts = rule.soundType.startsWith('tts:')
  const TypeIcon = isGeiger ? IconRadioactive : isTts ? IconMessage : IconWaveSine
  const detail = [
    rule.repeatEverySeconds == null ? null : `every ${rule.repeatEverySeconds}s`,
    isGeiger || isTts ? null : `${rule.beepCount}×`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <TouchableOpacity style={styles.ruleRow} onPress={onEdit} activeOpacity={0.7}>
      <View style={styles.ruleTypeIcon}>
        <TypeIcon size={18} color={rule.enabled ? foreground : faint} strokeWidth={2} />
      </View>

      <View style={styles.ruleContent}>
        <Text style={[styles.ruleThreshold, !rule.enabled && styles.ruleTextDisabled]}>
          {isGeiger
            ? `${format(rule.threshold)} – ${format(rule.thresholdMax!)}`
            : format(rule.threshold)}
        </Text>
        {isTts && (
          <Text
            style={[styles.ruleTtsTemplate, !rule.enabled && styles.ruleTextDisabled]}
            numberOfLines={1}
          >
            {rule.soundType.slice(4)}
          </Text>
        )}
        {detail ? (
          <Text style={[styles.ruleDetail, !rule.enabled && styles.ruleTextDisabled]}>
            {detail}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        hitSlop={8}
        style={styles.ruleAction}
      >
        {rule.enabled ? (
          <IconVolume size={16} color={foreground} strokeWidth={2} />
        ) : (
          <IconVolumeOff size={16} color={faint} strokeWidth={2} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        hitSlop={8}
        style={styles.ruleAction}
      >
        <IconTrash size={16} color={muted} strokeWidth={2} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

function formatAlertValue(value: number, bc: DerivedBatteryConfig | null, unit: string) {
  if (bc) return `${Math.round(value)}%`
  return `${value}${unit ? ` ${unit}` : ''}`
}

const styles = StyleSheet.create({
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  ruleTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.muted,
  },
  ruleContent: {
    flex: 1,
  },
  ruleThreshold: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  ruleTtsTemplate: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    marginTop: 1,
  },
  ruleDetail: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    marginTop: 1,
  },
  ruleTextDisabled: {
    color: theme.ui.faintForeground,
  },
  ruleAction: {
    padding: 6,
  },
  addButtonRow: {
    alignItems: 'flex-start',
  },
  emptyHintText: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  errorText: {
    color: theme.status.error.text,
    fontSize: 12,
    fontWeight: '500',
  },
})
