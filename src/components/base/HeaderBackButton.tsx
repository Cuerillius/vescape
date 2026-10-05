import { useRouter } from 'expo-router'
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft'
import { Pressable, StyleSheet } from 'react-native'

import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** Borderless back arrow for the stack header, on `theme.ui.background`. */
export function HeaderBackButton() {
  const router = useRouter()
  const iconColor = useResolvedColor(theme.ui.foreground)
  return (
    <Pressable
      testID="header-back"
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      onPress={() => router.back()}
      android_ripple={{ ...interaction.rippleBorderless, radius: 22 }}
      style={({ pressed }) => [styles.back, pressed && { opacity: interaction.pressedOpacity }]}
    >
      <IconArrowLeft size={26} color={iconColor} strokeWidth={2.75} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
