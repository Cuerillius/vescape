import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import IconBluetooth from '@tabler/icons-react-native/IconBluetooth'
import IconLink from '@tabler/icons-react-native/IconLink'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconPlus from '@tabler/icons-react-native/IconPlus'

import { Text } from '@/components/base/Text'
import { OnewheelIcon } from '@/components/icons/OnewheelIcon'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription } from '@/components/ui/Card'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { isConnecting } from '@/modules/board/lib/boardConnection'
import type { Board } from '@/modules/board/store/boardStore'
import { routes } from '@/navigation/routes'
import { boardStatus } from '@/screens/main/board/boardStatus'

interface BoardsListProps {
  boards: Board[]
  activeBoardId: string | null
  bleStatus: string
  onConnectBoard: (id: string) => void
  onDisconnect: () => void
  onAddBoard: () => void
}

/** Below this a board is worth warning about before the rider gets on it. */
const LOW_BATTERY_PERCENT = 20

function BoardRow({
  board,
  lastUsed,
  bleStatus,
  locked,
  onConnect,
  onCancel,
}: {
  board: Board
  lastUsed: boolean
  /** Connection status; null for a board that is not the active one. */
  bleStatus: string | null
  /** Another board is mid-connect, so this one can't be started yet. */
  locked: boolean
  onConnect: () => void
  onCancel: () => void
}) {
  const status = boardStatus(board, bleStatus)
  const busy = status.tone === 'busy'
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const attentionColor = useResolvedColor(theme.status.warning.text)
  const lowColor = useResolvedColor(theme.status.error.text)
  const statusColor =
    status.tone === 'error'
      ? theme.status.error.text
      : status.tone === 'attention'
        ? theme.status.warning.text
        : theme.ui.mutedForeground
  const statusLabel = lastUsed && status.tone === 'idle' ? 'Last used' : status.label
  const ActionIcon = status.tone === 'attention' ? IconLink : IconBluetooth
  return (
    <View style={styles.boardRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${status.tone === 'attention' ? 'Link' : 'Connect'} ${board.name}`}
        onPress={onConnect}
        disabled={busy || locked}
        android_ripple={interaction.ripple}
        style={({ pressed }) => [
          styles.boardMain,
          pressed && styles.pressed,
          locked && styles.locked,
        ]}
        testID={`board-connect-${board.id}`}
      >
        <View style={styles.boardText}>
          <Text style={styles.boardName} numberOfLines={1}>
            {board.name}
          </Text>
          <View style={styles.statusLine}>
            {busy ? <ActivityIndicator size="small" color={mutedColor} /> : null}
            <CardDescription style={{ color: statusColor }}>{statusLabel}</CardDescription>
          </View>
        </View>
        {status.lastSeen ? (
          <View style={styles.lastSeen}>
            <Text
              style={[
                styles.percent,
                status.lastSeen.percent < LOW_BATTERY_PERCENT && { color: theme.status.error.text },
              ]}
            >
              {`${status.lastSeen.percent}%`}
            </Text>
            <CardDescription>{status.lastSeen.ago}</CardDescription>
          </View>
        ) : null}
        {busy ? null : (
          <ActionIcon
            size={20}
            color={
              status.tone === 'attention'
                ? attentionColor
                : status.lastSeen && status.lastSeen.percent < LOW_BATTERY_PERCENT
                  ? lowColor
                  : mutedColor
            }
          />
        )}
      </Pressable>
      {busy ? (
        <Button
          label="Cancel"
          variant="ghost"
          onPress={onCancel}
          testID={`board-cancel-${board.id}`}
        />
      ) : (
        <Button
          icon={IconPencil}
          variant="ghost"
          accessibilityLabel={`Edit ${board.name}`}
          onPress={() => router.push({ pathname: routes.editBoard, params: { boardId: board.id } })}
          testID={`board-edit-${board.id}`}
        />
      )}
    </View>
  )
}

/**
 * The Board tab while no board is connected: every saved board, where a tap connects it. The last
 * one connected leads and is the one the tab bar's connect button reaches.
 */
export function BoardsList({
  boards,
  activeBoardId,
  bleStatus,
  onConnectBoard,
  onDisconnect,
  onAddBoard,
}: BoardsListProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const connecting = isConnecting(bleStatus)
  const ordered = [...boards].sort(
    (a, b) => Number(b.id === activeBoardId) - Number(a.id === activeBoardId),
  )

  if (boards.length === 0) {
    return (
      <View style={styles.empty}>
        <OnewheelIcon size={64} color={mutedColor} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No board yet</Text>
        <CardDescription>Add your board to connect over Bluetooth.</CardDescription>
        <Button
          label="Add board"
          icon={IconPlus}
          variant="primary"
          onPress={onAddBoard}
          testID="board-add-button"
        />
      </View>
    )
  }

  return (
    <View style={styles.list}>
      {ordered.map((board) => (
        <Card key={board.id}>
          <BoardRow
            board={board}
            lastUsed={board.id === activeBoardId}
            bleStatus={board.id === activeBoardId ? bleStatus : null}
            locked={connecting && board.id !== activeBoardId}
            onConnect={() => onConnectBoard(board.id)}
            onCancel={onDisconnect}
          />
        </Card>
      ))}
      <Button
        label="Add board"
        icon={IconPlus}
        variant="outline"
        size="xl"
        onPress={onAddBoard}
        testID="board-add-button"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  // Tighter than the screen's section gap: these are one list of entries, not separate sections.
  list: {
    gap: 8,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  boardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 14,
    minHeight: 72,
  },
  pressed: {
    backgroundColor: theme.ui.muted,
  },
  locked: {
    opacity: 0.45,
  },
  boardText: {
    flex: 1,
    gap: 3,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boardName: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  lastSeen: {
    alignItems: 'flex-end',
  },
  percent: {
    color: theme.ui.foreground,
    fontFamily: theme.mono('600'),
    fontSize: 17,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 48,
  },
  emptyTitle: {
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
})
