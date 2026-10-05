import type { MapPointCategory } from 'vescape-core'

import type { MapPinKind } from '@/modules/map-points/constants/mapPoints'

/** The direction target is the rider's own and is never filtered away. */
export function isFilterableMapPinKind(kind: MapPinKind): kind is MapPointCategory {
  return kind !== 'direction'
}

export function isMapPinKindVisible(
  kind: MapPinKind,
  hiddenCategories: readonly MapPointCategory[],
) {
  return !isFilterableMapPinKind(kind) || !hiddenCategories.includes(kind)
}
