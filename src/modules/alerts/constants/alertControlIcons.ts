import IconActivity from '@tabler/icons-react-native/IconActivity'
import IconBattery3 from '@tabler/icons-react-native/IconBattery3'
import IconBatteryCharging from '@tabler/icons-react-native/IconBatteryCharging'
import IconBolt from '@tabler/icons-react-native/IconBolt'
import IconFlame from '@tabler/icons-react-native/IconFlame'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconTemperature from '@tabler/icons-react-native/IconTemperature'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import type { AlertControlId } from '@/modules/alerts/lib/alertSummary'

/** The icon each alert control wears in the Alerts accordion, on the Alerts screen and in setup. */
export const ALERT_CONTROL_ICONS: Record<AlertControlId, TablerIcon> = {
  battery: IconBattery3,
  speed: IconGauge,
  duty: IconBolt,
  'motor-temp': IconTemperature,
  'controller-temp': IconFlame,
  'motor-current': IconActivity,
  'batt-current': IconBatteryCharging,
}
