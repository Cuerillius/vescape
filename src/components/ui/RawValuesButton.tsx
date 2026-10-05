import IconBraces from '@tabler/icons-react-native/IconBraces'

import { Button } from '@/components/ui/Button'

/** Header action that opens a screen's raw values (config, BMS data, settings). */
export function RawValuesButton({
  onPress,
  accessibilityLabel,
  testID,
}: {
  onPress: () => void
  accessibilityLabel: string
  testID?: string
}) {
  return (
    <Button
      icon={IconBraces}
      variant="ghost"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    />
  )
}
