import type { SharedValue } from 'react-native-reanimated'

import { SettingsValue } from '@/modules/settings/components/SettingsGroup'
import { LiveNumber } from './LiveNumber'

/** Hypothetical sensor output, calculated natively from calibration and a fresh reading. */
export function GroundClearanceTiltPreview({ value }: { value: SharedValue<number> }) {
  return (
    <SettingsValue
      label="Tilt preview"
      value={<LiveNumber value={value} decimals={0} unit="%" />}
    />
  )
}
