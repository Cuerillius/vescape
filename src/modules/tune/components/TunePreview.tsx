/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/base/Text'
import {
  Canvas,
  DashPathEffect,
  Group,
  Line,
  Path,
  Skia,
  Text as SkiaText,
  vec,
} from '@shopify/react-native-skia'
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated'
import type { TuneProfileFieldValue } from 'vescape-core'

import { theme } from '@/constants/theme'
import { TunePreviewHeader } from '@/modules/tune/components/TunePreviewHeader'
import { TunePreviewReadouts } from '@/modules/tune/components/TunePreviewReadouts'
import {
  BOARD_LEVEL_RADIANS,
  BOARD_PIVOT_X,
  BOARD_PIVOT_Y,
  BOARD_SCALE,
  TARGET_BOARD_OPACITY,
  createBoardPath,
} from '@/modules/tune/components/tunePreviewBoard'
import {
  CANVAS_HEIGHT,
  DECK_CENTER_Y,
  DECK_HALF_LENGTH,
  FOOTPAD_OFFSET,
  GROUND_TICK_SPACING,
  GROUND_Y,
  READOUT_FONT_SIZE,
  SCENE_LABEL_FONT_SIZE,
  SPEED_FONT_SIZE,
  ZERO_MARKER_GAP,
  formatSignedDegrees,
  pitchInputArrow,
} from '@/modules/tune/components/tunePreviewCanvasGeometry'
import { textAdvanceWidth } from '@/helpers/skiaText'
import { useFormat } from '@/hooks/useFormat'
import { useCanvasSize } from '@/hooks/useCanvasSize'
import { useSkiaMonoFont } from '@/hooks/useSkiaFont'
import { useResolvedUiColors } from '@/hooks/useTheme'
import {
  DEFAULT_TUNE_PREVIEW_ADVANCED_PHYSICS,
  TUNE_PREVIEW_RESET_SPEED_KMH,
  TUNE_PREVIEW_MODEL_VERSION,
  calculateGroundToBoardAngleDegrees,
  createTunePreviewModel,
  createTunePreviewState,
  groundTravelToVisualOffset,
  stepTunePreview,
  type TunePreviewAdvancedPhysics,
  type TunePreviewParameters,
} from '@/modules/tune/lib/tunePreview'
import {
  terrainHeightRelativeToWheel,
  tunePreviewDeckLine,
} from '@/modules/tune/lib/tunePreviewGeometry'

interface TunePreviewProps {
  fields: Record<string, TuneProfileFieldValue>
  pitchInputDegrees: SharedValue<number>
  pitchInputActive: SharedValue<boolean>
  hillsEnabled?: boolean
  hillHeightMeters?: number
  hillSpacingMeters?: number
  active?: boolean
  onHelp: () => void
  /** Sits beside the title, e.g. the terrain picker. */
  headerAccessory?: ReactNode
  /** Collapsed, only the header shows and the simulation stops. */
  expanded?: boolean
  onToggleExpanded?: () => void
  speedKmh?: SharedValue<number>
  groundToBoardAngleDegrees?: SharedValue<number>
}

interface TunePreviewScenario {
  parameters: TunePreviewParameters | null
  hillsEnabled: boolean
  hillHeightMeters: number
  hillSpacingMeters: number
  advancedPhysics: TunePreviewAdvancedPhysics
}

export const TUNE_PREVIEW_DESCRIPTION = 'Simulation for comparing Tune settings'

