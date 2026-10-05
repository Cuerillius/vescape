import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated'
import IconArrowUpRight from '@tabler/icons-react-native/IconArrowUpRight'
import { Canvas, Path, Skia, Text as SkiaText } from '@shopify/react-native-skia'
import { scheduleOnRN } from 'react-native-worklets'

import { Text } from '@/components/base/Text'
import { MonoText } from '@/components/base/MonoValue'
import { interaction, theme } from '@/constants/theme'
import { textAdvanceWidth } from '@/helpers/skiaText'
import { speedFromKmh, speedUnit } from '@/helpers/units'
import { useSkiaMonoFont } from '@/hooks/useSkiaFont'
import { useResolvedColor } from '@/hooks/useTheme'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { SpeedRingFlames } from '@/screens/main/dashboard/SpeedRingFlames'

// Both arcs open at the bottom: 270° of sweep starting from the lower left.
const START_DEG = 135
const SWEEP_DEG = 270
const OUTER_STROKE_RATIO = 0.07
const INNER_STROKE_RATIO = 0.045
const INNER_GAP_RATIO = 0.06
const VALUE_FONT_RATIO = 0.26
const DUTY_FONT_RATIO = 0.075
const DUTY_LABEL_FONT_RATIO = 0.055
// Vertical layout as fractions of the ring's size. The duty line sits in the opening below the
// arcs' ends (~0.83).
const SPEED_CENTER_RATIO = 0.47
const DUTY_BASELINE_RATIO = 0.92
const DUTY_GAP = 8
/** Arrow box top above the duty baseline, so it centres on the caps. */
const DUTY_ARROW_RISE = 15
/** Top of the duty line's tap target, below the arcs' ends. */
const DUTY_TARGET_TOP_RATIO = 0.84
const DUTY_LABEL = 'DUTY'
/** Percent points below the flame threshold where lit flames stay lit, so they don't flap. */
const FLAME_FADE_MARGIN = 2

/** Quiet mark beside the speed and duty readouts: they open their detail views. */
function DetailArrow({ style }: { style?: StyleProp<ViewStyle> }) {
  const color = useResolvedColor(theme.ui.faintForeground)
  return (
    <View pointerEvents="none" style={style}>
      <IconArrowUpRight size={17} color={color} strokeWidth={3.25} />
    </View>
  )
}

function arc(size: number, inset: number) {
  const path = Skia.Path.Make()
  path.addArc(
    { x: inset, y: inset, width: size - inset * 2, height: size - inset * 2 },
    START_DEG,
    SWEEP_DEG,
  )
  return path
}

/**
 * The dashboard's centrepiece: live speed inside two open arcs. The inner arc fills with duty
 * cycle; the duty percentage reads in the opening below. Values are
 * SharedValues, so it repaints without re-rendering.
 */
