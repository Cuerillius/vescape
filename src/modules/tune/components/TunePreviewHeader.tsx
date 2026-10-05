import type { ReactNode } from 'react'
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconChevronUp from '@tabler/icons-react-native/IconChevronUp'
import IconHelpCircle from '@tabler/icons-react-native/IconHelpCircle'
import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'

/** Title and what the preview is for, with room beside them for an accessory (the terrain). */
export function TunePreviewHeader({
  onHelp,
  description,
  accessory,
  expanded = true,
  onToggleExpanded,
}: {
  onHelp?: () => void
  description: string
  accessory?: ReactNode
  expanded?: boolean
  onToggleExpanded?: () => void
}) {
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.titleBlock}
        disabled={!onToggleExpanded}
        accessibilityRole="button"
        accessibilityLabel="Tune preview"
        accessibilityState={{ expanded }}
        onPress={onToggleExpanded}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Tune preview</Text>
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="About Tune Preview"
            onPress={onHelp}
          >
            <IconHelpCircle size={14} color={theme.ui.mutedForeground} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>{description}</Text>
      </Pressable>
      {accessory}
      {onToggleExpanded ? (
        <Button
          variant="ghost"
          icon={expanded ? IconChevronUp : IconChevronDown}
          accessibilityLabel={expanded ? 'Collapse Tune preview' : 'Expand Tune preview'}
          onPress={onToggleExpanded}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titleBlock: { flex: 1, minWidth: 0, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: theme.ui.foreground, fontSize: 14, fontWeight: '600' },
  subtitle: { color: theme.ui.mutedForeground, fontSize: 12 },
})
