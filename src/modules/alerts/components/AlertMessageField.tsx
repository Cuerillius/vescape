import { StyleSheet, View } from 'react-native'
import { previewAlertSound } from 'vescape-core'
import IconVolume from '@tabler/icons-react-native/IconVolume'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AlertField } from '@/modules/alerts/components/AlertFormFields'
import type { DerivedBatteryConfig } from '@/modules/battery/lib/types'
import type { getAlertDialConfig } from '@/modules/alerts/lib/alertFormDefaults'
import { getMessagePlaceholders } from '@/modules/alerts/lib/alertFormDefaults'
import { useAlertMessageFormat } from '@/modules/alerts/hooks/useAlertMessageFormat'

/** Spoken-message template, its placeholder chips, and a preview of what will be said. */
export function AlertMessageField({
  controlId,
  unit,
  threshold,
  dialConfig,
  batteryConfig,
  messageTemplate,
  onChangeTemplate,
}: {
  controlId: string
  unit: string
  threshold: number
  dialConfig: ReturnType<typeof getAlertDialConfig>
  batteryConfig: DerivedBatteryConfig | null
  messageTemplate: string
  onChangeTemplate: (next: string | ((current: string) => string)) => void
}) {
  const formatMessage = useAlertMessageFormat()
  return (
    <AlertField label="Template">
      <Input
        value={messageTemplate}
        onChangeText={onChangeTemplate}
        multiline
        placeholder="e.g. Speed {value} {unit}"
        style={styles.templateInput}
      />
      <View style={styles.placeholderRow}>
        {getMessagePlaceholders(controlId, batteryConfig).map((placeholder) => (
          <Button
            key={placeholder}
            label={placeholder}
            variant="secondary"
            onPress={() => onChangeTemplate((current) => current + placeholder)}
          />
        ))}
        <Button
          icon={IconVolume}
          variant="outline"
          accessibilityLabel="Preview the spoken message"
          onPress={() =>
            previewAlertSound(
              `tts:${formatMessage(messageTemplate, threshold, unit, dialConfig, controlId, batteryConfig)}`,
            )
          }
          style={styles.previewButton}
        />
      </View>
    </AlertField>
  )
}

const styles = StyleSheet.create({
  templateInput: {
    height: undefined,
    minHeight: 72,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  placeholderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  previewButton: {
    marginLeft: 'auto',
  },
})