export function SpeedRing({
  size,
  speedKmh,
  dutyPercent,
  alarmThresholdPercent,
  onPressSpeed,
  onPressDuty,
}: {
  size: number
  speedKmh: SharedValue<number | null>
  dutyPercent: SharedValue<number | null>
  /** The duty alarm threshold: the arc turns red and the ring catches fire from here. Null for none. */
  alarmThresholdPercent: number | null
  onPressSpeed?: () => void
  onPressDuty?: () => void
}) {
  const units = useUnitSystem()
  const trackColor = useResolvedColor(theme.ui.card)
  const innerTrackColor = useResolvedColor(theme.ui.muted)
  const arcColor = useResolvedColor(theme.ui.primary)
  const hotColor = useResolvedColor(theme.status.error.color)
  const labelColor = useResolvedColor(theme.ui.mutedForeground)

  const outerStroke = Math.round(size * OUTER_STROKE_RATIO)
  const innerStroke = Math.max(4, Math.round(size * INNER_STROKE_RATIO))
  const innerInset = outerStroke + size * INNER_GAP_RATIO + innerStroke / 2
  const outer = useMemo(() => arc(size, outerStroke / 2), [outerStroke, size])
  const inner = useMemo(() => arc(size, innerInset), [innerInset, size])

  // The duty alarm threshold drives both the red arc and the flame; Infinity (no alarm) switches
  // both off.
  const alarmThreshold = useSharedValue(alarmThresholdPercent ?? Infinity)
  useEffect(() => {
    alarmThreshold.set(alarmThresholdPercent ?? Infinity)
  }, [alarmThresholdPercent, alarmThreshold])
  // Flames repaint every frame, so they stay mounted only while burning or animating out.
  const [burning, setBurning] = useState(false)
  const [flamesMounted, setFlamesMounted] = useState(false)
  const ignite = useCallback((on: boolean) => {
    setBurning(on)
    if (on) setFlamesMounted(true)
  }, [])
  const onFlamesExited = useCallback(() => setFlamesMounted(false), [])
  useAnimatedReaction(
    () => {
      const duty = dutyPercent.value ?? 0
      if (duty >= alarmThreshold.value) return 'on'
      return duty >= alarmThreshold.value - FLAME_FADE_MARGIN ? 'hold' : 'off'
    },
    (next, prev) => {
      if (next === prev || next === 'hold') return
      scheduleOnRN(ignite, next === 'on')
    },
  )

  const dutyEnd = useDerivedValue(() => Math.min(1, Math.max(0, (dutyPercent.value ?? 0) / 100)))
  const dutyArcColor = useDerivedValue(() =>
    (dutyPercent.value ?? 0) >= alarmThreshold.value ? hotColor : arcColor,
  )
  const speedText = useDerivedValue(() => speedFromKmh(speedKmh.value ?? 0, units).toFixed(1))
  const valueSize = Math.round(size * VALUE_FONT_RATIO)
  const valueHeight = Math.round(valueSize * 1.3)

  // "42% DUTY" centred as one group: the number's width changes, so both x positions follow it.
  const dutyFont = useSkiaMonoFont('700', Math.round(size * DUTY_FONT_RATIO))
  const labelFont = useSkiaMonoFont('500', Math.round(size * DUTY_LABEL_FONT_RATIO))
  const labelWidth = labelFont ? textAdvanceWidth(labelFont, DUTY_LABEL) : 0
  const dutyText = useDerivedValue(() => `${Math.round(dutyPercent.value ?? 0)}%`)
  const dutyX = useDerivedValue(() => {
    const numberWidth = dutyFont ? textAdvanceWidth(dutyFont, dutyText.value) : 0
    return (size - numberWidth - DUTY_GAP - labelWidth) / 2
  })
  const labelX = useDerivedValue(() => size - dutyX.value - labelWidth)
  const dutyBaseline = size * DUTY_BASELINE_RATIO
  const dutyArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: labelX.value + labelWidth + 4 }],
  }))

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Speed"
      onPress={onPressSpeed}
      style={({ pressed }) => [{ width: size, height: size }, pressed && styles.pressed]}
      testID="dashboard-speed"
    >
      {flamesMounted ? (
        <SpeedRingFlames
          size={size}
          outerStroke={outerStroke}
          dutyPercent={dutyPercent}
          thresholdPercent={alarmThreshold}
          active={burning}
          onExited={onFlamesExited}
        />
      ) : null}
      <Canvas style={StyleSheet.absoluteFill}>
        <Path
          path={outer}
          style="stroke"
          strokeWidth={outerStroke}
          strokeCap="round"
          color={trackColor}
        />
        <Path
          path={inner}
          style="stroke"
          strokeWidth={innerStroke}
          strokeCap="round"
          color={innerTrackColor}
        />
        <Path
          path={inner}
          style="stroke"
          strokeWidth={innerStroke}
          strokeCap="round"
          color={dutyArcColor}
          end={dutyEnd}
        />
        <MonoText
          text={speedText}
          size={valueSize}
          weight="800"
          align="center"
          color={theme.ui.foreground}
          x={0}
          y={size * SPEED_CENTER_RATIO - valueHeight / 2}
          width={size}
          height={valueHeight}
        />
        {dutyFont ? (
          <SkiaText
            x={dutyX}
            y={dutyBaseline}
            text={dutyText}
            font={dutyFont}
            color={dutyArcColor}
          />
        ) : null}
        {labelFont ? (
          <SkiaText
            x={labelX}
            y={dutyBaseline}
            text={DUTY_LABEL}
            font={labelFont}
            color={labelColor}
          />
        ) : null}
      </Canvas>
      <View
        pointerEvents="none"
        style={[styles.unitWrap, { top: size * SPEED_CENTER_RATIO + valueHeight * 0.42 }]}
      >
        <View style={styles.unitRow}>
          <Text style={styles.unit}>{speedUnit(units).toUpperCase()}</Text>
          <DetailArrow style={styles.unitArrow} />
        </View>
      </View>
      <Animated.View
        pointerEvents="none"
        style={[styles.dutyArrow, { top: dutyBaseline - DUTY_ARROW_RISE }, dutyArrowStyle]}
      >
        <DetailArrow />
      </Animated.View>
      {/* The duty line below the arcs opens the duty view; the rest of the ring opens speed. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Duty cycle"
        hitSlop={8}
        onPress={onPressDuty}
        style={[
          styles.dutyTarget,
          { top: size * DUTY_TARGET_TOP_RATIO, left: size * 0.25, right: size * 0.25 },
        ]}
        testID="dashboard-duty"
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  dutyTarget: {
    position: 'absolute',
    bottom: 0,
  },
  unitWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unitArrow: {
    marginTop: 3,
  },
  dutyArrow: {
    position: 'absolute',
    left: 0,
  },
  unit: {
    color: theme.ui.mutedForeground,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 2,
  },
})
