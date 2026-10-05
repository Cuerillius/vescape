import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import type { BatteryConfig } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SelectMenu, type SelectMenuOption } from '@/components/ui/SelectMenu'
import { Stepper } from '@/components/ui/Stepper'
import { theme } from '@/constants/theme'
import {
  BATTERY_CELL_PRESETS,
  DEFAULT_BATTERY_CONFIG,
  deriveBatteryConfig,
  getBatteryPreset,
} from '@/modules/battery/lib'
import { parseVoltage } from '@/modules/board/lib/boardSetup'

type BatteryMode = BatteryConfig['mode']

interface BoardBatteryFormProps {
  batteryMode: BatteryMode
  cellPresetId: string
  seriesCount: number
  parallelCount: number
  manualMinVoltage: string
  manualMaxVoltage: string
  onChangeBatteryMode: (mode: BatteryMode) => void
  onChangeCellPresetId: (value: string) => void
  onChangeSeriesCount: (value: number) => void
  onChangeParallelCount: (value: number) => void
  onChangeManualMinVoltage: (value: string) => void
  onChangeManualMaxVoltage: (value: string) => void
  testIDPrefix?: string
}

export function BoardBatteryForm({
  batteryMode,
  cellPresetId,
  seriesCount,
  parallelCount,
  manualMinVoltage,
  manualMaxVoltage,
  onChangeBatteryMode,
  onChangeCellPresetId,
  onChangeSeriesCount,
  onChangeParallelCount,
  onChangeManualMinVoltage,
  onChangeManualMaxVoltage,
  testIDPrefix,
}: BoardBatteryFormProps) {
  const selectedPreset =
    getBatteryPreset(cellPresetId) ?? getBatteryPreset(DEFAULT_BATTERY_CONFIG.cellPresetId)
  const formFactors = useMemo(
    () => unique(BATTERY_CELL_PRESETS.map((preset) => preset.formFactor)),
    [],
  )
  const formFactorOptions = useMemo<SelectMenuOption<string>[]>(
    () => formFactors.map((formFactor) => ({ label: formFactor, value: formFactor })),
    [formFactors],
  )
  const selectedFormFactor = selectedPreset?.formFactor ?? formFactors[0]
  const brands = useMemo(
    () =>
      unique(
        BATTERY_CELL_PRESETS.filter((preset) => preset.formFactor === selectedFormFactor).map(
          (preset) => preset.brand,
        ),
      ),
    [selectedFormFactor],
  )
  const brandOptions = useMemo<SelectMenuOption<string>[]>(
    () => brands.map((brand) => ({ label: brand, value: brand })),
    [brands],
  )
  const selectedBrand = selectedPreset?.brand ?? brands[0]
  const models = useMemo(
    () =>
      BATTERY_CELL_PRESETS.filter(
        (preset) => preset.formFactor === selectedFormFactor && preset.brand === selectedBrand,
      ),
    [selectedBrand, selectedFormFactor],
  )
  const modelOptions = useMemo<SelectMenuOption<string>[]>(
    () =>
      models.map((preset) => ({
        label: `${preset.model}${preset.verified ? '' : ' (unverified)'}`,
        value: preset.id,
      })),
    [models],
  )
  const draftWarning = deriveBatteryConfig(
    batteryMode === 'preset'
      ? { mode: 'preset', cellPresetId, seriesCount, parallelCount }
      : {
          mode: 'manual',
          minVoltage: parseVoltage(manualMinVoltage) ?? 0,
          maxVoltage: parseVoltage(manualMaxVoltage) ?? 0,
        },
  ).warning

  const choosePreset = (next: { formFactor?: string; brand?: string; cellPresetId?: string }) => {
    if (next.cellPresetId) {
      onChangeCellPresetId(next.cellPresetId)
      return
    }
    const formFactor = next.formFactor ?? selectedFormFactor
    const brand =
      next.brand ??
      BATTERY_CELL_PRESETS.find((preset) => preset.formFactor === formFactor)?.brand ??
      selectedBrand
    const preset = BATTERY_CELL_PRESETS.find(
      (candidate) => candidate.formFactor === formFactor && candidate.brand === brand,
    )
    if (preset) onChangeCellPresetId(preset.id)
  }

  return (
    <View style={styles.form}>
      <View style={styles.modeRow}>
        <Button
          label="Preset"
          variant={batteryMode === 'preset' ? 'primary' : 'outline'}
          onPress={() => onChangeBatteryMode('preset')}
          style={styles.modeButton}
          testID={testIDPrefix ? `${testIDPrefix}-preset-mode` : undefined}
        />
        <Button
          label="Manual"
          variant={batteryMode === 'manual' ? 'primary' : 'outline'}
          onPress={() => onChangeBatteryMode('manual')}
          style={styles.modeButton}
          testID={testIDPrefix ? `${testIDPrefix}-manual-mode` : undefined}
        />
      </View>

      {batteryMode === 'preset' ? (
        <>
          <SelectMenu
            label="Form factor"
            options={formFactorOptions}
            value={selectedFormFactor}
            onChange={(formFactor) => choosePreset({ formFactor })}
          />
          <SelectMenu
            label="Brand"
            options={brandOptions}
            value={selectedBrand}
            onChange={(brand) => choosePreset({ brand })}
          />
          <SelectMenu
            label="Model"
            options={modelOptions}
            value={cellPresetId}
            onChange={(nextPresetId) => choosePreset({ cellPresetId: nextPresetId })}
          />
          <View style={styles.row}>
            <Text style={styles.label}>Series</Text>
            <Stepper
              value={seriesCount}
              min={1}
              max={40}
              step={1}
              label="series count"
              onChange={onChangeSeriesCount}
              testIDPrefix={testIDPrefix ? `${testIDPrefix}-series` : undefined}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Parallel</Text>
            <Stepper
              value={parallelCount}
              min={1}
              max={20}
              step={1}
              label="parallel count"
              onChange={onChangeParallelCount}
              testIDPrefix={testIDPrefix ? `${testIDPrefix}-parallel` : undefined}
            />
          </View>
        </>
      ) : (
        <View style={styles.voltageRow}>
          <View style={styles.voltageField}>
            <Text style={styles.label}>Empty (0%) volts</Text>
            <Input
              value={manualMinVoltage}
              onChangeText={onChangeManualMinVoltage}
              placeholder="60"
              keyboardType="decimal-pad"
              testID={testIDPrefix ? `${testIDPrefix}-manual-min-input` : undefined}
            />
          </View>
          <View style={styles.voltageField}>
            <Text style={styles.label}>Full (100%) volts</Text>
            <Input
              value={manualMaxVoltage}
              onChangeText={onChangeManualMaxVoltage}
              placeholder="84"
              keyboardType="decimal-pad"
              testID={testIDPrefix ? `${testIDPrefix}-manual-max-input` : undefined}
            />
          </View>
        </View>
      )}

      {draftWarning ? <Text style={styles.warning}>{draftWarning}</Text> : null}
    </View>
  )
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  voltageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  voltageField: {
    flex: 1,
    gap: 6,
  },
  warning: {
    color: theme.status.warning.text,
    fontSize: 12,
    fontWeight: '600',
  },
})
