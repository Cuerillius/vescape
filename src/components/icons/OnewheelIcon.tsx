import Svg, { Path } from 'react-native-svg'

export interface OnewheelIconProps {
  size?: number | string
  color?: string
  strokeWidth?: number
}

/**
 * A Onewheel in side profile, drawn on Tabler's 24px outline grid (round stroke, no fill) so it
 * sits beside the stock Tabler icons: one long deck with the tire centred on it, the tire's
 * outline broken where the deck passes through.
 */
export function OnewheelIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
}: OnewheelIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12h22M7.9 9.2a5 5 0 0 1 8.2 0M16.1 14.8a5 5 0 0 1-8.2 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
