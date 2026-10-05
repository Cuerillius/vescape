import type { Icon } from '@tabler/icons-react-native'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconClockPause from '@tabler/icons-react-native/IconClockPause'
import IconPlayerPause from '@tabler/icons-react-native/IconPlayerPause'
import IconPlayerStop from '@tabler/icons-react-native/IconPlayerStop'
import IconPlugConnected from '@tabler/icons-react-native/IconPlugConnected'
import IconPlugConnectedX from '@tabler/icons-react-native/IconPlugConnectedX'

import type { HistoryMarker } from '@/modules/history/store/historyStore'

/** Pin glyph per Ride History Marker type. */
export const HISTORY_MARKER_TABLER_ICONS: Record<HistoryMarker['type'], Icon> = {
  app_stop: IconPlayerStop,
  auto_pause: IconPlayerPause,
  connected: IconPlugConnected,
  connection_lost: IconPlugConnectedX,
  disconnected: IconPlugConnectedX,
  error: IconAlertCircle,
  gap: IconClockPause,
}
