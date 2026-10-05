import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconThumbDown from '@tabler/icons-react-native/IconThumbDown'
import IconThumbDownFilled from '@tabler/icons-react-native/IconThumbDownFilled'
import IconThumbUp from '@tabler/icons-react-native/IconThumbUp'
import IconThumbUpFilled from '@tabler/icons-react-native/IconThumbUpFilled'
import { StyleSheet, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import {
  MapPointDetails,
  MapTargetActionRow,
  type MapTargetSheetAction,
  MapTargetPrimaryAction,
  MapTargetReadHeader,
  MapTargetSheetFrame,
} from '@/modules/map-points/components/mapTargetSheetChrome'
import type { MapPointMediaAsset } from '@/modules/map-points/store/mapPointPhotoFiles'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

export function MapTargetSelectBody({
  target,
  bottom,
  action,
  media,
  onEdit,
  onVoteMapPoint,
  onDismiss,
  onFocusTarget,
}: {
  target: MapSelection
  bottom: number
  action: MapTargetSheetAction
  media: readonly MapPointMediaAsset[]
  onEdit?: () => void
  onVoteMapPoint?: (id: string, reaction: 'up' | 'down' | null) => boolean
  onDismiss?: () => void
  onFocusTarget?: () => void
}) {
  const point = target.type === 'mapPoint' ? target.point : null

  return (
    <MapTargetSheetFrame
      target={target}
      bottom={bottom}
      header={<MapTargetReadHeader target={target} />}
      onDismiss={onDismiss}
      onFocusTarget={onFocusTarget}
    >
      {point ? <MapPointDetails point={point} media={media} /> : null}
      <MapTargetActionRow>
        {point && onEdit ? (
          <Button
            icon={IconPencil}
            label="Edit"
            variant="outline"
            size="lg"
            accessibilityLabel="Edit map feature"
            onPress={onEdit}
          />
        ) : null}
        {point && onVoteMapPoint ? (
          <MapPointVoteButtons point={point} onVote={onVoteMapPoint} />
        ) : null}
        <MapTargetPrimaryAction action={action} />
      </MapTargetActionRow>
    </MapTargetSheetFrame>
  )
}

function MapPointVoteButtons({
  point,
  onVote,
}: {
  point: Extract<MapSelection, { type: 'mapPoint' }>['point']
  onVote: (id: string, reaction: 'up' | 'down' | null) => boolean
}) {
  const reaction = point.myReaction
  // The rider's own vote is the only state: a filled glyph on the secondary surface.
  return (
    <View style={styles.voteGroup}>
      <Button
        icon={reaction === 'up' ? IconThumbUpFilled : IconThumbUp}
        variant={reaction === 'up' ? 'secondary' : 'outline'}
        size="lg"
        accessibilityLabel="Vote map feature up"
        onPress={() => onVote(point.id, reaction === 'up' ? null : 'up')}
      />
      <Button
        icon={reaction === 'down' ? IconThumbDownFilled : IconThumbDown}
        variant={reaction === 'down' ? 'secondary' : 'outline'}
        size="lg"
        accessibilityLabel="Vote map feature down"
        onPress={() => onVote(point.id, reaction === 'down' ? null : 'down')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  voteGroup: {
    flexDirection: 'row',
    gap: 4,
  },
})
