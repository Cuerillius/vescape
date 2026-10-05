import IconAdjustments from '@tabler/icons-react-native/IconAdjustments'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconBatteryCharging from '@tabler/icons-react-native/IconBatteryCharging'
import IconBolt from '@tabler/icons-react-native/IconBolt'
import IconCircleDashed from '@tabler/icons-react-native/IconCircleDashed'
import IconCompass from '@tabler/icons-react-native/IconCompass'
import IconFlag from '@tabler/icons-react-native/IconFlag'
import IconFlame from '@tabler/icons-react-native/IconFlame'
import IconGauge from '@tabler/icons-react-native/IconGauge'
import IconHeartbeat from '@tabler/icons-react-native/IconHeartbeat'
import IconLeaf from '@tabler/icons-react-native/IconLeaf'
import IconMountain from '@tabler/icons-react-native/IconMountain'
import IconRoad from '@tabler/icons-react-native/IconRoad'
import IconRocket from '@tabler/icons-react-native/IconRocket'
import IconSettings from '@tabler/icons-react-native/IconSettings'
import IconShieldCheck from '@tabler/icons-react-native/IconShieldCheck'
import IconSnowflake from '@tabler/icons-react-native/IconSnowflake'
import IconSparkles from '@tabler/icons-react-native/IconSparkles'
import IconSunrise from '@tabler/icons-react-native/IconSunrise'
import IconTarget from '@tabler/icons-react-native/IconTarget'
import IconTool from '@tabler/icons-react-native/IconTool'
import IconWaveSine from '@tabler/icons-react-native/IconWaveSine'
import IconWind from '@tabler/icons-react-native/IconWind'
import type { Icon } from '@tabler/icons-react-native'

import {
  tuneProfileColorId,
  tuneProfileIconId,
  type TuneProfileColorId,
  type TuneProfileIconId,
} from '@/modules/tune/lib/profileMetadata'
import { theme, type ThemeColor } from '@/constants/theme'

interface PaletteTheme {
  bg: ThemeColor
  border: ThemeColor
  color: ThemeColor
  text: ThemeColor
}

const COLORS: Record<TuneProfileColorId, PaletteTheme> = {
  purple: theme.palette.purple,
  cyan: theme.palette.cyan,
  sky: theme.palette.sky,
  green: theme.palette.green,
  amber: theme.palette.amber,
  orange: theme.palette.orange,
  red: theme.palette.red,
  yellow: theme.palette.yellow,
  blue: theme.palette.blue,
  fuchsia: theme.palette.fuchsia,
  pink: theme.palette.pink,
  violet: theme.palette.violet,
}

const ICONS: Record<TuneProfileIconId, Icon> = {
  'sliders-horizontal': IconAdjustmentsHorizontal,
  faders: IconAdjustments,
  lightning: IconBolt,
  mountains: IconMountain,
  'road-horizon': IconRoad,
  'rocket-launch': IconRocket,
  gauge: IconGauge,
  'wave-sine': IconWaveSine,
  snowflake: IconSnowflake,
  'sun-horizon': IconSunrise,
  'battery-charging': IconBatteryCharging,
  compass: IconCompass,
  fire: IconFlame,
  'flag-checkered': IconFlag,
  'gear-six': IconSettings,
  heartbeat: IconHeartbeat,
  leaf: IconLeaf,
  'shield-check': IconShieldCheck,
  sparkle: IconSparkles,
  target: IconTarget,
  tire: IconCircleDashed,
  wind: IconWind,
  wrench: IconTool,
}

export function tuneProfileIconComponent(icon: string | null | undefined): Icon {
  return ICONS[tuneProfileIconId(icon)]
}
