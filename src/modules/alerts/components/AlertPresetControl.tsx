import { useFormat } from '@/hooks/useFormat'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { speedFromKmh, speedUnit } from '@/helpers/units'
import { type ReactNode, useMemo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconPlayerStop from '@tabler/icons-react-native/IconPlayerStop'
import IconTrash from '@tabler/icons-react-native/IconTrash'
import IconVolume from '@tabler/icons-react-native/IconVolume'
import type { AlertTestRule } from 'vescape-core'
import { useSharedValue, type SharedValue } from 'react-native-reanimated'

import { Button } from '@/components/ui/Button'
import { Text } from '@/components/base/Text'
import type { DualGaugeAlert } from '@/components/charts/gaugeAlert'
import { SingleGauge } from '@/modules/board/components/SingleGauge'
import { telemetry } from '@/modules/board/constants/telemetry'
import {
  ALERT_PRESET_CONFIG_FIELDS,
  supportsBoardConfigMatch,
  type AlertPresetLevel,
  type AlertPresetMetric,
} from '@/modules/alerts/lib/alertPresets'
import { useAlertPresetFormat } from '@/modules/alerts/hooks/useAlertPresetFormat'
import {
  configRelativeBase,
  type BoardConfigBases,
} from '@/modules/alerts/lib/configRelativeFields'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { useAlertTest } from '@/modules/alerts/hooks/useAlertTest'

/** Controlled preset selection and gauge. The caller supplies one resolved rule snapshot for
 * markers, descriptions and the sound preview; saved Boards never regenerate rules here. */

interface PresetGaugeDescriptor {
  /** Readout unit shown under the live value. */
  unit: string
  decimals: number
  min: number
  /** Full-scale value; speed overrides this with Board Top Speed. */
  defaultMax: number
  /** Compact label drawn at a threshold marker (e.g. `20%`, `70°`, `38 km/h`). */
  formatMarker: (value: number) => string
}

const round = (value: number) => Math.round(value)

// JS-only presentation: colors, units, and label formatting the gauge preview draws.
// Battery is percent-scaled here (its thresholds are SoC %), unlike the voltage telemetry metric.
const PRESET_GAUGE: Record<AlertPresetMetric, PresetGaugeDescriptor> = {
  battery: {
    unit: '%',
    decimals: 0,
    min: 0,
    defaultMax: 100,
    formatMarker: (v) => `${round(v)}%`,
  },
  speed: {
    unit: 'km/h',
    decimals: 0,
    min: 0,
    defaultMax: telemetry.speed.chartRange.max,
    formatMarker: (v) => `${round(v)} km/h`,
  },
  duty: {
    unit: '%',
    decimals: 0,
    min: 0,
    defaultMax: 100,
    formatMarker: (v) => `${round(v)}%`,
  },
  'motor-temp': {
    unit: '°C',
    decimals: 0,
    min: 0,
    defaultMax: telemetry.motorTemp.chartRange.max,
    formatMarker: (v) => `${round(v)}°`,
  },
  'controller-temp': {
    unit: '°C',
    decimals: 0,
    min: 0,
    defaultMax: telemetry.controllerTemp.chartRange.max,
    formatMarker: (v) => `${round(v)}°`,
  },
}

/**
 * Structural mirror of the gauge hot-range span. Kept local so this alerts-module
 * component never imports the history module (no `alerts → history` edge); it is
 * assignable to {@link SingleGauge}'s `MetricHotRange` prop.
 */
interface PresetGaugeHotRange {
  start: number
  end: number
}

interface AlertPresetControlProps {
  metric: AlertPresetMetric
  level: AlertPresetLevel
  onLevelChange: (level: AlertPresetLevel) => void
  /** Live telemetry value; when supplied the gauge overlays a moving needle + readout. */
  liveValue?: SharedValue<number | null>
  /** Board Top Speed (km/h) — resolves speed thresholds and the speed gauge full-scale. */
  boardTopSpeedKmh?: number | null
  /** Metrics whose preset follows the board's own configuration. */
  matchBoardConfig?: Partial<Record<AlertPresetMetric, boolean>>
  onMatchBoardConfigChange?: (enabled: boolean) => void
  /** The board's decoded configs, for resolving what a matched preset lands on right now. */
  configBases?: BoardConfigBases
  /** History hot-range gradient for the gauge arc (kept in sync with the detail gauge). */
  hotRange?: PresetGaugeHotRange | null
  /** Blocks slider interaction and dims it (e.g. battery without a valid config). */
  disabled?: boolean
  /** Exact visible rules to evaluate while the synthetic needle sweeps the gauge. */
  ruleSnapshot: AlertTestRule[]
  /** Detail-screen Alerts heading, placed directly below the gauge. */
  controlsHeader?: ReactNode
  /** Take ownership of this level's rules. Omitted where custom rules aren't offered (the gauge
   * preview in board settings), which also hides the action button. */
  onCustomize?: () => void
  /** Give the metric back to the presets. Only reachable while `level` is `custom`. */
  onDiscardCustom?: () => void
}

export function AlertPresetControl({
  metric,
  level,
  onLevelChange,
  liveValue,
  boardTopSpeedKmh,
  matchBoardConfig,
  onMatchBoardConfigChange,
  configBases,
  hotRange,
  disabled,
  ruleSnapshot,
  controlsHeader,
  onCustomize,
  onDiscardCustom,
}: AlertPresetControlProps) {
  const units = useUnitSystem()
  const { formatSpeedWithUnit } = useFormat()
  const { describeRules } = useAlertPresetFormat()
  const gauge = useMemo(
    () =>
      metric === 'speed'
        ? {
            ...PRESET_GAUGE.speed,
            unit: speedUnit(units),
            formatMarker: (value: number) => formatSpeedWithUnit(value, 1),
          }
        : PRESET_GAUGE[metric],
    [metric, units, formatSpeedWithUnit],
  )
  const max =
    metric === 'speed' && boardTopSpeedKmh && boardTopSpeedKmh > 0
      ? boardTopSpeedKmh
      : gauge.defaultMax

  const alerts = useMemo<DualGaugeAlert[]>(
    () =>
      ruleSnapshot.map((rule) => ({
        id: rule.id,
        threshold: rule.threshold,
        thresholdMax: rule.thresholdMax,
        repeats: rule.repeatEverySeconds != null,
        label: gauge.formatMarker(rule.threshold),
        labelMax: rule.thresholdMax == null ? undefined : gauge.formatMarker(rule.thresholdMax),
      })),
    [ruleSnapshot, gauge],
  )

  // Without a live value the gauge rests at zero, so the readout is always there.
  const placeholder = useSharedValue<number | null>(0)

  const isCustom = level === 'custom'
  const editAction = isCustom ? onDiscardCustom : onCustomize
  const alertTest = useAlertTest({
    rules: ruleSnapshot,
    min: gauge.min,
    max,
    alertAbove: metric !== 'battery',
    lingerNearMax: metric === 'speed' || metric === 'duty',
    slowForMessages: metric === 'motor-temp' || metric === 'controller-temp',
  })
  const gaugeValue = alertTest.running ? alertTest.value : liveValue
  // Says what this level actually sounds like — the ramp is otherwise learned by riding it.
  const description = isCustom
    ? 'Your own rules — edit them below.'
    : ruleSnapshot.length === 0
      ? level === 'off'
        ? 'No sound from this metric.'
        : null
      : describeRules(metric, ruleSnapshot)

  return (
    <View style={styles.container}>
      <SingleGauge
        displayScale={metric === 'speed' ? speedFromKmh(1, units) : 1}
        value={gaugeValue ?? placeholder}
        min={gauge.min}
        max={max}
        unit={gauge.unit}
        decimals={gauge.decimals}
        alerts={alerts}
        hotRange={hotRange}
        containerStyle={styles.gauge}
      />
      {/* The test drives the alerts, so it sits with the Alerts heading rather than the gauge. */}
      <View style={styles.headerRow}>
        {controlsHeader}
        <Button
          label={alertTest.running ? 'Stop' : 'Preview'}
          icon={alertTest.running ? IconPlayerStop : IconVolume}
          variant="outline"
          disabled={disabled || !alertTest.canRun}
          onPress={alertTest.running ? alertTest.stop : alertTest.start}
          testID={`alert-test-${metric}`}
          style={styles.testButton}
        />
      </View>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {supportsBoardConfigMatch(metric) && !isCustom ? (
        <BoardConfigMatchControl
          metric={metric}
          checked={matchBoardConfig?.[metric] === true}
          configBases={configBases}
          onChange={onMatchBoardConfigChange}
        />
      ) : null}
      <View style={styles.levelRow}>
        {isCustom ? (
          <CustomLabel />
        ) : (
          <LevelSlider metric={metric} value={level} onChange={onLevelChange} disabled={disabled} />
        )}
        {editAction && !disabled ? (
          <Button
            icon={isCustom ? IconTrash : IconPencil}
            variant="outline"
            color={isCustom ? theme.status.error.text : undefined}
            accessibilityLabel={isCustom ? 'Discard custom alerts' : 'Edit alerts'}
            onPress={editAction}
          />
        ) : null}
      </View>
    </View>
  )
}

/**
 * Per-metric wording for the match note. The board's setting has a different name on every metric,
 * and "follows the board" alone does not tell a rider *which* number moved.
 */
const MATCH_SUBJECT: Partial<Record<AlertPresetMetric, string>> = {
  duty: 'duty pushback',
  'motor-temp': 'motor temperature limiting',
  'controller-temp': 'controller temperature limiting',
}

/**
 * Opt one metric's preset into following the board's own configuration. The note underneath states
 * the number being followed, because that is the whole promise of the checkbox.
 *
 * Where the board has no such number the checkbox is not offered as a choice at all — it is
 * disabled and the note says why. Ticking it would only produce a preset that stays silent, and a
 * board with duty pushback at 100% has genuinely nothing to match.
 */
function BoardConfigMatchControl({
  metric,
  checked,
  configBases,
  onChange,
}: {
  metric: AlertPresetMetric
  checked: boolean
  configBases?: BoardConfigBases
  onChange?: (enabled: boolean) => void
}) {
  const fieldId = ALERT_PRESET_CONFIG_FIELDS[metric]
  const base =
    fieldId == null
      ? { status: 'missing' as const }
      : configRelativeBase(fieldId, configBases ?? {})
  const checkColor = useResolvedColor(theme.ui.primaryForeground)
  const subject = MATCH_SUBJECT[metric] ?? 'configuration'
  const format = PRESET_GAUGE[metric].formatMarker
  const available = base.status === 'resolved'
  // Ticking on needs an anchor; ticking off never does, or a rider who matched while connected
  // would be stuck with a dormant preset the moment the board goes away.
  const interactive = available || checked
  let note: string | null = null
  if (base.status === 'resolved') {
    note = checked ? `Follows VESC ${subject} (${format(base.value)}).` : null
  } else if (base.status === 'disabled') {
    note = `VESC ${subject} is off (${format(base.value)}) — there is nothing to match.`
  } else if (base.status === 'unread') {
    note = `Connect to the board to read its ${subject} setting first.`
  } else {
    note = `This board's firmware does not report a ${subject} setting.`
  }
  return (
    <View>
      <Pressable
        style={[styles.matchRow, !available && styles.matchRowDisabled]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled: !interactive }}
        disabled={!interactive}
        onPress={() => onChange?.(!checked)}
      >
        <View style={[styles.checkbox, checked && available && styles.checkboxChecked]}>
          {checked && available ? <IconCheck size={13} color={checkColor} strokeWidth={3} /> : null}
        </View>
        <Text style={styles.matchLabel}>Match VESC board configuration</Text>
      </Pressable>
      {note ? <Text style={styles.matchNote}>{note}</Text> : null}
    </View>
  )
}

