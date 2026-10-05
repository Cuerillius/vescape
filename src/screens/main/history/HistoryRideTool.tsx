import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'
import IconPhoto from '@tabler/icons-react-native/IconPhoto'
import { useRouter } from 'expo-router'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HistoryRideMediaDrawer } from '@/modules/history/components/HistoryRideMediaDrawer'
import type { MediaAssetInput, MediaHistoryAsset } from '@/modules/history/lib/mediaHistory'
import { routes } from '@/navigation/routes'

interface HistoryRideToolProps {
  favoriteMode: boolean
  mediaAssets: MediaHistoryAsset[]
  mediaUnmatched: MediaAssetInput[]
  mediaLoading: boolean
  mediaError: string | null
  onAddMedia: () => void
  onOpenMedia: (asset: MediaAssetInput) => void
}

/**
 * The button after the chart toggles: the full-screen charts page for a ride, the media drawer
 * for a Favorite (which is about its route and media rather than its charts).
 */
export function HistoryRideTool({
  favoriteMode,
  mediaAssets,
  mediaUnmatched,
  mediaLoading,
  mediaError,
  onAddMedia,
  onOpenMedia,
}: HistoryRideToolProps) {
  const router = useRouter()
  const [mediaDrawerVisible, setMediaDrawerVisible] = useState(false)
  const mediaCount = mediaAssets.length + mediaUnmatched.length

  if (!favoriteMode) {
    return (
      <Button
        icon={IconChartLine}
        variant="floating"
        size="lg"
        onPress={() => router.push(routes.historyCharts)}
        testID="history-open-charts"
        accessibilityLabel="Full screen charts"
      />
    )
  }

  return (
    <>
      <View collapsable={false}>
        <Button
          icon={IconPhoto}
          variant="floating"
          size="lg"
          onPress={() => setMediaDrawerVisible(true)}
          loading={mediaLoading}
          accessibilityLabel="Favorite media"
        />
        {mediaCount > 0 ? (
          // Badges pin themselves to the top of their parent; this one sits on the button's corner.
          <View style={styles.mediaCountBadge} pointerEvents="none">
            <Badge label={mediaCount > 99 ? '99+' : String(mediaCount)} />
          </View>
        ) : null}
      </View>
      <HistoryRideMediaDrawer
        visible={mediaDrawerVisible}
        assets={mediaAssets}
        unmatched={mediaUnmatched}
        loading={mediaLoading}
        error={mediaError}
        onClose={() => setMediaDrawerVisible(false)}
        onAdd={onAddMedia}
        onOpenMedia={onOpenMedia}
      />
    </>
  )
}

const styles = StyleSheet.create({
  mediaCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
})
