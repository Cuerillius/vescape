import IconArrowUp from '@tabler/icons-react-native/IconArrowUp'
import IconNews from '@tabler/icons-react-native/IconNews'

import { Button } from '@/components/ui/Button'

interface ReleaseActionPillProps {
  latestVersion?: string
  onPress: () => void
}

export function ReleaseActionPill({ latestVersion, onPress }: ReleaseActionPillProps) {
  const updateAvailable = latestVersion !== undefined

  return (
    <Button
      label={updateAvailable ? `Update to v${latestVersion}` : "Check what's new"}
      onPress={onPress}
      icon={updateAvailable ? IconArrowUp : IconNews}
      variant={updateAvailable ? 'primary' : 'outline'}
      accessibilityLabel={
        updateAvailable
          ? `Update Vescape to version ${latestVersion}`
          : "Check what's new in Vescape"
      }
    />
  )
}
