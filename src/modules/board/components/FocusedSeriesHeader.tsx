import { StyleSheet } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { formatFocusedSeriesDetail } from '@/modules/board/lib/focusedSeriesHeader'
import { useFocusedSeriesStore } from '@/modules/board/store/focusedSeriesStore'

/**
 * Caption above the detail charts: what the line is drawn from. The window itself is named by the
 * accordion row the charts sit in.
 */
export function FocusedSeriesHeader() {
  const spanMs = useFocusedSeriesStore((s) => s.spanMs)
  const sampleRateHz = useFocusedSeriesStore((s) => s.sampleRateHz)

  return <Text style={styles.caption}>{formatFocusedSeriesDetail(spanMs, sampleRateHz)}</Text>
}

const styles = StyleSheet.create({
  caption: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
  },
})
