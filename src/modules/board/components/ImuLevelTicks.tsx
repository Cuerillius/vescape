import { Line, vec } from '@shopify/react-native-skia'

/** Where the board's wheel centre sits in the canvas, as a share of its height. */
export const IMU_PIVOT_Y = 0.58
/** Tick length and weight as shares of the canvas, short enough to stay clear of a tilted board. */
const TICK_LENGTH = 0.07
const TICK_WIDTH = 0.022
const TICK_OPACITY = 0.5

interface ImuLevelTicksProps {
  size: number
  /** Canvas width, when it is wider than the square `size`. */
  canvasWidth?: number
  /** Gap between each canvas edge and its tick, as a share of the canvas: wider boards sit further out. */
  inset: number
  color: string
}

/**
 * Two short marks on the canvas edges at wheel-centre height: the board's own line meets them
 * when it is perfectly level. Drawn outside the board's rotating group, so they never move.
 */
export function ImuLevelTicks({ size, canvasWidth = size, inset, color }: ImuLevelTicksProps) {
  const y = size * IMU_PIVOT_Y
  const edge = size * inset
  const length = size * TICK_LENGTH
  const width = size * TICK_WIDTH
  return (
    <>
      <Line
        p1={vec(edge + width / 2, y)}
        p2={vec(edge + length, y)}
        color={color}
        opacity={TICK_OPACITY}
        strokeWidth={width}
        strokeCap="round"
      />
      <Line
        p1={vec(canvasWidth - edge - length, y)}
        p2={vec(canvasWidth - edge - width / 2, y)}
        color={color}
        opacity={TICK_OPACITY}
        strokeWidth={width}
        strokeCap="round"
      />
    </>
  )
}