/**
 * Stands in for the level slider once the rider owns the metric's rules — there is no level.
 * Deliberately flat and unfilled: it is a status label, and anything pill-shaped in this row
 * reads as a button the rider then taps to no effect.
 */
function CustomLabel() {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <View style={styles.customLabel}>
      <IconAdjustmentsHorizontal size={14} color={mutedColor} strokeWidth={2.5} />
      <Text style={styles.customLabelText}>Custom alerts</Text>
    </View>
  )
}

const LEVEL_OPTIONS: { id: AlertPresetLevel; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'normal', label: 'Normal' },
  { id: 'safe', label: 'Safe' },
]

interface LevelSliderProps {
  metric: AlertPresetMetric
  value: AlertPresetLevel
  onChange: (level: AlertPresetLevel) => void
  disabled?: boolean
}

/** Text segmented control: the active level inverts to the primary pair, like the kit's icon one. */
function LevelSlider({ metric, value, onChange, disabled }: LevelSliderProps) {
  return (
    <View style={[styles.slider, disabled && styles.sliderDisabled]}>
      {LEVEL_OPTIONS.map((option) => {
        const active = option.id === value
        return (
          <Pressable
            key={option.id}
            testID={`alert-level-${metric}-${option.id}`}
            style={[styles.sliderSegment, active && styles.sliderSegmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled }}
            accessibilityLabel={active ? `${option.label}, selected` : option.label}
            disabled={disabled}
            onPress={() => onChange(option.id)}
          >
            <Text
              style={[styles.sliderLabel, active && styles.sliderLabelActive]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  gauge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 34 },
  matchRowDisabled: { opacity: 0.45 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.ui.primary,
    borderColor: theme.ui.primary,
  },
  matchLabel: { color: theme.ui.foreground, fontSize: 14, fontWeight: '500' },
  matchNote: { color: theme.ui.mutedForeground, fontSize: 12, lineHeight: 17, marginLeft: 28 },
  testButton: {
    flexShrink: 0,
  },
  customLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
  },
  customLabelText: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  slider: {
    flex: 1,
    flexDirection: 'row',
    padding: 3,
    gap: 2,
    borderRadius: theme.radius.md + 3,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  sliderDisabled: {
    opacity: 0.45,
  },
  sliderSegment: {
    flex: 1,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  sliderSegmentActive: {
    backgroundColor: theme.ui.primary,
  },
  sliderLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  sliderLabelActive: {
    color: theme.ui.primaryForeground,
  },
})
