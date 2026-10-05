import { Drawer } from '@/components/ui/Drawer'
import { MediaHistoryGallery } from '@/modules/history/components/MediaHistoryGallery'
import type { MediaAssetInput, MediaHistoryAsset } from '@/modules/history/lib/mediaHistory'

interface HistoryRideMediaDrawerProps {
  visible: boolean
  assets: MediaHistoryAsset[]
  unmatched: MediaAssetInput[]
  loading: boolean
  error: string | null
  onClose: () => void
  onAdd: () => void
  onOpenMedia: (asset: MediaAssetInput) => void
}

export function HistoryRideMediaDrawer({
  visible,
  assets,
  unmatched,
  loading,
  error,
  onClose,
  onAdd,
  onOpenMedia,
}: HistoryRideMediaDrawerProps) {
  return (
    <Drawer visible={visible} title="Favorite Media" onClose={onClose}>
      <MediaHistoryGallery
        assets={assets}
        unmatched={unmatched}
        loading={loading}
        error={error}
        onAdd={onAdd}
        onOpenAsset={(asset) => {
          onClose()
          onOpenMedia(asset)
        }}
      />
    </Drawer>
  )
}
