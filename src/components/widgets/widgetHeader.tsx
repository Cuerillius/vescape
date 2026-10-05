import type { Icon } from '@tabler/icons-react-native'

import type { ThemeColor } from '@/constants/theme'

export interface WidgetHeaderProps {
  icon: Icon
  title: string
  description?: string
  accent?: ThemeColor
}
