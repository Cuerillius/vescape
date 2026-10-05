import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'

/** Square size of a tile's preview. */
const PREVIEW_SIZE = 64

interface LayerTileProps {
  label: string
  /** The preview drawn inside the tile: an icon or a map mark. */
  children: ReactNode
  /** Selected tiles get a primary outline and label. */
  selected: boolean
  onPress: () => void
  accessibilityLabel?: string
}

/** A map-layer choice in the style of Google Maps' layer sheet: a preview with its label below. */
export function LayerTile({
  label,
  children,
  selected,
  onPress,
  accessibilityLabel,
}: LayerTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.preview, selected && styles.previewSelected]}>{children}</View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pressed: { opacity: interaction.pressedOpacity },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  previewSelected: { borderColor: theme.ui.primary },
  label: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSelected: { color: theme.ui.foreground, fontWeight: '600' },
})