export function TunePreview({
  fields,
  pitchInputDegrees,
  pitchInputActive,
  hillsEnabled = false,
  hillHeightMeters = 2.5,
  hillSpacingMeters = 30,
  active = true,
  onHelp,
  headerAccessory,
  expanded = true,
  onToggleExpanded,
  speedKmh,
  groundToBoardAngleDegrees,
}: TunePreviewProps) {
  const ui = useResolvedUiColors()
  const boardPath = useMemo(createBoardPath, [])
  const model = useMemo(
    () => createTunePreviewModel(fields),
    // Restart the animation loop after a model hot reload instead of retaining its old closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, TUNE_PREVIEW_MODEL_VERSION],
  )
  const parameters = model.status === 'ready' ? model.parameters : null
  const { size, onLayout } = useCanvasSize()
  const canvasWidth = size.w
  const centerX = canvasWidth / 2

  const state = useSharedValue(createTunePreviewState(TUNE_PREVIEW_RESET_SPEED_KMH))
  const scenario = useSharedValue<TunePreviewScenario>({
    parameters,
    hillsEnabled,
    hillHeightMeters,
    hillSpacingMeters,
    advancedPhysics: DEFAULT_TUNE_PREVIEW_ADVANCED_PHYSICS,
  })
  const boardAngleStr = useSharedValue('0.0°')
  const targetAngleStr = useSharedValue('0.0°')
  const groundToBoardAngleStr = useSharedValue('0.0°')
  const errorAngleStr = useSharedValue('0.0°')
  const speedReadoutKmh = useSharedValue(TUNE_PREVIEW_RESET_SPEED_KMH)
  const currentStr = useSharedValue('0 A')

  useEffect(() => {
    scenario.value = {
      parameters,
      hillsEnabled,
      hillHeightMeters,
      hillSpacingMeters,
      advancedPhysics: DEFAULT_TUNE_PREVIEW_ADVANCED_PHYSICS,
    }
  }, [scenario, parameters, hillsEnabled, hillHeightMeters, hillSpacingMeters])

  // Physics and readouts run entirely on the UI runtime; the JS thread only syncs scenario props.
  const frameCallback = useFrameCallback((frame) => {
    'worklet'
    const { parameters: activeParameters, ...terrain } = scenario.value
    if (!activeParameters) return
    const dtSeconds = (frame.timeSincePreviousFrame ?? 0) / 1000
    if (dtSeconds <= 0) return
    const next = stepTunePreview(
      state.value,
      activeParameters,
      {
        pitchInputDegrees: pitchInputDegrees.value,
        pitchInputActive: pitchInputActive.value,
        speedKmh: state.value.syntheticSpeedKmh,
        hillsEnabled: terrain.hillsEnabled,
        hillHeightMeters: terrain.hillHeightMeters,
        hillSpacingMeters: terrain.hillSpacingMeters,
        advancedPhysics: terrain.advancedPhysics,
      },
      dtSeconds,
    )
    state.value = next
    const groundToBoardAngle = calculateGroundToBoardAngleDegrees(
      next.angleDegrees,
      next.terrainSlope,
    )
    if (groundToBoardAngleDegrees) groundToBoardAngleDegrees.value = groundToBoardAngle
    if (speedKmh) speedKmh.value = next.syntheticSpeedKmh
    const current = next.syntheticCurrentAmps
    boardAngleStr.value = formatSignedDegrees(next.angleDegrees)
    targetAngleStr.value = formatSignedDegrees(next.targetAngleDegrees)
    groundToBoardAngleStr.value = formatSignedDegrees(groundToBoardAngle)
    errorAngleStr.value = formatSignedDegrees(next.angleDegrees - next.targetAngleDegrees)
    speedReadoutKmh.value = next.syntheticSpeedKmh
    currentStr.value = `${current > 0 ? '+' : ''}${current.toFixed(0)} A`
  }, false)

  const running = active && expanded && parameters != null
  useEffect(() => {
    frameCallback.setActive(running)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const boardTransformAt = (angleDegrees: number) => {
    'worklet'
    return [
      { translateX: centerX },
      { translateY: DECK_CENTER_Y },
      { rotate: (angleDegrees * Math.PI) / 180 },
      { scale: BOARD_SCALE },
      { rotate: BOARD_LEVEL_RADIANS },
      { translateX: -BOARD_PIVOT_X },
      { translateY: -BOARD_PIVOT_Y },
    ]
  }
  const boardTransform = useDerivedValue(() => boardTransformAt(state.value.angleDegrees))
  const targetTransform = useDerivedValue(() => boardTransformAt(state.value.targetAngleDegrees))
  const frontArrow = useDerivedValue(() =>
    pitchInputArrow(state.value.angleDegrees, pitchInputDegrees.value, centerX, -FOOTPAD_OFFSET),
  )
  const rearArrow = useDerivedValue(() =>
    pitchInputArrow(state.value.angleDegrees, pitchInputDegrees.value, centerX, FOOTPAD_OFFSET),
  )
  const frontArrowPath = useDerivedValue(() => frontArrow.value.path)
  const frontArrowOpacity = useDerivedValue(() => frontArrow.value.opacity)
  const rearArrowPath = useDerivedValue(() => rearArrow.value.path)
  const rearArrowOpacity = useDerivedValue(() => rearArrow.value.opacity)
  const ticksPath = useDerivedValue(() => {
    const path = Skia.Path.Make()
    if (scenario.value.hillsEnabled) return path
    const offset = groundTravelToVisualOffset(state.value.groundTravelMeters)
    const tickCount = Math.ceil(canvasWidth / GROUND_TICK_SPACING) + 1
    for (let index = 0; index < tickCount; index += 1) {
      const x = index * GROUND_TICK_SPACING + offset
      path.moveTo(x, GROUND_Y)
      path.lineTo(x - 4, GROUND_Y + 6)
    }
    return path
  })
  const terrainPath = useDerivedValue(() => {
    const path = Skia.Path.Make()
    const {
      hillsEnabled: hills,
      hillHeightMeters: height,
      hillSpacingMeters: spacing,
    } = scenario.value
    if (!hills) return path
    const travel = state.value.groundTravelMeters
    for (let x = 0; x <= canvasWidth; x += 6) {
      const y =
        GROUND_Y - terrainHeightRelativeToWheel(x - canvasWidth / 2, travel, height, spacing)
      if (x === 0) path.moveTo(x, y)
      else path.lineTo(x, y)
    }
    return path
  })

  // The level reference runs from each edge to just short of the board's ends.
  const levelLeftPath = useMemo(() => {
    const path = Skia.Path.Make()
    path.moveTo(0, DECK_CENTER_Y)
    path.lineTo(Math.max(0, centerX - DECK_HALF_LENGTH - ZERO_MARKER_GAP), DECK_CENTER_Y)
    return path
  }, [centerX])
  const levelRightPath = useMemo(() => {
    const path = Skia.Path.Make()
    path.moveTo(centerX + DECK_HALF_LENGTH + ZERO_MARKER_GAP, DECK_CENTER_Y)
    path.lineTo(canvasWidth, DECK_CENTER_Y)
    return path
  }, [centerX, canvasWidth])
  const terrainFillPath = useDerivedValue(() => {
    const path = terrainPath.value.copy()
    path.lineTo(canvasWidth, CANVAS_HEIGHT)
    path.lineTo(0, CANVAS_HEIGHT)
    path.close()
    return path
  })
  const readoutFont = useSkiaMonoFont('600', READOUT_FONT_SIZE)
  const speedFont = useSkiaMonoFont('700', SPEED_FONT_SIZE)
  const labelFont = useSkiaMonoFont('500', SCENE_LABEL_FONT_SIZE)
  const { formatSpeed, speedUnit } = useFormat()
  const speedStr = useDerivedValue(() => formatSpeed(speedReadoutKmh.value, 1))
  // Right-aligned to the scene's top-right corner, so the digits grow leftwards.
  const speedX = useDerivedValue(() =>
    speedFont ? canvasWidth - textAdvanceWidth(speedFont, speedStr.value) : 0,
  )
  const speedUnitX =
    speedFont && labelFont ? canvasWidth - textAdvanceWidth(labelFont, speedUnit) : 0
  const groundX = useDerivedValue(() =>
    readoutFont ? centerX - textAdvanceWidth(readoutFont, groundToBoardAngleStr.value) / 2 : 0,
  )
  const groundLabelX = labelFont ? centerX - textAdvanceWidth(labelFont, 'Ground') / 2 : 0

  return (
    <View style={styles.card}>
      <TunePreviewHeader
        onHelp={onHelp}
        description={TUNE_PREVIEW_DESCRIPTION}
        accessory={expanded ? headerAccessory : undefined}
        expanded={expanded}
        onToggleExpanded={onToggleExpanded}
      />
      {!expanded ? null : model.status === 'unsupported' ? (
        <View style={styles.unsupported}>
          <Text style={styles.unsupportedTitle}>Preview unavailable</Text>
          <Text style={styles.unsupportedText}>Missing: {model.missingFields.join(', ')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.canvasWrap} onLayout={onLayout}>
            <Canvas style={styles.canvas} accessibilityLabel="Board angle preview">
              <Path
                path={levelLeftPath}
                style="stroke"
                color={ui.faintForeground}
                strokeWidth={1.5}
                strokeCap="round"
              >
                <DashPathEffect intervals={[2, 6]} />
              </Path>
              <Path
                path={levelRightPath}
                style="stroke"
                color={ui.faintForeground}
                strokeWidth={1.5}
                strokeCap="round"
              >
                <DashPathEffect intervals={[2, 6]} />
              </Path>
              {hillsEnabled ? (
                <>
                  <Path path={terrainFillPath} color={ui.muted} />
                  <Path
                    path={terrainPath}
                    style="stroke"
                    color={ui.mutedForeground}
                    strokeWidth={2}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                </>
              ) : (
                <>
                  <Path
                    path={ticksPath}
                    style="stroke"
                    color={ui.faintForeground}
                    strokeWidth={1.5}
                    strokeCap="round"
                  />
                  <Line
                    p1={vec(0, GROUND_Y)}
                    p2={vec(canvasWidth, GROUND_Y)}
                    color={ui.mutedForeground}
                    strokeWidth={2}
                    strokeCap="round"
                  />
                </>
              )}
              {speedFont && labelFont ? (
                <>
                  <SkiaText
                    x={speedX}
                    y={SPEED_FONT_SIZE}
                    text={speedStr}
                    font={speedFont}
                    color={ui.foreground}
                  />
                  <SkiaText
                    x={speedUnitX}
                    y={SPEED_FONT_SIZE + SCENE_LABEL_FONT_SIZE + 2}
                    text={speedUnit}
                    font={labelFont}
                    color={ui.mutedForeground}
                  />
                </>
              ) : null}
              {readoutFont && labelFont ? (
                <>
                  <SkiaText
                    x={groundX}
                    y={GROUND_Y + 24}
                    text={groundToBoardAngleStr}
                    font={readoutFont}
                    color={ui.foreground}
                  />
                  <SkiaText
                    x={groundLabelX}
                    y={GROUND_Y + 24 + SCENE_LABEL_FONT_SIZE + 3}
                    text="Ground"
                    font={labelFont}
                    color={ui.mutedForeground}
                  />
                </>
              ) : null}
              <Group transform={targetTransform}>
                {boardPath ? (
                  <Path
                    path={boardPath}
                    color={ui.mutedForeground}
                    opacity={TARGET_BOARD_OPACITY}
                  />
                ) : null}
              </Group>
              <Group transform={boardTransform}>
                {boardPath ? <Path path={boardPath} color={ui.foreground} /> : null}
              </Group>
              <Path
                path={frontArrowPath}
                opacity={frontArrowOpacity}
                style="stroke"
                color={ui.foreground}
                strokeWidth={2.25}
                strokeCap="round"
                strokeJoin="round"
              />
              <Path
                path={rearArrowPath}
                opacity={rearArrowOpacity}
                style="stroke"
                color={ui.foreground}
                strokeWidth={2.25}
                strokeCap="round"
                strokeJoin="round"
              />
            </Canvas>
          </View>
          <TunePreviewReadouts
            motorStr={currentStr}
            boardAngleStr={boardAngleStr}
            targetAngleStr={targetAngleStr}
            errorAngleStr={errorAngleStr}
            font={readoutFont}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  canvasWrap: { position: 'relative', height: CANVAS_HEIGHT },
  canvas: { width: '100%', height: CANVAS_HEIGHT },
  unsupported: { height: CANVAS_HEIGHT, alignItems: 'center', justifyContent: 'center', gap: 5 },
  unsupportedTitle: { color: theme.ui.foreground, fontSize: 13, fontWeight: '600' },
  unsupportedText: { color: theme.ui.mutedForeground, fontSize: 11 },
})
