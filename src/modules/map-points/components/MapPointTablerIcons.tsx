import type { ComponentType } from 'react'
import Svg, { Path } from 'react-native-svg'

export interface MapPointTablerIconProps {
  size?: number | string
  color?: string
  strokeWidth?: number
}

/** Any glyph a map mark can show: a stock Tabler icon or one drawn here. */
export type MapMarkGlyph = ComponentType<MapPointTablerIconProps>

/**
 * The Drop, Bonk and Nose slide glyphs redrawn on Tabler's 24px outline grid (2px round stroke,
 * no fill) so they sit beside the stock Tabler icons.
 */
function TablerStroke({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  paths,
}: MapPointTablerIconProps & { paths: string[] }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  )
}

/** A ledge the rider drops off, with the arc down to the landing. */
export function IconMapPointDrop(props: MapPointTablerIconProps) {
  return (
    <TablerStroke
      {...props}
      paths={['M2 11h8.5v8H22', 'M4 4c9 0 14.500 2.500 15.500 9', 'M16 11.500l3.500 1.500l2 -3']}
    />
  )
}

/** An arc into a rock: the board stops dead. */
export function IconMapPointBonk(props: MapPointTablerIconProps) {
  return (
    <TablerStroke
      {...props}
      paths={[
        'M2 10c5 .5 9.500 -1.500 10.500 -7.500',
        'M8.500 3.500l4 -1.500l2 3',
        'M6 21c-.5 -1.500 .5 -2.500 1.500 -3.500c1 -1 3 -1.500 4 -2.500c1.500 -1 3 1 5 1c2 0 1.500 2 2 3.500c.3 1.500 -1.500 1.500 -2.500 1.500h-8.500c-.7 0 -1 -.3 -1.500 0z',
      ]}
    />
  )
}

/** A rail running down from a post: the nose slide. */
export function IconMapPointSlide(props: MapPointTablerIconProps) {
  return (
    <TablerStroke {...props} paths={['M20 8.500v-6l-16 12v5.500', 'M1.500 20h5', 'M17 8.500h5']} />
  )
}
