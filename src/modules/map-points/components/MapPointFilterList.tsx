import { StyleSheet, View } from 'react-native'
import type { MapPointCategory } from 'vescape-core'

import { LayerTile } from '@/components/ui/LayerTile'
import { MapMarkFace } from '@/modules/map/components/MapMark'
import { MAP_POINT_CATEGORY_OPTIONS } from '@/modules/map-points/constants/mapPoints'

/**
 * Per-category visibility for the Map Points on the map, one toggle tile per category. The
 * direction target is never filtered.
 */
export function MapPointFilterList({
  hiddenCategories,
  onToggleCategory,
}: {
  hiddenCategories: MapPointCategory[]
  onToggleCategory: (category: MapPointCategory) => void
}) {
  return (
    <View style={styles.grid}>
      {MAP_POINT_CATEGORY_OPTIONS.map((option) => {
        const visible = !hiddenCategories.includes(option.kind)
        return (
          <View key={option.kind} style={styles.cell}>
            <LayerTile
              label={option.label}
              accessibilityLabel={`${option.label} visibility`}
              selected={visible}
              onPress={() => onToggleCategory(option.kind)}
            >
              <View style={!visible && styles.markHidden}>
                <MapMarkFace kind={option.kind} />
              </View>
            </LayerTile>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    paddingHorizontal: 8,
  },
  cell: { width: '25%', flexDirection: 'row' },
  markHidden: { opacity: 0.4 },
})
