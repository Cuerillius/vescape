import { useFocusEffect } from 'expo-router'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconPlus from '@tabler/icons-react-native/IconPlus'

import { Button } from '@/components/ui/Button'
import { MessageCard } from '@/components/ui/MessageCard'
import { theme } from '@/constants/theme'
import { AccessoryRow } from '@/modules/accessories/components/AccessoryRow'
import { AccessoryIcon } from '@/modules/accessories/constants/accessoryIcon'
import { accessoryNeedsSetup, useAccessoryStore } from '@/modules/accessories/store/accessoryStore'
import { SettingsDescription, SettingsGroup } from '@/modules/settings/components/SettingsGroup'

export function AccessoriesScreen({
  onAddAccessory,
  onOpenAccessory,
}: {
  onAddAccessory: () => void
  onOpenAccessory: (accessoryId: string) => void
}) {
  const accessories = useAccessoryStore((s) => s.accessories)
  const sync = useAccessoryStore((s) => s.sync)
  useFocusEffect(sync)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SettingsDescription>
          Accessories are sensors and lights that work with your board.
        </SettingsDescription>
        {accessories.length === 0 ? (
          <MessageCard
            icon={AccessoryIcon}
            title="No accessories yet"
            description="Sensors and lights that work with your board. Add one and Vescape connects to it every ride."
          />
        ) : (
          <SettingsGroup title="Your accessories">
            {accessories.map((accessory) => (
              <AccessoryRow
                key={accessory.accessoryId}
                name={accessory.name}
                detail={`v${accessory.firmwareVersion}`}
                phase={accessory.phase}
                needsSetup={accessoryNeedsSetup(accessory)}
                onPress={() => onOpenAccessory(accessory.accessoryId)}
              />
            ))}
          </SettingsGroup>
        )}
        <Button label="Add accessory" icon={IconPlus} variant="primary" onPress={onAddAccessory} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 24,
  },
})
