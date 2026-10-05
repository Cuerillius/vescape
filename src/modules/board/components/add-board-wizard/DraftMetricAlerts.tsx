import { useCallback } from 'react'

import { MetricAlerts } from '@/modules/alerts/components/MetricAlerts'
import { ALERT_PRESET_METRIC_UNITS } from '@/modules/alerts/constants/metricLabels'
import { useDraftMetricAlerts, type DraftAlertSetup } from '@/modules/alerts/hooks/useMetricAlerts'
import type { AlertPresetMetric } from '@/modules/alerts/lib/alertPresets'
import type { UseAddBoardWizard } from '@/modules/board/hooks/useAddBoardWizard'

/** One metric's alert setup, editing the wizard's draft instead of a saved Board. */
export function DraftMetricAlerts({
  wizard,
  metric,
}: {
  wizard: UseAddBoardWizard
  metric: AlertPresetMetric
}) {
  const { setAlertSetup } = wizard
  const onChange = useCallback(
    (setup: DraftAlertSetup) => setAlertSetup(metric, setup),
    [setAlertSetup, metric],
  )
  const controller = useDraftMetricAlerts(metric, {
    setup: wizard.alertSetup[metric],
    topSpeedKmh: wizard.topSpeedKmh,
    hasBatteryConfig: wizard.hasBatteryConfig,
    onChange,
  })

  return <MetricAlerts controller={controller} unit={ALERT_PRESET_METRIC_UNITS[metric]} />
}
