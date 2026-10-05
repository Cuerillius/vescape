import { useCallback, useState } from 'react'
import { View } from 'react-native'
import IconVolume from '@tabler/icons-react-native/IconVolume'
import { previewAlertSound } from 'vescape-core'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProbeHint, ProbeSection, probeStyles } from '@/screens/showcase/other/ProbeSection'

const TTS_EXAMPLES = [
  'Battery {voltage} volts, {percent}%',
  '{value} {unit}',
  'Warning! {value} {unit}',
]

/** Speaks an alert message template, so placeholder substitution can be heard. */
export function TtsProbe() {
  const [ttsTemplate, setTtsTemplate] = useState('Battery {voltage} volts, {percent}%')

  const handleSpeakTts = useCallback(() => {
    previewAlertSound(`tts:${ttsTemplate}`)
  }, [ttsTemplate])

  return (
    <ProbeSection title="Message alert (TTS)">
      <ProbeHint>
        Placeholders: {'{value}'} {'{threshold}'} {'{unit}'} — battery only: {'{voltage}'}{' '}
        {'{percent}'}
      </ProbeHint>
      <View style={probeStyles.wrap}>
        {TTS_EXAMPLES.map((example) => (
          <Button
            key={example}
            label={example}
            variant={ttsTemplate === example ? 'primary' : 'outline'}
            onPress={() => setTtsTemplate(example)}
          />
        ))}
      </View>
      <Input
        value={ttsTemplate}
        onChangeText={setTtsTemplate}
        placeholder="Enter template…"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        label="Speak"
        icon={IconVolume}
        variant="primary"
        size="lg"
        onPress={handleSpeakTts}
      />
    </ProbeSection>
  )
}
