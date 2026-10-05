import { StyleSheet, View } from 'react-native'
import IconEngine from '@tabler/icons-react-native/IconEngine'
import type { BoardWarningSeverity } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { severityStatus } from '@/modules/board/constants/boardWarnings'
import { useResolvedAccentColors } from '@/hooks/useTheme'
import { NavRow } from '@/screens/main/board/NavRow'

/**
 * The Board view's warnings line, styled like `VescFaultsNavRow`. While undismissed warnings are
 * pending it is a loud row: tinted, bold label and a solid count in the worst severity's color
 * (orange for warn, red for critical). With nothing pending it stays as a quiet row.
 */
export function BoardWarningsNavRow({
  count,
  severity,
  hasDismissed,
  onPress,
}: {
  count: number
  severity: BoardWarningSeverity | null
  /** Warnings exist but the rider acknowledged all of them. */
  hasDismissed: boolean
  onPress: () => void
}) {
  const pending = count > 0
  const accents = useResolvedAccentColors()
  const solid = severity === 'critical' ? accents.red : accents.orange
  return (
    <NavRow
      icon={IconEngine}
      accent={pending ? severityStatus(severity ?? 'warn').color : undefined}
      label="Warnings"
      value={pending ? undefined : hasDismissed ? 'All dismissed' : 'None'}
      badge={
        pending ? (
          <View style={[styles.count, { backgroundColor: solid.solid }]}>
            <Text style={[styles.countText, { color: solid.onSolid }]}>{count}</Text>
          </View>
        ) : undefined
      }
      onPress={onPress}
      testID="board-warnings-row"
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
