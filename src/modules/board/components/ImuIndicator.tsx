import { useMemo } from 'react'
import { Canvas, Group, Path } from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'

import { ImuLevelTicks, IMU_PIVOT_Y } from '@/modules/board/components/ImuLevelTicks'
import { useResolvedUiColors } from '@/hooks/useTheme'
import {
  BOARD_LEVEL_RADIANS,
  BOARD_PIVOT_X,
  BOARD_PIVOT_Y,
  createBoardPath,
} from '@/modules/tune/components/tunePreviewBoard'

/** The artwork's width in its own units; the drawing is scaled so this fits the canvas. */
const BOARD_ART_WIDTH = 89
/** Leaves room for the board to tilt without its ends leaving the canvas. */
const FIT = 0.82
/** How far the board dims while it isn't sending pitch. */
const IDLE_OPACITY = 0.35

export interface ImuIndicatorProps {
  /** Live pitch in degrees, straight off the telemetry tick. */
  pitch: SharedValue<number | null>
  /** Canvas size in points. */
  size?: number
  /** Canvas width when it should be wider than tall, which spreads the level marks further apart. */
  width?: number
  /** Mark where level is on the canvas edges. */
  showLevelTicks?: boolean
  testID?: string
}

/**
 * The board silhouette from the tune preview, tilting with pitch and level at zero. Dim until the
 * board is sending, like the side view on the IMU screen it summarises.
 */
export function ImuIndicator({
  pitch,
  size = 96,
  width = size,
  showLevelTicks = false,
  testID,
}: ImuIndicatorProps) {
  'use no memo'
  const color = useResolvedUiColors().foreground
  const boardPath = useMemo(createBoardPath, [])
  const scale = (size * FIT) / BOARD_ART_WIDTH
  const transform = useDerivedValue(() => [
    { translateX: width / 2 },
    { translateY: size * IMU_PIVOT_Y },
    { rotate: ((pitch.value ?? 0) * Math.PI) / 180 },
    { scale },
    { rotate: BOARD_LEVEL_RADIANS },
    { translateX: -BOARD_PIVOT_X },
    { translateY: -BOARD_PIVOT_Y },
  ])
  const opacity = useDerivedValue(() => (pitch.value == null ? IDLE_OPACITY : 1))

  return (
    <Canvas style={{ width, height: size }} testID={testID}>
      {showLevelTicks ? (
        <ImuLevelTicks size={size} canvasWidth={width} inset={0} color={color} />
      ) : null}
      <Group transform={transform}>
        {boardPath ? <Path path={boardPath} color={color} opacity={opacity} /> : null}
      </Group>
    </Canvas>
  )
}
