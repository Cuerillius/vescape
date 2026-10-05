import { StyleSheet, View } from 'react-native'
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedAccentColors } from '@/hooks/useTheme'
import { NavRow } from '@/screens/main/board/NavRow'

/**
 * The Board view's VESC faults line. While the controller has faults it is the loudest row on the
 * page: orange tinted row, bold orange label and a solid orange count.
 */
export function VescFaultsNavRow({ count, onPress }: { count: number; onPress: () => void }) {
  const faulted = count > 0
  const orange = useResolvedAccentColors().orange
  return (
    <NavRow
      icon={IconAlertTriangle}
      accent={faulted ? theme.status.warning.color : undefined}
      label="VESC faults"
      value={faulted ? undefined : 'None'}
      badge={
        faulted ? (
          <View style={[styles.count, { backgroundColor: orange.solid }]}>
            <Text style={[styles.countText, { color: orange.onSolid }]}>{count}</Text>
          </View>
        ) : undefined
      }
      onPress={onPress}
      testID="board-faults-row"
    />
  )
}

const styles = StyleSheet.create({
  count: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
})
