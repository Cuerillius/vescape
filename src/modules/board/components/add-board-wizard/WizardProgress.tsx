import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { CardDescription } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import type { WizardStepId } from '@/modules/board/hooks/useAddBoardWizard'

const STEP_LABEL: Record<WizardStepId, string> = {
  scan: 'Pair',
  setup: 'Setup',
  confirm: 'Confirm',
}

interface Props {
  steps: readonly WizardStepId[]
  step: number
}

export function WizardProgress({ steps, step }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {steps.map((id, index) => (
          <View
            key={id}
            style={[
              styles.segment,
              index < step && styles.segmentDone,
              index === step && styles.segmentCurrent,
            ]}
          />
        ))}
      </View>
      <View style={styles.caption}>
        <Text style={styles.stepLabel}>{STEP_LABEL[steps[step]!]}</Text>
        <CardDescription>{`Step ${step + 1} of ${steps.length}`}</CardDescription>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.ui.muted,
  },
  segmentDone: {
    backgroundColor: theme.palette.green.color,
  },
  segmentCurrent: {
    backgroundColor: theme.ui.foreground,
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  stepLabel: {
    color: theme.ui.foreground,
    fontSize: 13,
    fontWeight: '600',
  },
})
