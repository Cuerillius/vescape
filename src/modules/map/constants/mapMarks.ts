import IconFlag2 from '@tabler/icons-react-native/IconFlag2'
import IconPlayerPlay from '@tabler/icons-react-native/IconPlayerPlay'

import { theme, type ThemeColor } from '@/constants/theme'
import { HISTORY_MARKER_COLORS } from '@/modules/history/lib/historyMapMarkerInfo'
import { HISTORY_MARKER_TABLER_ICONS } from '@/modules/history/lib/historyMarkerTablerIcons'
import type { HistoryMarker } from '@/modules/history/store/historyStore'
import { RED_MARK_SATURATION } from '@/modules/map/lib/mapMarkColor'
import type { MapMarkGlyph } from '@/modules/map-points/components/MapPointTablerIcons'
import { getMapPointKindTablerIcon } from '@/modules/map-points/constants/mapPointTablerIcons'
import {
  getMapPointKindLabel,
  MAP_POINT_CATEGORY_OPTIONS,
  type MapPinKind,
} from '@/modules/map-points/constants/mapPoints'

/**
 * The shape says what family a mark belongs to, the color says which kind, and the glyph says what
 * it is — so a mark stays readable when any one of the three is hard to see.
 *
 * - `ring`: a place the rider saved (Map Points)
 * - `diamond`: a place to go (Direction Point)
 * - `solid`: where the ride starts and ends
 * - `square`: something that happened during the ride (Ride History Markers)
 */
export type MapMarkShape = 'ring' | 'diamond' | 'solid' | 'square'

export type MapMarkKind = MapPinKind | 'start' | 'end' | HistoryMarker['type']

export interface MapMarkSpec {
  shape: MapMarkShape
  color: ThemeColor
  icon: MapMarkGlyph
  label: string
  /** Share of the hue's saturation the mark keeps; defaults to `MAP_MARK_SATURATION`. */
  saturation?: number
}

/** Hue per Map Point kind, spread around the wheel so neighbouring kinds never share a color. */
const MAP_POINT_MARK_COLORS: Record<MapPinKind, ThemeColor> = {
  drop: theme.palette.yellow.color,
  bonk: '#a6c22f',
  nose_slide: theme.palette.purple.color,
  trail_entry: theme.palette.teal.color,
  viewpoint: theme.palette.amber.color,
  charging: theme.palette.sky.color,
  direction: theme.palette.green.color,
}

const HISTORY_MARKER_LABELS: Record<HistoryMarker['type'], string> = {
  app_stop: 'Recording stopped',
  auto_pause: 'Auto pause',
  connected: 'Connected',
  connection_lost: 'Connection lost',
  disconnected: 'Disconnected',
  error: 'Error',
  gap: 'History gap',
}

export const MAP_MARK_GROUPS: { title: string; kinds: readonly MapMarkKind[] }[] = [
  {
    title: 'Map Points',
    kinds: MAP_POINT_CATEGORY_OPTIONS.map((option) => option.kind),
  },
  { title: 'Direction Point', kinds: ['direction'] },
  { title: 'Ride route', kinds: ['start', 'end'] },
  {
    title: 'Ride History Markers',
    kinds: [
      'connected',
      'disconnected',
      'connection_lost',
      'auto_pause',
      'app_stop',
      'error',
      'gap',
    ],
  },
]

export function getMapMarkSpec(kind: MapMarkKind): MapMarkSpec {
  if (kind === 'start') {
    return {
      shape: 'solid',
      color: theme.palette.green.color,
      icon: IconPlayerPlay,
      label: 'Start',
    }
  }
  if (kind === 'end') {
    return {
      shape: 'solid',
      color: theme.status.error.color,
      icon: IconFlag2,
      label: 'End',
      saturation: RED_MARK_SATURATION,
    }
  }
  if (kind === 'direction') {
    return {
      shape: 'diamond',
      color: MAP_POINT_MARK_COLORS[kind],
      icon: getMapPointKindTablerIcon(kind),
      label: getMapPointKindLabel(kind),
    }
  }
  if (kind in HISTORY_MARKER_COLORS) {
    const type = kind as HistoryMarker['type']
    return {
      shape: 'square',
      color: HISTORY_MARKER_COLORS[type],
      icon: HISTORY_MARKER_TABLER_ICONS[type],
      label: HISTORY_MARKER_LABELS[type],
      saturation: type === 'error' ? RED_MARK_SATURATION : undefined,
    }
  }
  const pointKind = kind as MapPinKind
  return {
    shape: 'ring',
    color: MAP_POINT_MARK_COLORS[pointKind],
    icon: getMapPointKindTablerIcon(pointKind),
    label: getMapPointKindLabel(pointKind),
  }
}
