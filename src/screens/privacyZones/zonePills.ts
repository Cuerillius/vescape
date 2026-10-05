import type { Icon } from '@tabler/icons-react-native'

import type { PrivacyZone } from '@/modules/history/store/privacyZoneStore'
import IconBriefcase from '@tabler/icons-react-native/IconBriefcase'
import IconHome from '@tabler/icons-react-native/IconHome'

export interface ZonePill {
  id: string
  name: string
  isBuiltIn: boolean
  isSaved: boolean
  enabled: boolean
  icon?: Icon
}

export interface PendingCustomZone {
  id: string
  name: string
}

/** Home and Work always show, saved or not; custom zones follow, including one unsaved draft. */
export function buildZonePills(
  zones: PrivacyZone[],
  pendingCustom?: PendingCustomZone | null,
): ZonePill[] {
  const homeZone = zones.find((z) => z.preset === 'home')
  const workZone = zones.find((z) => z.preset === 'work')

  const pills: ZonePill[] = [
    {
      id: 'home',
      name: 'Home',
      isBuiltIn: true,
      isSaved: !!homeZone,
      enabled: homeZone?.enabled ?? false,
      icon: IconHome,
    },
    {
      id: 'work',
      name: 'Work',
      isBuiltIn: true,
      isSaved: !!workZone,
      enabled: workZone?.enabled ?? false,
      icon: IconBriefcase,
    },
  ]

  for (const z of zones) {
    if (z.preset === 'custom') {
      pills.push({ id: z.id, name: z.name, isBuiltIn: false, isSaved: true, enabled: z.enabled })
    }
  }

  if (pendingCustom && !zones.some((z) => z.id === pendingCustom.id)) {
    pills.push({
      id: pendingCustom.id,
      name: pendingCustom.name,
      isBuiltIn: false,
      isSaved: false,
      enabled: false,
    })
  }

  return pills
}
