import IconMapPinPlus from '@tabler/icons-react-native/IconMapPinPlus'
import IconX from '@tabler/icons-react-native/IconX'
import { Pressable, StyleSheet, View } from 'react-native'
import type { MapPointCategory } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { CardDescription, CardTitle } from '@/components/ui/Card'
import { interaction, theme } from '@/constants/theme'
import { MapMarkFace } from '@/modules/map/components/MapMark'
import { MAP_POINT_CATEGORY_OPTIONS } from '@/modules/map-points/constants/mapPoints'

/**
 * Places a new Map Point (or a direction target) at the map centre. Collapsed it is one button;
 * open it is a flat zinc sheet over the map, not a modal drawer, so the centre stays in view.
 */
export function MapPointAddMenu({
  bottom,
  sheetBottom,
  open,
  onToggle,
  onSelectCategory,
}: {
  bottom: number
  sheetBottom: number
  open: boolean
  onToggle: () => void
  onSelectCategory: (category: MapPointCategory) => void
}) {
  if (!open) {
    return (
      <View style={[styles.mapAddAction, { bottom }]}>
        <Button
          icon={IconMapPinPlus}
          variant="floating"
          size="xl"
          accessibilityLabel="Add map feature"
          testID="map-add-feature"
          onPress={onToggle}
        />
      </View>
    )
  }

  return (
    <View style={[styles.sheet, { bottom: sheetBottom }]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <CardTitle>Add map feature</CardTitle>
          <CardDescription>Places at the map center</CardDescription>
        </View>
        <Button
          icon={IconX}
          variant="ghost"
          accessibilityLabel="Close add map feature"
          onPress={onToggle}
        />
      </View>
      <View style={styles.grid}>
        {MAP_POINT_CATEGORY_OPTIONS.map((option) => (
          <Pressable
            key={option.kind}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            onPress={() => onSelectCategory(option.kind)}
          >
            <MapMarkFace kind={option.kind} />
            <Text style={styles.tileLabel} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mapAddAction: {
    position: 'absolute',
    right: 12,
    zIndex: 31,
    alignItems: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 45,
    gap: 12,
    padding: 12,
    borderRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    flexBasis: '30%',
    flexGrow: 1,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 6,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  pressed: { opacity: interaction.pressedOpacity },
  tileLabel: {
    maxWidth: '100%',
    color: theme.ui.foreground,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
})
