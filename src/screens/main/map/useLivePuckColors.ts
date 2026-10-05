import { theme } from '@/constants/theme'
import { useResolvedAccentColors, useResolvedColor } from '@/hooks/useTheme'
import { useRiderStore } from '@/modules/group-ride/store/riderStore'

/**
 * Colors of the rider's own position marks: the dot, the trail and both heading cones. Their own
 * picked color, else blue, so they stand apart from the rest of the group; the ring is the zinc
 * background so the marks lift off either map appearance.
 */
export function useLivePuckColors() {
  const accents = useResolvedAccentColors()
  const riderColor = useRiderStore((state) => state.riderColor)
  const color = riderColor ?? accents.blue.color
  const ring = useResolvedColor(theme.ui.background)
  return { color, ring }
}
