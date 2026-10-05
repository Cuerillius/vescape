import IconArrowUp from '@tabler/icons-react-native/IconArrowUp'
import IconCompass from '@tabler/icons-react-native/IconCompass'
import IconDeviceMobile from '@tabler/icons-react-native/IconDeviceMobile'
import IconNavigation from '@tabler/icons-react-native/IconNavigation'
import { useMemo, type ComponentType } from 'react'
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated'

import { SegmentedMenu, type SegmentedMenuOption } from '@/components/ui/SegmentedMenu'
import { MAP_ORIENTATION_MODES, type MapOrientationMode } from '@/modules/map/constants/mapStyles'

type OrientationIcon = ComponentType<{ size: number; color: string }>

interface MapOrientationSelectorProps {
  activeMode: MapOrientationMode
  heading: SharedValue<number>
  expanded: boolean
  onToggle: () => void
  onSelect: (mode: MapOrientationMode) => void
}

/** A compass that keeps pointing north while the rider rotates the map by hand. */
function headingCompass(heading: SharedValue<number>): OrientationIcon {
  return function HeadingCompassIcon({ size, color }) {
    const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${-heading.value}deg` }] }))
    return (
      <Animated.View style={style}>
        <IconCompass size={size} color={color} />
      </Animated.View>
    )
  }
}

export function MapOrientationSelector({
  activeMode,
  heading,
  expanded,
  onToggle,
  onSelect,
}: MapOrientationSelectorProps) {
  // Memoised: a fresh component identity every render would remount the icon.
  const options = useMemo<SegmentedMenuOption<MapOrientationMode>[]>(() => {
    const icons: Record<MapOrientationMode, OrientationIcon> = {
      northUp: IconArrowUp,
      gpsHeading: IconNavigation,
      phoneHeading: IconDeviceMobile,
      freeRotate: headingCompass(heading),
    }
    return MAP_ORIENTATION_MODES.map((mode) => ({ ...mode, icon: icons[mode.key] }))
  }, [heading])
  const activeLabel = MAP_ORIENTATION_MODES.find((mode) => mode.key === activeMode)?.label

  return (
    <SegmentedMenu
      activeKey={activeMode}
      options={options}
      expanded={expanded}
      size="lg"
      collapsedAccessibilityLabel={`Navigation: ${activeLabel}`}
      onToggle={onToggle}
      onSelect={onSelect}
    />
  )
}
