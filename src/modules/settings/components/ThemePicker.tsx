import IconPalette from '@tabler/icons-react-native/IconPalette'

import { SelectMenu } from '@/components/ui/SelectMenu'
import { SettingsLink } from '@/modules/settings/components/SettingsGroup'
import { THEME_OPTIONS } from '@/modules/settings/lib/themeOptions'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

const OPTIONS = THEME_OPTIONS.map(({ mode, label }) => ({ value: mode, label }))

/** Settings row: the current theme as a menu trigger; the hint explains the chosen mode. */
export function ThemePicker() {
  const mode = useSettingsStore((s) => s.themeMode)
  const setSetting = useSettingsStore((s) => s.set)
  const selected = THEME_OPTIONS.find((o) => o.mode === mode) ?? THEME_OPTIONS[0]!

  return (
    <SettingsLink
      icon={IconPalette}
      label="Theme"
      hint={selected.hint}
      right={
        <SelectMenu
          options={OPTIONS}
          value={selected.mode}
          onChange={(value) => void setSetting('themeMode', value)}
          accessibilityLabel="Theme"
          testID="theme-select"
        />
      }
    />
  )
}
