import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { theme } from '@/constants/theme'
import { formatBoardTransport, formatRefloatIdentity } from '@/modules/board/lib/boardTransport'
import type { Board } from '@/modules/board/store/boardStore'

interface BoardLinkSheetProps {
  /** The board whose link is shown; `null` keeps the drawer closed. */
  board: Board | null
  onClose: () => void
  onRelink: (board: Board) => void
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  )
}

/** The bottom drawer with what a board's link detected, and the way to link it again. */
export function BoardLinkSheet({ board, onClose, onRelink }: BoardLinkSheetProps) {
  const link = board?.link ?? null
  const refloat = link ? formatRefloatIdentity(link) : null

  return (
    <Drawer
      visible={board != null}
      title="Board link"
      description={link ? undefined : 'This board is not linked yet.'}
      onClose={onClose}
    >
      <View style={styles.container}>
        {link ? (
          <View style={styles.card}>
            <FactRow label="Bluetooth device" value={link.bleId} />
            <FactRow label="Transport" value={formatBoardTransport(link.transport)} />
            {link.vescFirmwareVersion ? (
              <FactRow label="Firmware" value={link.vescFirmwareVersion} />
            ) : null}
            {refloat ? <FactRow label="Refloat" value={refloat} /> : null}
            {link.hasBms != null ? (
              <FactRow label="Battery" value={link.hasBms ? 'Smart BMS' : 'No BMS'} />
            ) : null}
            <FactRow
              label="Link type"
              value={link.linkVersion === 4 ? 'Board Link v4' : 'Legacy Board Link'}
            />
          </View>
        ) : null}
        <Button
          label={link ? 'Relink board' : 'Link board'}
          onPress={() => board && onRelink(board)}
          testID="board-relink-button"
        />
      </View>
    </Drawer>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  card: {
    backgroundColor: theme.ui.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.ui.border,
  },
  label: { color: theme.ui.mutedForeground, fontSize: 13 },
  value: { flexShrink: 1, color: theme.ui.foreground, fontSize: 13, fontWeight: '600' },
})
