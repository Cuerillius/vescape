import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { MonoValue } from '@/components/base/MonoValue'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import {
  findClosestRainViewerFrameIndex,
  formatRainViewerFrameTime,
  useRainViewerRadarStore,
} from '@/modules/weather/store/rainViewerRadarStore'

const FRAME_INTERVAL_MS = 450
const INITIAL_FRAME_OFFSET_SECONDS = 30 * 60
const TIME_FONT_SIZE = 12

const TRACK_HEIGHT = 8
const THUMB_SIZE = 16

function pickFrameIndexByX(x: number, width: number, frameCount: number): number {
  'worklet'
  if (width <= 0 || frameCount <= 1) return -1
  const fraction = Math.max(0, Math.min(1, x / width))
  return Math.round(fraction * (frameCount - 1))
}

function createRadarScrubGesture({
  enabled,
  frameCount,
  trackWidth,
  gestureFrameIndex,
  progress,
  commitManualFrame,
  setScrubbing,
}: {
  enabled: boolean
  frameCount: SharedValue<number>
  trackWidth: SharedValue<number>
  gestureFrameIndex: SharedValue<number>
  progress: SharedValue<number>
  commitManualFrame: (index: number) => void
  setScrubbing: (scrubbing: boolean) => void
}) {
  return Gesture.Pan()
    .enabled(enabled)
    .minDistance(0)
    .onBegin((event) => {
      'worklet'
      const nextIndex = pickFrameIndexByX(event.x, trackWidth.value, frameCount.value)
      if (nextIndex < 0) return
      cancelAnimation(progress)
      gestureFrameIndex.value = nextIndex
      progress.value = frameCount.value <= 1 ? 1 : nextIndex / (frameCount.value - 1)
      scheduleOnRN(setScrubbing, true)
      scheduleOnRN(commitManualFrame, nextIndex)
    })
    .onUpdate((event) => {
      'worklet'
      const nextIndex = pickFrameIndexByX(event.x, trackWidth.value, frameCount.value)
      if (nextIndex < 0 || nextIndex === gestureFrameIndex.value) return
      cancelAnimation(progress)
      gestureFrameIndex.value = nextIndex
      progress.value = frameCount.value <= 1 ? 1 : nextIndex / (frameCount.value - 1)
      scheduleOnRN(commitManualFrame, nextIndex)
    })
    .onFinalize(() => {
      'worklet'
      gestureFrameIndex.value = -1
      // Playback picks up from wherever the finger left it: with no transport controls, a scrub
      // that stopped the animation for good would leave the rider on a frozen frame.
      scheduleOnRN(setScrubbing, false)
    })
}

