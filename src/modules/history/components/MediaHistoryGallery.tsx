import { Image } from 'expo-image'
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import type { MediaAssetInput, MediaHistoryAsset } from '@/modules/history/lib/mediaHistory'
import IconPhoto from '@tabler/icons-react-native/IconPhoto'
import IconPlayerPlayFilled from '@tabler/icons-react-native/IconPlayerPlayFilled'
import IconPlus from '@tabler/icons-react-native/IconPlus'

const GRID_COLUMNS = 4
const GRID_GAP = 6
// Drawer body horizontal padding — tiles fill the remaining drawer width.
const DRAWER_HORIZONTAL_PADDING = 16

function MediaGrid({
  assets,
  tileSize,
  onOpenAsset,
}: {
  assets: readonly MediaAssetInput[]
  tileSize: number
  onOpenAsset: (asset: MediaAssetInput) => void
}) {
  return (
    <View style={styles.grid}>
      {assets.map((asset) => (
        <Pressable
          key={asset.id}
          accessibilityRole="button"
          accessibilityLabel={`Open ${asset.mediaType}`}
          onPress={() => onOpenAsset(asset)}
          style={({ pressed }) => [
            styles.tile,
            { width: tileSize, height: tileSize },
            pressed && styles.tilePressed,
          ]}
        >
          <Image source={asset.uri} contentFit="cover" style={styles.thumbnail} />
          {asset.mediaType === 'video' ? (
            <View style={styles.videoBadge}>
              <IconPlayerPlayFilled size={10} color={theme.palette.purple.text} />
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  )
}

/**
 * Favorite Media gallery shown inside the detail drawer: matched assets as a
 * thumbnail grid, assets outside the ride in their own section, and the picker
 * entry point.
 */
export function MediaHistoryGallery({
  assets,
  unmatched,
  loading,
  error,
  onAdd,
  onOpenAsset,
}: {
  assets: MediaHistoryAsset[]
  unmatched: MediaAssetInput[]
  loading: boolean
  error: string | null
  onAdd: () => void
  onOpenAsset: (asset: MediaAssetInput) => void
}) {
  const { width } = useWindowDimensions()

  const tileSize =
    (width - DRAWER_HORIZONTAL_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
  return (
    <View style={styles.container}>
      {assets.length === 0 && unmatched.length === 0 ? (
        <View style={styles.empty}>
          <IconPhoto size={28} color={theme.ui.mutedForeground} />
          <Text style={styles.emptyText}>
            Add photos and videos captured during this Favorite to see them on the map.
          </Text>
        </View>
      ) : (
        <MediaGrid assets={assets} tileSize={tileSize} onOpenAsset={onOpenAsset} />
      )}
      {unmatched.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Outside this Favorite</Text>
          <Text style={styles.note}>
            No capture time inside the Favorite. Shown here, but not on the map.
          </Text>
          <MediaGrid assets={unmatched} tileSize={tileSize} onOpenAsset={onOpenAsset} />
        </>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        label="Add Photos & Videos"
        icon={IconPlus}
        variant="secondary"
        loading={loading}
        onPress={onAdd}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: DRAWER_HORIZONTAL_PADDING,
    paddingBottom: 4,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  tile: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.ui.muted,
  },
  tilePressed: {
    opacity: 0.55,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.alpha(theme.ui.muted, 0.6),
  },
  sectionTitle: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  note: {
    color: theme.ui.mutedForeground,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: theme.status.error.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
})
