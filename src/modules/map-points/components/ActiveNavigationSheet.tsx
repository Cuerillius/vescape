import IconClock from '@tabler/icons-react-native/IconClock'
import IconRoute from '@tabler/icons-react-native/IconRoute'
import IconX from '@tabler/icons-react-native/IconX'
import { useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { useFormat } from '@/hooks/useFormat'
import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { CardTitle } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { DASH, fmtRideDuration } from '@/helpers/format'
import { useResolvedColor } from '@/hooks/useTheme'
import {
  getMapTargetDisplayTitle,
  MapTargetIdentityIcon,
} from '@/modules/map-points/components/mapTargetSheetChrome'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

const EXPAND_DISTANCE = 92
const MAX_DRAG_EXPANSION = 56
const DRAG_RESISTANCE_DISTANCE = 84
const OPEN_THRESHOLD = 30

const COMPACT_EXITING = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }] },
  100: { opacity: 0, transform: [{ translateY: -14 }] },
}).duration(120)

/** Compact proof that the accepted Navigation is still active after returning to the map. */
export function ActiveNavigationSheet({
  target,
  bottom,
  remainingDistanceMeters,
  durationSeconds,
  onOpen,
  onCancel,
}: {
  target: MapSelection
  bottom: number
  remainingDistanceMeters: number | null
  durationSeconds: number
  onOpen: () => void
  onCancel: () => void
}) {
  const { formatDistance } = useFormat()
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const grabberColor = useResolvedColor(theme.ui.border)
  const expansion = useSharedValue(0)
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: 82 + expansion.value,
    opacity: interpolate(expansion.value, [0, EXPAND_DISTANCE], [0.9, 1], 'clamp'),
  }))
  const expandGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY(-8)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
          const pull = Math.max(0, -event.translationY)
          // Resistance starts immediately and strengthens continuously: the sheet always trails the
          // finger, then approaches its drag limit instead of hitting a sudden rubber-band point.
          expansion.value = MAX_DRAG_EXPANSION * (1 - Math.exp(-pull / DRAG_RESISTANCE_DISTANCE))
        })
        .onEnd((event) => {
          const shouldOpen = expansion.value >= OPEN_THRESHOLD || event.velocityY < -500
          if (shouldOpen) {
            expansion.value = withTiming(EXPAND_DISTANCE, { duration: 100 })
            scheduleOnRN(onOpen)
            return
          }
          expansion.value = withSpring(0, { damping: 16, stiffness: 190, mass: 0.72 })
        }),
    [expansion, onOpen],
  )

  const distanceLabel =
    remainingDistanceMeters != null ? formatDistance(remainingDistanceMeters) : DASH

  return (
    <GestureDetector gesture={expandGesture}>
      <Animated.View exiting={COMPACT_EXITING} style={[styles.wrap, { bottom }]}>
        <View style={[styles.grabber, { backgroundColor: grabberColor }]} />
        <Animated.View style={[styles.sheet, animatedContainerStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open active navigation"
            onPress={onOpen}
            style={styles.content}
          >
            <MapTargetIdentityIcon target={target} />
            <View style={styles.titleBlock}>
              <CardTitle>{getMapTargetDisplayTitle(target)}</CardTitle>
              <View style={styles.primaryFacts}>
                <IconRoute size={16} color={mutedColor} />
                <Text style={styles.fact}>{distanceLabel}</Text>
                {durationSeconds > 0 ? (
                  <>
                    <IconClock size={16} color={mutedColor} />
                    <Text style={styles.fact}>{fmtRideDuration(durationSeconds)}</Text>
                  </>
                ) : null}
              </View>
            </View>
          </Pressable>
          <Button
            icon={IconX}
            variant="outline"
            size="lg"
            color={theme.status.error.text}
            accessibilityLabel="Cancel navigation"
            style={styles.cancel}
            onPress={onCancel}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 45,
    gap: 7,
    alignItems: 'center',
  },
  grabber: {
    width: 42,
    height: 4,
    borderRadius: 2,
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.background,
  },
  content: {
    height: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 70,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  primaryFacts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fact: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  cancel: {
    position: 'absolute',
    top: 19,
    right: 14,
  },
})
