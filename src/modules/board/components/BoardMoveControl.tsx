import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconChevronUp from '@tabler/icons-react-native/IconChevronUp'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Drawer } from '@/components/ui/Drawer'
import { Stepper } from '@/components/ui/Stepper'
import type { WidgetHeaderProps } from '@/components/widgets/widgetHeader'
import { theme } from '@/constants/theme'
import {
  BOARD_MOVE_STRENGTH_MAX_PERCENT,
  BOARD_MOVE_STRENGTH_MIN_PERCENT,
  BOARD_MOVE_STRENGTH_STEP_PERCENT,
  useBoardMoveControl,
} from '@/modules/board/hooks/useBoardMoveControl'
import IconArrowsUpDown from '@tabler/icons-react-native/IconArrowsUpDown'

/** Header of the Board Move panel, shared by every entry point that opens it. */
export const BOARD_MOVE_WIDGET: WidgetHeaderProps = {
  icon: IconArrowsUpDown,
  title: 'Move',
  description: 'Hold to roll the board while you are off it.',
  accent: theme.palette.cyan.color,
}

/**
 * Board Move: hold a direction to roll the board while it is disengaged. The panel also exposes the
 * move strength, because how much push is enough depends on the board's own remote limits.
 */
export function BoardMoveBody() {
  const {
    canCommand,
    blockedMessage,
    strengthPercent,
    setStrengthPercent,
    moveForward,
    moveBackward,
    stopMove,
  } = useBoardMoveControl()

  return (
    <>
      <View style={styles.buttons}>
        <MoveButton
          icon={IconChevronDown}
          label="Move board backward"
          disabled={!canCommand}
          onPressIn={moveBackward}
          onPressOut={stopMove}
        />
        <MoveButton
          icon={IconChevronUp}
          label="Move board forward"
          disabled={!canCommand}
          onPressIn={moveForward}
          onPressOut={stopMove}
        />
      </View>

      <View style={styles.strengthRow}>
        <View style={styles.strengthText}>
          <Text style={styles.strengthLabel}>Strength</Text>
          <Text style={styles.strengthHint}>Board still caps this with its own remote limits.</Text>
        </View>
        <Stepper
          label="move strength"
          value={strengthPercent}
          unit="%"
          min={BOARD_MOVE_STRENGTH_MIN_PERCENT}
          max={BOARD_MOVE_STRENGTH_MAX_PERCENT}
          step={BOARD_MOVE_STRENGTH_STEP_PERCENT}
          onChange={setStrengthPercent}
        />
      </View>

      {blockedMessage ? <Text style={styles.disabledNote}>{blockedMessage}</Text> : null}
    </>
  )
}

/** The Board Move controls in the shared bottom drawer; entry points only decide when it is open. */
export function BoardMoveDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Drawer
      visible={visible}
      title={BOARD_MOVE_WIDGET.title}
      description={BOARD_MOVE_WIDGET.description}
      onClose={onClose}
    >
      <View style={styles.drawerBody}>
        <BoardMoveBody />
      </View>
    </Drawer>
  )
}

function MoveButton({
  icon: Icon,
  label,
  disabled,
  onPressIn,
  onPressOut,
}: {
  icon: TablerIcon
  label: string
  disabled: boolean
  onPressIn: () => void
  onPressOut: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Icon size={26} color={theme.ui.foreground} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  drawerBody: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  buttonPressed: {
    backgroundColor: theme.ui.muted,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  strengthText: {
    flex: 1,
    minWidth: 0,
  },
  strengthLabel: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
  strengthHint: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
  },
  disabledNote: {
    marginTop: 10,
    color: theme.ui.mutedForeground,
    fontSize: 12,
  },
})
