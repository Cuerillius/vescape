import { Pressable, StyleSheet, View } from 'react-native'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { Drawer } from '@/components/ui/Drawer'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

export interface DrawerAction {
  id: string
  label: string
  icon: TablerIcon
  onPress: () => void
  disabled?: boolean
  /** Destructive: drawn in the error color and set apart from the rest. */
  danger?: boolean
  /** Makes the row an on/off option: a switch shows its state, and `onPress` flips it. */
  checked?: boolean
}

/**
 * A subject's actions in a bottom drawer: one tappable row each. Rows are identified as
 * `${testIDPrefix}-${action.id}`.
 */
export function ActionsDrawer({
  visible,
  title,
  actions,
  testIDPrefix,
  onClose,
  onDismissed,
}: {
  visible: boolean
  title: string
  actions: DrawerAction[]
  testIDPrefix: string
  onClose: () => void
  /** Called once the close animation has finished, e.g. to open the next modal. */
  onDismissed?: () => void
}) {
  return (
    <Drawer visible={visible} title={title} onClose={onClose} onDismissed={onDismissed}>
      {actions.map((action) => (
        <View key={action.id}>
          {action.danger ? <Separator /> : null}
          <ActionRow action={action} testID={`${testIDPrefix}-${action.id}`} />
        </View>
      ))}
    </Drawer>
  )
}

function ActionRow({ action, testID }: { action: DrawerAction; testID: string }) {
  const color = action.danger ? theme.status.error.color : theme.ui.foreground
  const iconColor = useResolvedColor(color)
  const Icon = action.icon
  return (
    <Pressable
      accessibilityRole={action.checked === undefined ? 'button' : 'switch'}
      accessibilityLabel={action.label}
      accessibilityState={{ disabled: action.disabled, checked: action.checked }}
      disabled={action.disabled}
      onPress={action.onPress}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [
        styles.row,
        pressed ? styles.pressed : null,
        action.disabled ? styles.disabled : null,
      ]}
      testID={testID}
    >
      <Icon size={20} color={iconColor} />
      <Text style={[styles.label, { color }]}>{action.label}</Text>
      {action.checked === undefined ? null : (
        <View pointerEvents="none">
          <Switch value={action.checked} onValueChange={action.onPress} />
        </View>
      )}
    </Pressable>
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
  disabled: {
    opacity: 0.5,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
})
