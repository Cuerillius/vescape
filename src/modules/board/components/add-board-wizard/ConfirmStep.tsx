import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import IconCheck from '@tabler/icons-react-native/IconCheck'

import { Text } from '@/components/base/Text'
import { Accordion, type AccordionItem } from '@/components/ui/Accordion'
import { Card, CardDescription } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { theme } from '@/constants/theme'
import { speedFromKmh, speedUnit } from '@/helpers/units'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { ALERT_CONTROL_ICONS } from '@/modules/alerts/constants/alertControlIcons'
import { ALERT_PRESET_METRICS } from '@/modules/alerts/lib/alertPresets'
import { alertLevelSummary } from '@/modules/alerts/lib/alertSummary'
import { draftAlertPreview } from '@/modules/alerts/lib/draftAlertPreview'
import { DraftMetricAlerts } from '@/modules/board/components/add-board-wizard/DraftMetricAlerts'
import {
  WizardFooterButtons,
  WizardStepLayout,
} from '@/modules/board/components/add-board-wizard/WizardStepLayout'
import { ALERT_METRIC_META } from '@/modules/board/components/add-board-wizard/alertMetricMeta'
import type { UseAddBoardWizard } from '@/modules/board/hooks/useAddBoardWizard'
import { formatBmsSuffix, formatBoardTransport } from '@/modules/board/lib/boardTransport'

export function ConfirmStep({ wizard }: { wizard: UseAddBoardWizard }) {
  const units = useUnitSystem()
  const { alertSetup, topSpeedKmh, hasBatteryConfig } = wizard

  const { alertItems, previewErrors } = useMemo(() => {
    const errors: string[] = []
    const items = ALERT_PRESET_METRICS.map((metric): AccordionItem => {
      const { level, rules } = alertSetup[metric]
      const preview = draftAlertPreview(
        metric,
        level,
        { speedUnitSystem: units, topSpeedKmh, hasBatteryConfig },
        rules,
      )
      if (preview.error) errors.push(`${ALERT_METRIC_META[metric].name}: ${preview.error}`)
      return {
        key: metric,
        title: ALERT_METRIC_META[metric].name,
        summary: alertLevelSummary(level, rules.filter((rule) => rule.enabled).length),
        icon: ALERT_CONTROL_ICONS[metric],
        testID: `add-board-alerts-${metric}`,
        content: <DraftMetricAlerts wizard={wizard} metric={metric} />,
      }
    })
    return { alertItems: items, previewErrors: errors }
  }, [alertSetup, hasBatteryConfig, topSpeedKmh, units, wizard])

  return (
    <WizardStepLayout
      title="Review & save"
      description="Everything can be changed later from the Board tab."
      footer={
        <WizardFooterButtons
          onBack={wizard.back}
          onForward={() => void wizard.save()}
          forwardLabel="Save"
          forwardIcon={IconCheck}
          forwardDisabled={!wizard.canSave || previewErrors.length > 0}
          backTestID="add-board-confirm-back"
          forwardTestID="add-board-save"
        />
      }
    >
      <Card>
        <ConfirmRow
          label="Board link"
          value={
            wizard.draftLink
              ? `${wizard.bleName || wizard.bleId} · ${formatBoardTransport(wizard.draftLink.transport)}${formatBmsSuffix(wizard.draftLink.hasBms)}`
              : 'Offline (not linked)'
          }
        />
        <Separator />
        <ConfirmRow label="Name" value={wizard.name.trim() || 'Unnamed board'} />
        <Separator />
        <ConfirmRow label={wizard.batterySummary.title} value={wizard.batterySummary.value} />
        <Separator />
        <ConfirmRow
          label="Top speed"
          value={`${Math.round(speedFromKmh(topSpeedKmh, units))} ${speedUnit(units)}`}
        />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <CardDescription>
          Optional — sensible defaults are already on. Open a metric to tune it.
        </CardDescription>
        {previewErrors.map((error) => (
          <Text key={error} style={styles.error}>
            {error}
          </Text>
        ))}
        <Accordion items={alertItems} defaultOpenKey="" />
      </View>
    </WizardStepLayout>
  )
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <CardDescription>{label}</CardDescription>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  error: {
    color: theme.status.error.text,
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  value: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
})
