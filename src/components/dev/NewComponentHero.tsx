import type { Icon } from '@tabler/icons-react-native'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface NewComponentHeroProps {
  icon: Icon
  description: string
}

/** `IconHero`, restyled on the zinc `theme.ui` tokens for the rebuilt-kit showcase. */
export function NewComponentHero({ icon: IconComponent, description }: NewComponentHeroProps) {
  const iconColor = useResolvedColor(theme.ui.faintForeground)
  return (
    <View style={styles.container}>
      <IconComponent size={64} color={iconColor} strokeWidth={1} />
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
})