export function WeatherRadarTimeline() {
  const ui = useResolvedUiColors()
  const frames = useRainViewerRadarStore((state) => state.frames)
  const fetchRadar = useRainViewerRadarStore((state) => state.fetch)
  const [scrubbing, setScrubbing] = useState(false)
  const frameCountRef = useRef(0)
  const frameIndexRef = useRef(0)
  const initialFrameSelectedRef = useRef(false)
  const labelsRef = useRef<string[]>([])
  const instantFrameIndexRef = useRef<number | null>(null)
  const frameCount = useSharedValue(0)
  const trackWidth = useSharedValue(0)
  const gestureFrameIndex = useSharedValue(-1)
  const progress = useSharedValue(1)
  const frameLabel = useSharedValue('Radar')

  useEffect(() => {
    fetchRadar()
  }, [fetchRadar])

  useEffect(() => {
    frameCountRef.current = frames.length
    frameCount.value = frames.length
    labelsRef.current = frames.map((frame) => formatRainViewerFrameTime(frame.time))

    let selectedFrameIndex = useRainViewerRadarStore.getState().selectedFrameIndex
    if (!initialFrameSelectedRef.current && frames.length > 0) {
      selectedFrameIndex = findClosestRainViewerFrameIndex(
        frames,
        Date.now() / 1_000 - INITIAL_FRAME_OFFSET_SECONDS,
      )
      initialFrameSelectedRef.current = true
      instantFrameIndexRef.current = selectedFrameIndex
      useRainViewerRadarStore.getState().setFrameIndex(selectedFrameIndex, 'auto')
    }

    frameIndexRef.current = Math.max(0, Math.min(frames.length - 1, selectedFrameIndex))
    progress.value = frames.length <= 1 ? 1 : frameIndexRef.current / (frames.length - 1)
    frameLabel.value = labelsRef.current[frameIndexRef.current] ?? 'Radar'
  }, [frameCount, frames, frameLabel, progress])

  useEffect(() => {
    const unsubscribe = useRainViewerRadarStore.subscribe((state, previous) => {
      if (state.selectedFrameIndex === previous.selectedFrameIndex) return
      frameIndexRef.current = state.selectedFrameIndex
      const nextProgress =
        state.frames.length <= 1 ? 1 : state.selectedFrameIndex / (state.frames.length - 1)
      const instant = instantFrameIndexRef.current === state.selectedFrameIndex
      instantFrameIndexRef.current = null
      progress.value = instant
        ? nextProgress
        : withTiming(nextProgress, {
            duration: FRAME_INTERVAL_MS,
            easing: Easing.linear,
          })
      frameLabel.value = labelsRef.current[state.selectedFrameIndex] ?? 'Radar'
    })

    return unsubscribe
  }, [frameLabel, progress])

  const commitManualFrame = useCallback((index: number) => {
    instantFrameIndexRef.current = index
    useRainViewerRadarStore.getState().setFrameIndex(index)
  }, [])

  useEffect(() => {
    if (scrubbing || frames.length <= 1) return undefined
    const interval = setInterval(() => {
      const liveFrameCount = frameCountRef.current
      if (liveFrameCount <= 1) return
      const nextIndex = (frameIndexRef.current + 1) % liveFrameCount
      frameIndexRef.current = nextIndex
      useRainViewerRadarStore.getState().setFrameIndex(nextIndex, 'auto')
    }, FRAME_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [frames.length, scrubbing])

  function handleTrackLayout(event: LayoutChangeEvent) {
    trackWidth.value = event.nativeEvent.layout.width
  }

  const scrubGesture = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs -- shared values are only read/written inside gesture worklets, not during render
      createRadarScrubGesture({
        enabled: frames.length > 1,
        frameCount,
        trackWidth,
        gestureFrameIndex,
        progress,
        commitManualFrame,
        setScrubbing,
      }),
    [commitManualFrame, frameCount, frames.length, gestureFrameIndex, progress, trackWidth],
  )

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))
  const thumbStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
    transform: [{ scale: withTiming(scrubbing ? 1.25 : 1, { duration: 120 }) }],
  }))

  return (
    <View style={styles.container}>
      <MonoValue
        text={frameLabel}
        size={TIME_FONT_SIZE}
        weight="800"
        color={ui.foreground}
        align="center"
      />
      <GestureDetector gesture={scrubGesture}>
        <Animated.View
          accessibilityRole="adjustable"
          accessibilityLabel="Radar frame timeline"
          onLayout={handleTrackLayout}
          style={styles.track}
        >
          <View style={styles.guide}>
            <Animated.View style={[styles.fill, fillStyle]} />
          </View>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    paddingHorizontal: 20,
  },
  // A fat track with a handle on it: the thumb says the timeline can be dragged, and the row is
  // a finger tall so a scrub does not have to be aimed at the track itself.
  track: {
    height: 32,
    justifyContent: 'center',
  },
  guide: {
    backgroundColor: theme.ui.border,
    borderRadius: 999,
    height: TRACK_HEIGHT,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    marginLeft: -THUMB_SIZE / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: theme.ui.foreground,
  },
  // Inside the guide, not beside it: as a sibling it was positioned against the track box and
  // drew as a second line above the guide instead of over it.
  fill: {
    backgroundColor: theme.ui.foreground,
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
})
