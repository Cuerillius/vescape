import IconThumbDown from '@tabler/icons-react-native/IconThumbDown'
import IconThumbUp from '@tabler/icons-react-native/IconThumbUp'
import IconX from '@tabler/icons-react-native/IconX'
import type { ComponentType, ReactNode } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import Animated, { Keyframe } from 'react-native-reanimated'
import type { MapPoint } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { CardDescription, CardTitle } from '@/components/ui/Card'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { MapMarkFace } from '@/modules/map/components/MapMark'
import { MapPointMediaPreview } from '@/modules/map-points/components/MapPointMediaPreview'
import {
  getMapPointKindLabel,
  MAP_POINT_MEDIA_ENABLED,
} from '@/modules/map-points/constants/mapPoints'
import type { MapPointMediaAsset } from '@/modules/map-points/store/mapPointPhotoFiles'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

export interface MapTargetSheetAction {
  label: string
  accessibilityLabel: string
  Icon: ComponentType<{ size: number; color: string }>
  onPress: () => void
}

const MAP_TARGET_ENTERING = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 16 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }] },
}).duration(140)

/** A flat zinc sheet over the map: the Drawer's surface, without its scrim. */
export function MapTargetSheetFrame({
  target,
  bottom,
  header,
  onDismiss,
  onFocusTarget,
  animateEntrance = false,
  children,
}: {
  target: MapSelection
  bottom: number
  header: ReactNode
  onDismiss?: () => void
  onFocusTarget?: () => void
  animateEntrance?: boolean
  children: ReactNode
}) {
  const headerContent = (
    <>
      <MapTargetIdentityIcon target={target} />
      <View style={styles.titleBlock}>{header}</View>
    </>
  )

  return (
    <Animated.View
      entering={animateEntrance ? MAP_TARGET_ENTERING : undefined}
      style={[styles.sheet, { bottom }]}
    >
      <View style={styles.header}>
        {onFocusTarget ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Center map on target"
            onPress={onFocusTarget}
            style={({ pressed }) => [styles.focusArea, pressed && styles.pressed]}
          >
            {headerContent}
          </Pressable>
        ) : (
          <View style={styles.focusArea}>{headerContent}</View>
        )}
        {onDismiss ? (
          <Button
            icon={IconX}
            variant="ghost"
            accessibilityLabel="Close target"
            onPress={onDismiss}
          />
        ) : null}
      </View>
      {children}
    </Animated.View>
  )
}

/** The target's map mark: its category for a Map Point, the direction pin for anything else. */
export function MapTargetIdentityIcon({ target }: { target: MapSelection }) {
  return <MapMarkFace kind={target.type === 'mapPoint' ? target.point.category : 'direction'} />
}

export function getMapTargetDisplayTitle(target: MapSelection) {
  return target.type === 'mapPoint'
    ? target.point.name?.trim() || getMapPointKindLabel(target.point.category)
    : target.title
}

export function MapTargetReadHeader({ target }: { target: MapSelection }) {
  if (target.type === 'mapPoint') {
    const created = new Date(target.point.createdAt).toLocaleDateString()
    return (
      <>
        <CardTitle>{getMapTargetDisplayTitle(target)}</CardTitle>
        <CardDescription>Vescape rider · {created}</CardDescription>
      </>
    )
  }

  const detail = target.loadingDetails
    ? 'Loading details'
    : target.subtitle || `${target.latitude.toFixed(5)}, ${target.longitude.toFixed(5)}`

  return (
    <>
      <CardTitle>{target.title}</CardTitle>
      <CardDescription numberOfLines={2}>{detail}</CardDescription>
    </>
  )
}

/** Text field on the zinc card step, shared by the name and description of a Map Point draft. */
export function MapTargetTextField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  multiline = false,
}: {
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  accessibilityLabel: string
  multiline?: boolean
}) {
  const placeholderColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      multiline={multiline}
      style={[styles.input, multiline && styles.inputMultiline]}
      accessibilityLabel={accessibilityLabel}
    />
  )
}

export function MapTargetEditHeader({
  point,
  name,
  onChangeName,
}: {
  point: MapPoint
  name: string
  onChangeName: (name: string) => void
}) {
  return (
    <MapTargetTextField
      value={name}
      onChangeText={onChangeName}
      placeholder={getMapPointKindLabel(point.category)}
      accessibilityLabel="Map feature name"
    />
  )
}

export function MapPointDetails({
  point,
  media,
}: {
  point: MapPoint
  media: readonly MapPointMediaAsset[]
}) {
  const description = point.description?.trim()
  const ScoreIcon = point.score < 0 ? IconThumbDown : IconThumbUp
  const scoreColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {MAP_POINT_MEDIA_ENABLED && media.length > 0 ? (
        <View style={styles.mediaBox}>
          <MapPointMediaPreview assets={media} />
        </View>
      ) : null}
      <View style={styles.voteCount}>
        <ScoreIcon size={14} color={scoreColor} />
        <CardDescription>{point.score}</CardDescription>
      </View>
    </>
  )
}

export function MapTargetActionRow({ children }: { children: ReactNode }) {
  return <View style={styles.actionRow}>{children}</View>
}

/**
 * A sheet action. The lead action is the one filled button and takes the row width; `iconOnly`
 * drops a side action to the icon alone, for actions whose icon is unambiguous. The label still
 * exists as the accessibility name.
 */
export function MapTargetPrimaryAction({
  action,
  iconOnly = false,
}: {
  action: MapTargetSheetAction
  iconOnly?: boolean
}) {
  return (
    <Button
      icon={action.Icon}
      label={iconOnly ? undefined : action.label}
      variant={iconOnly ? 'outline' : 'primary'}
      size="lg"
      accessibilityLabel={action.accessibilityLabel}
      style={iconOnly ? undefined : styles.leadAction}
      onPress={action.onPress}
    />
  )
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  description: {
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '500',
  },
  focusArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    paddingHorizontal: 12,
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '500',
  },
  inputMultiline: {
    minHeight: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  leadAction: {
    flex: 1,
  },
  mediaBox: {
    gap: 12,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
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
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
})

export const mapTargetSheetChromeStyles = styles
