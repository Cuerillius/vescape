import { useEffect } from 'react'
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

interface ShowcaseSweep {
  min: number
  max: number
  durationMs: number
}

/**
 * A live `SharedValue` for previewing components that read one. It holds `value`, or, while `sweep`
 * is given, rises and falls between its bounds forever so the live states can be watched.
 */
export function useShowcaseValue(
  value: number | null,
  sweep: ShowcaseSweep | null = null,
): SharedValue<number | null> {
  const shared = useSharedValue<number | null>(value)
  const min = sweep?.min
  const max = sweep?.max
  const durationMs = sweep?.durationMs

  useEffect(() => {
    if (min == null || max == null || durationMs == null) {
      shared.set(value)
      return
    }
    shared.set(min)
    shared.set(
      withRepeat(
        withTiming(max, { duration: durationMs, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    )
    return () => cancelAnimation(shared)
  }, [shared, value, min, max, durationMs])

  return shared
}
