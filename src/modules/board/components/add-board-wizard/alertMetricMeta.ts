import { ALERT_PRESET_METRIC_LABELS } from '@/modules/alerts/constants/metricLabels'
import type { AlertPresetMetric } from '@/modules/alerts/lib/alertPresets'

export const ALERT_METRIC_META: Record<AlertPresetMetric, { name: string }> = {
  battery: { name: ALERT_PRESET_METRIC_LABELS.battery },
  'motor-temp': { name: ALERT_PRESET_METRIC_LABELS['motor-temp'] },
  'controller-temp': { name: ALERT_PRESET_METRIC_LABELS['controller-temp'] },
  speed: { name: ALERT_PRESET_METRIC_LABELS.speed },
  duty: { name: ALERT_PRESET_METRIC_LABELS.duty },
}
