import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Input } from '@/components/ui/Input'
import { theme } from '@/constants/theme'
import { BoardTopSpeedCard } from '@/modules/alerts/components/BoardTopSpeedCard'
import { BoardBatteryForm } from '@/modules/board/components/BoardBatteryForm'
import {
  WizardNavActions,
  WizardStepLayout,
} from '@/modules/board/components/add-board-wizard/WizardStepLayout'
import type { UseAddBoardWizard } from '@/modules/board/hooks/useAddBoardWizard'

export function SetupStep({ wizard }: { wizard: UseAddBoardWizard }) {
  return (
    <WizardStepLayout
      title="Set up your board"
      description="Shown on the Board tab and in your ride history. Battery and top speed scale the gauges and alerts."
      footer={
        <WizardNavActions
          canContinue={Boolean(wizard.name.trim()) && wizard.batteryWarning == null}
          onBack={wizard.back}
          onNext={wizard.next}
          testIDPrefix="add-board-setup"
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Name</Text>
        <Input
          value={wizard.name}
          onChangeText={wizard.setName}
          returnKeyType="done"
          testID="add-board-name-input"
          accessibilityLabel="Board name"
        />
      </View>

      <BoardTopSpeedCard value={wizard.topSpeedKmh} onChange={wizard.setTopSpeedKmh} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Battery</Text>
        <BoardBatteryForm
          batteryMode={wizard.batteryMode}
          cellPresetId={wizard.cellPresetId}
          seriesCount={wizard.seriesCount}
          parallelCount={wizard.parallelCount}
          manualMinVoltage={wizard.manualMinVoltage}
          manualMaxVoltage={wizard.manualMaxVoltage}
          onChangeBatteryMode={wizard.setBatteryMode}
          onChangeCellPresetId={wizard.setCellPresetId}
          onChangeSeriesCount={wizard.setSeriesCount}
          onChangeParallelCount={wizard.setParallelCount}
          onChangeManualMinVoltage={wizard.setManualMinVoltage}
          onChangeManualMaxVoltage={wizard.setManualMaxVoltage}
          testIDPrefix="add-board-battery"
        />
      </View>
    </WizardStepLayout>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
})
