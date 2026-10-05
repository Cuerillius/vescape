import { PointAnnotation } from '@rnmapbox/maps'
import { StyleSheet, View } from 'react-native'

import { theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { getMapMarkSpec, type MapMarkKind } from '@/modules/map/constants/mapMarks'
import { muteMarkColor } from '@/modules/map/lib/mapMarkColor'
import type { MapMarkGlyph } from '@/modules/map-points/components/MapPointTablerIcons'

interface MapMarkProps {
  kind: MapMarkKind
  selected?: boolean
  /** Replaces the kind's hue, for marks whose color names a rider. */
  color?: ThemeColor
  /** Replaces the kind's glyph, e.g. the category of the place a Direction Point sits on. */
  icon?: MapMarkGlyph
}

const SIZE = { default: 30, selected: 40 } as const
const ICON_SIZE = { default: 16, selected: 21 } as const
// Where the ride starts and ends should stand out from the marks along the route.
const ENDPOINT_SIZE = { default: 40, selected: 46 } as const
const ENDPOINT_ICON_SIZE = { default: 21, selected: 24 } as const

/**
 * A map mark, without the map annotation around it. Card-colored ground with the kind's hue on the
 * ring and glyph; selected marks fill with the hue instead, so the choice reads at a glance.
 */
export function MapMarkFace({ kind, selected = false, color, icon }: MapMarkProps) {
  const spec = getMapMarkSpec(kind)
  const hue = muteMarkColor(useResolvedColor(color ?? spec.color), spec.saturation)
  const card = useResolvedColor(theme.ui.card)
  const onHue = useResolvedColor(theme.palette.mono.white)
  const variant = selected ? 'selected' : 'default'
  const endpoint = spec.shape === 'solid'
  const size = (endpoint ? ENDPOINT_SIZE : SIZE)[variant]
  const iconSize = (endpoint ? ENDPOINT_ICON_SIZE : ICON_SIZE)[variant]
  const filled = selected || spec.shape === 'solid'
  const background = filled ? hue : card
  const glyph = filled ? onHue : hue
  const Glyph = icon ?? spec.icon

  if (spec.shape === 'diamond') {
    // The box is rotated, so the glyph is turned back to stay upright.
    const box = Math.round(size * 0.78)
    return (
      <View
        style={[
          styles.base,
          {
            width: box,
            height: box,
            borderRadius: 7,
            borderWidth: 2,
            backgroundColor: background,
            borderColor: hue,
            transform: [{ rotate: '45deg' }],
          },
        ]}
      >
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <Glyph size={iconSize} color={glyph} strokeWidth={2.25} />
        </View>
      </View>
    )
  }

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: spec.shape === 'square' ? 9 : size / 2,
          backgroundColor: background,
          borderColor: spec.shape === 'solid' ? card : hue,
          borderWidth: spec.shape === 'solid' ? 2.5 : 2,
        },
      ]}
    >
      <Glyph size={iconSize} color={glyph} strokeWidth={2.25} />
    </View>
  )
}

/** Map mark placed on the map. */
export function MapMark({
  id,
  coordinate,
  onSelected,
  ...face
}: MapMarkProps & {
  id: string
  coordinate: [number, number]
  onSelected?: () => void
}) {
  const spec = getMapMarkSpec(face.kind)
  const hue = muteMarkColor(useResolvedColor(face.color ?? spec.color), spec.saturation)
  const card = useResolvedColor(theme.ui.card)
  return (
    // Colors are in the key: PointAnnotation snapshots its children natively, so a theme change
    // must remount the mark to re-render.
    <PointAnnotation
      key={`${id}-${face.selected ? 'selected' : 'default'}-${hue}-${card}`}
      id={id}
      coordinate={coordinate}
      onSelected={onSelected}
    >
      {/* collapsable={false}: on iOS New Arch (Fabric) a layout-only wrapper is flattened, which breaks the PointAnnotation snapshot (rnmapbox #3682). */}
      <View collapsable={false} style={styles.frame}>
        <MapMarkFace {...face} />
      </View>
    </PointAnnotation>
  )
}

const styles = StyleSheet.create({
  frame: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  base: { alignItems: 'center', justifyContent: 'center' },
})
