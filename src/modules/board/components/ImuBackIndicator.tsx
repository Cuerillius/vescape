import { Canvas, Group, Path } from '@shopify/react-native-skia'
import { useDerivedValue, type SharedValue } from 'react-native-reanimated'

import { ImuLevelTicks, IMU_PIVOT_Y } from '@/modules/board/components/ImuLevelTicks'
import { useResolvedUiColors } from '@/hooks/useTheme'

/**
 * Drawn in the units of the side silhouette's artwork (`tunePreviewBoard`), at the same scale and
 * with the same pivot as {@link ImuIndicator}, so the two views read as one board: the tire is as
 * tall as the side view's wheel ring, and the deck as wide as a real deck is against that tire.
 */
const ART_WIDTH = 89
/** Leaves room for the board to lean without leaving the canvas. */
const FIT = 0.82
/** How far the board dims while it isn't sending roll. */
const IDLE_OPACITY = 0.35

/** Line weight of every outline, matching the side silhouette's walls. */
const STROKE = 2.2
// Proportions of the side silhouette seen from behind: the tire is as tall as the side view's ring
// (35) and a little narrower than the deck, which is a third of the side view's 89-long deck.
const TIRE_PATH =
  'M-10.6 -4.5V-8.9A7.5 7.5 0 0 1 -3.1 -16.4H3.1A7.5 7.5 0 0 1 10.6 -8.9V-4.5M-10.6 4.5V8.9A7.5 7.5 0 0 0 -3.1 16.4H3.1A7.5 7.5 0 0 0 10.6 8.9V4.5'
// The deck is a plain rectangle with softly rounded corners.
const DECK_PATH =
  'M-12.9 -3.4H12.9Q14.4 -3.4 14.4 -1.9V1.9Q14.4 3.4 12.9 3.4H-12.9Q-14.4 3.4 -14.4 1.9V-1.9Q-14.4 -3.4 -12.9 -3.4Z'

export interface ImuBackIndicatorProps {
  /** Live roll in degrees, straight off the telemetry tick. */
  roll: SharedValue<number | null>
  /** Canvas size in points. */
  size?: number
  /** Mark where level is on the canvas edges. */
  showLevelTicks?: boolean
  testID?: string
}

/** The board from behind, leaning with roll and level at zero; the counterpart of the side view. */
export function ImuBackIndicator({
  roll,
  size = 96,
  showLevelTicks = false,
  testID,
}: ImuBackIndicatorProps) {
  'use no memo'
  const color = useResolvedUiColors().foreground
  const scale = (size * FIT) / ART_WIDTH
  const transform = useDerivedValue(() => [
    { translateX: size / 2 },
    { translateY: size * IMU_PIVOT_Y },
    { rotate: ((roll.value ?? 0) * Math.PI) / 180 },
    { scale },
  ])
  const opacity = useDerivedValue(() => (roll.value == null ? IDLE_OPACITY : 1))

  return (
    <Canvas style={{ width: size, height: size }} testID={testID}>
      {showLevelTicks ? <ImuLevelTicks size={size} inset={0.24} color={color} /> : null}
      <Group transform={transform} opacity={opacity}>
        <Path path={TIRE_PATH} color={color} style="stroke" strokeWidth={STROKE} />
        <Path
          path={DECK_PATH}
          color={color}
          style="stroke"
          strokeWidth={STROKE}
          strokeJoin="round"
        />
      </Group>
    </Canvas>
  )
}
