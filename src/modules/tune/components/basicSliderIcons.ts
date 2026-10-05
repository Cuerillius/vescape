import type { Icon } from '@tabler/icons-react-native'
import IconArrowDown from '@tabler/icons-react-native/IconArrowDown'
import IconArrowUp from '@tabler/icons-react-native/IconArrowUp'
import IconBolt from '@tabler/icons-react-native/IconBolt'
import IconHandStop from '@tabler/icons-react-native/IconHandStop'
import IconMountain from '@tabler/icons-react-native/IconMountain'
import IconNavigation from '@tabler/icons-react-native/IconNavigation'
import IconWaveSine from '@tabler/icons-react-native/IconWaveSine'

const BASIC_SLIDER_ICONS: Record<string, Icon> = {
  aggressiveness: IconBolt,
  noseStiffness: IconArrowUp,
  tailStiffness: IconArrowDown,
  carveTilt: IconWaveSine,
  brakeTilt: IconHandStop,
  atrIntensity: IconMountain,
}

export function basicSliderIcon(sliderId: string): Icon {
  return BASIC_SLIDER_ICONS[sliderId] ?? IconNavigation
}
