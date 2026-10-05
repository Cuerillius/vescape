import IconTrash from '@tabler/icons-react-native/IconTrash'
import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import type { MapPoint, MapPointPatch } from 'vescape-core'

import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { useKeyboardLift } from '@/hooks/useKeyboardLift'
import { MapPointMediaActions } from '@/modules/map-points/components/MapPointMediaAddButton'
import { MapPointMediaPreview } from '@/modules/map-points/components/MapPointMediaPreview'
import {
  MapTargetActionRow,
  MapTargetEditHeader,
  MapTargetSheetFrame,
  MapTargetTextField,
  mapTargetSheetChromeStyles,
} from '@/modules/map-points/components/mapTargetSheetChrome'
import { MAP_POINT_MEDIA_ENABLED } from '@/modules/map-points/constants/mapPoints'
import type { MapPointMediaController } from '@/modules/map-points/hooks/useMapPointMedia'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

export function MapTargetEditBody({
  target,
  bottom,
  media,
  onSave,
  onSaveMapPoint,
  onDelete,
  onDismiss,
  onFocusTarget,
}: {
  target: Extract<MapSelection, { type: 'mapPoint' }>
  bottom: number
  media: MapPointMediaController
  onSave?: () => void
  onSaveMapPoint?: (id: string, patch: MapPointPatch) => Promise<MapPoint | null>
  onDelete?: () => void
  onDismiss?: () => void
  onFocusTarget?: () => void
}) {
  const point = target.point
  const [name, setName] = useState(point.name ?? '')
  const [description, setDescription] = useState(point.description ?? '')
  const keyboardLift = useKeyboardLift(true)
  const sheetBottom = Math.max(bottom, keyboardLift + 12)
  const handleSave = useCallback(async () => {
    if (onSaveMapPoint) await onSaveMapPoint(point.id, { name, description })
    onSave?.()
  }, [description, name, onSave, onSaveMapPoint, point.id])

  return (
    <MapTargetSheetFrame
      target={target}
      bottom={sheetBottom}
      header={<MapTargetEditHeader point={point} name={name} onChangeName={setName} />}
      onDismiss={onDismiss}
      onFocusTarget={onFocusTarget}
    >
      <View style={styles.draftFields}>
        <MapTargetTextField
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          accessibilityLabel="Map feature description"
          multiline
        />
        {MAP_POINT_MEDIA_ENABLED ? (
          <View style={mapTargetSheetChromeStyles.mediaBox}>
            <MapPointMediaPreview assets={media.assets} onRemove={media.remove} />
            <MapPointMediaActions
              loading={media.saving}
              onAdd={() => void media.pick()}
              onCapturePhoto={() => void media.capture(['images'])}
              onCaptureVideo={() => void media.capture(['videos'])}
            />
          </View>
        ) : null}
      </View>
      <MapTargetActionRow>
        {onDelete ? (
          <Button
            icon={IconTrash}
            variant="outline"
            size="lg"
            color={theme.status.error.text}
            accessibilityLabel="Delete map feature"
            onPress={onDelete}
          />
        ) : null}
        <Button
          label="Save"
          variant="primary"
          size="lg"
          accessibilityLabel="Save map feature"
          style={mapTargetSheetChromeStyles.leadAction}
          onPress={() => void handleSave()}
        />
      </MapTargetActionRow>
    </MapTargetSheetFrame>
  )
}

const styles = StyleSheet.create({
  draftFields: {
    gap: 8,
  },
})
