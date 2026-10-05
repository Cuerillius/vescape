import * as Haptics from 'expo-haptics'
import { Platform, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { ProbeHint, ProbeSection, probeStyles } from '@/screens/showcase/other/ProbeSection'

const androidHaptics = Object.values(Haptics.AndroidHaptics).map((type) => ({
  label: type
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' '),
  type,
}))

/** Every native Android haptic constant, one button each. */
export function HapticsProbe() {
  return (
    <ProbeSection title="Haptics">
      {Platform.OS === 'android' ? (
        <>
          <ProbeHint>Native performHapticFeedback constants</ProbeHint>
          <View style={probeStyles.wrap}>
            {androidHaptics.map((haptic) => (
              <Button
                key={haptic.type}
                label={haptic.label}
                onPress={() => void Haptics.performAndroidHapticsAsync(haptic.type)}
              />
            ))}
          </View>
        </>
      ) : (
        <ProbeHint>
          {Platform.OS === 'web' ? 'Haptics not available on web' : 'Android haptic controls only'}
        </ProbeHint>
      )}
    </ProbeSection>
  )
}
