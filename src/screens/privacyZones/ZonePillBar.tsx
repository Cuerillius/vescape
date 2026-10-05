import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import IconTrash from '@tabler/icons-react-native/IconTrash'
import { useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Dropdown } from '@/components/forms/Dropdown'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { ZonePill } from '@/screens/privacyZones/zonePills'

interface ZonePillBarProps {
  pills: readonly ZonePill[]
  selectedId: string
  onSelect: (id: string) => void
  onAdd: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

/** Enabled is a filled dot, disabled a ring, and an unsaved draft a faint dot. */
function StatusDot({ pill, color }: { pill: ZonePill; color: string }) {
  if (!pill.isSaved) return <View style={[styles.dot, { backgroundColor: color, opacity: 0.35 }]} />
  if (pill.enabled) return <View style={[styles.dot, { backgroundColor: color }]} />
  return <View style={[styles.dot, styles.dotRing, { borderColor: color }]} />
}

function ZonePillItem({
  pill,
  active,
  onPress,
  onLongPress,
  triggerRef,
}: {
  pill: ZonePill
  active: boolean
  onPress: () => void
  onLongPress?: () => void
  triggerRef: React.RefObject<View | null>
}) {
  const IconComponent = pill.icon
  const color = useResolvedColor(active ? theme.ui.primaryForeground : theme.ui.mutedForeground)
  const testIdSuffix = !pill.isSaved && !pill.isBuiltIn ? 'pending-custom' : pill.id
  return (
    <View ref={triggerRef} collapsable={false}>
      <Pressable
        testID={`privacy-zone-pill-${testIdSuffix}`}
        accessibilityRole="button"
        accessibilityLabel={pill.name}
        accessibilityState={{ selected: active }}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}
        style={({ pressed }) => [
          styles.option,
          active && styles.optionActive,
          pressed && styles.pressed,
        ]}
      >
        {IconComponent ? <IconComponent size={14} color={color} /> : null}
        <Text style={[styles.label, { color }]} numberOfLines={1}>
          {pill.name}
        </Text>
        <StatusDot pill={pill} color={color} />
      </Pressable>
    </View>
  )
}

/** Zone selector: a bordered segmented bar like the ToggleGroup. Long-press a zone to rename or delete it. */
export function ZonePillBar({
  pills,
  selectedId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: ZonePillBarProps) {
  const [menuId, setMenuId] = useState<string | null>(null)
  const triggerRefs = useRef(new Map<string, React.RefObject<View | null>>())
  const fallbackRef = useRef<View>(null)

  const refFor = (id: string) => {
    let ref = triggerRefs.current.get(id)
    if (!ref) {
      ref = { current: null }
      triggerRefs.current.set(id, ref)
    }
    return ref
  }

  const menuPill = pills.find((pill) => pill.id === menuId)
  const canRename = menuPill != null && !menuPill.isBuiltIn
  const canDelete = menuPill != null && (menuPill.isSaved || !menuPill.isBuiltIn)

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {pills.map((pill) => (
          <ZonePillItem
            key={pill.id}
            pill={pill}
            active={pill.id === selectedId}
            triggerRef={refFor(pill.id)}
            onPress={() => onSelect(pill.id)}
            onLongPress={pill.isBuiltIn && !pill.isSaved ? undefined : () => setMenuId(pill.id)}
          />
        ))}
        <Pressable
          testID="privacy-zone-add-button"
          accessibilityRole="button"
          accessibilityLabel="Add zone"
          onPress={onAdd}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        >
          <IconPlus size={16} color={theme.ui.mutedForeground} />
        </Pressable>
      </ScrollView>

      <Dropdown
        visible={menuPill != null && (canRename || canDelete)}
        triggerRef={menuId ? refFor(menuId) : fallbackRef}
        onClose={() => setMenuId(null)}
        matchTriggerWidth={false}
        minWidth={160}
        panelStyle={styles.panel}
      >
        {menuPill && canRename ? (
          <Pressable
            testID={`privacy-zone-menu-rename-${menuPill.isSaved ? menuPill.id : 'pending-custom'}`}
            accessibilityRole="menuitem"
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => {
              setMenuId(null)
              onRename(menuPill.id, menuPill.name)
            }}
          >
            <IconPencil size={15} color={theme.ui.mutedForeground} />
            <Text style={styles.menuText}>Rename</Text>
          </Pressable>
        ) : null}
        {menuPill && canDelete ? (
          <Pressable
            testID={`privacy-zone-menu-delete-${menuPill.isSaved || menuPill.isBuiltIn ? menuPill.id : 'pending-custom'}`}
            accessibilityRole="menuitem"
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => {
              setMenuId(null)
              onDelete(menuPill.id)
            }}
          >
            <IconTrash size={15} color={theme.status.error.text} />
            <Text style={[styles.menuText, { color: theme.status.error.text }]}>Delete</Text>
          </Pressable>
        ) : null}
      </Dropdown>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    maxWidth: '100%',
    borderRadius: theme.radius.md + 3,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  content: { padding: 3, gap: 2, alignItems: 'center' },
  option: {
    height: 30,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.md,
  },
  optionActive: { backgroundColor: theme.ui.primary },
  pressed: { opacity: interaction.pressedOpacity },
  label: { fontSize: 13, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotRing: { backgroundColor: 'transparent', borderWidth: 1.5 },
  add: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  panel: {
    padding: 4,
    borderRadius: theme.radius.lg,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  menuItemPressed: { backgroundColor: theme.ui.muted },
  menuText: { color: theme.ui.foreground, fontSize: 14 },
})
