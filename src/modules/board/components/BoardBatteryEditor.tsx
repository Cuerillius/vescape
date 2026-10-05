import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { BoardBatteryForm } from '@/modules/board/components/BoardBatteryForm'
import type { BoardBatteryDraft } from '@/modules/board/hooks/useBoardBatteryForm'
import { buildBatteryConfig } from '@/modules/board/lib/boardSetup'

interface BoardBatteryEditorProps {
  value: BoardBatteryDraft
  saving?: boolean
  onSave: (value: BoardBatteryDraft) => Promise<boolean> | boolean
}

/** Inline battery configuration: edits a draft and commits it with an explicit Save. */
export function BoardBatteryEditor({ value, saving = false, onSave }: BoardBatteryEditorProps) {
  const [draft, setDraft] = useState(value)
  const patch = (next: Partial<BoardBatteryDraft>) => setDraft((prev) => ({ ...prev, ...next }))

  const canSave =
    buildBatteryConfig(
      draft.batteryMode,
      draft.cellPresetId,
      draft.seriesCount,
      draft.parallelCount,
      draft.manualMinVoltage,
      draft.manualMaxVoltage,
    ) !== null

  return (
    <View style={styles.container}>
      <BoardBatteryForm
        batteryMode={draft.batteryMode}
        cellPresetId={draft.cellPresetId}
        seriesCount={draft.seriesCount}
        parallelCount={draft.parallelCount}
        manualMinVoltage={draft.manualMinVoltage}
        manualMaxVoltage={draft.manualMaxVoltage}
        onChangeBatteryMode={(batteryMode) => patch({ batteryMode })}
        onChangeCellPresetId={(cellPresetId) => patch({ cellPresetId })}
        onChangeSeriesCount={(seriesCount) => patch({ seriesCount })}
        onChangeParallelCount={(parallelCount) => patch({ parallelCount })}
        onChangeManualMinVoltage={(manualMinVoltage) => patch({ manualMinVoltage })}
        onChangeManualMaxVoltage={(manualMaxVoltage) => patch({ manualMaxVoltage })}
        testIDPrefix="edit-board-battery"
      />
      <Button
        label={saving ? 'Saving…' : 'Save'}
        variant="primary"
        disabled={!canSave || saving}
        onPress={() => void onSave(draft)}
        testID="edit-board-battery-save"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
})
