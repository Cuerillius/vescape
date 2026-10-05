import type { ThemeMode } from '@/modules/settings/lib/themeMode'

/** The four theme choices, used by the quick-settings row and its selection menu. */
export const THEME_OPTIONS: {
  mode: ThemeMode
  label: string
  hint: string
}[] = [
  { mode: 'system', label: 'System', hint: 'Follow the phone appearance setting' },
  { mode: 'light', label: 'Light', hint: 'Keep the app bright' },
  { mode: 'dark', label: 'Dark', hint: 'Keep the app dim' },
  {
    mode: 'sun',
    label: 'Sunrise & sunset',
    hint: 'Use daylight at the current or last known location',
  },
]
