import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import { Pressable, StyleSheet } from 'react-native'

import { Text } from '@/components/base/Text'
import { OnewheelIcon } from '@/components/icons/OnewheelIcon'
import { Drawer } from '@/components/ui/Drawer'
import { interaction, theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import type { Board } from '@/modules/board/store/boardStore'

interface BoardPickerModalProps {
  visible: boolean
  boards: Board[]
  onSelect: (board: Board) => void
  onDismiss: () => void
}

/** Picks the board a tune is copied to, as a bottom drawer with one row per other board. */
export function BoardPickerModal({ visible, boards, onSelect, onDismiss }: BoardPickerModalProps) {
  const ui = useResolvedUiColors()
  return (
    <Drawer
      visible={visible}
      title="Copy to different board"
      description="Choose the board that should get a copy of this tune."
      onClose={onDismiss}
      testID="tune-board-picker"
    >
      {boards.length === 0 ? (
        <Text style={styles.emptyText}>No other boards available.</Text>
      ) : (
        boards.map((board) => (
          <Pressable
            key={board.id}
            accessibilityRole="button"
            accessibilityLabel={board.name}
            android_ripple={interaction.ripple}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => onSelect(board)}
            testID={`tune-board-picker-${board.id}`}
          >
            <OnewheelIcon size={20} color={ui.mutedForeground} />
            <Text style={styles.name} numberOfLines={1}>
              {board.name}
            </Text>
            <IconChevronRight size={18} color={ui.faintForeground} />
          </Pressable>
        ))
      )}
    </Drawer>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 20,
  },
  pressed: {
    backgroundColor: theme.ui.muted,
  },
  name: {
    flex: 1,
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
})
