import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useState, type ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Text } from '@/components/base/Text'
import type { Icon } from '@tabler/icons-react-native'

import { theme, type ThemeColor } from '@/constants/theme'

/**
 * State of one timeline step. Drives the glyph colour, connector colour, and
 * whether the step shows a spinner (`active`) or dims its text (`pending`/`absent`).
 */
export type StepState = 'done' | 'active' | 'pending' | 'failed' | 'absent'

export interface TimelineStep {
  /** Stable React key. */
  key: string
  icon: Icon
  label: string
  /** Optional subline — e.g. what the step is doing, or its result. */
  caption?: string
  /** Optional block under the caption — e.g. an inline picker or warning. */
  content?: ReactNode
  state: StepState
}

interface Props {
  steps: TimelineStep[]
  style?: StyleProp<ViewStyle>
  testID?: string
  /** Stretch the rows over the parent's height and scale glyphs and text to fit. */
  fill?: boolean
}

const DEFAULT_GLYPH = 32
const MIN_GLYPH = 28
const MAX_GLYPH = 56

/**
 * A vertical checklist of steps connected by a rail. Each step is an outlined
 * glyph whose colour carries its state; the connector below a `done` step turns
 * green. Purely presentational — the caller owns the step list and updates states
 * as work progresses. Generic: no knowledge of what the steps represent.
 */
export function StepTimeline({ steps, style, testID, fill }: Props) {
  const [height, setHeight] = useState(0)
  const glyphSize =
    fill && height > 0
      ? Math.min(MAX_GLYPH, Math.max(MIN_GLYPH, Math.floor((height / steps.length) * 0.7)))
      : DEFAULT_GLYPH
  return (
    <View
      style={[styles.timeline, fill && styles.timelineFill, style]}
      testID={testID}
      onLayout={fill ? (event) => setHeight(event.nativeEvent.layout.height) : undefined}
    >
      {steps.map((step, i) => (
        <StepRow
          key={step.key}
          step={step}
          isLast={i === steps.length - 1}
          glyphSize={glyphSize}
          fill={fill}
          connectorDone={step.state === 'done'}
        />
      ))}
    </View>
  )
}

function StepRow({
  step,
  isLast,
  connectorDone,
  glyphSize,
  fill,
}: {
  step: TimelineStep
  isLast: boolean
  connectorDone: boolean
  glyphSize: number
  fill?: boolean
}) {
  const dim = step.state === 'pending' || step.state === 'absent'
  const labelSize = Math.round(Math.min(18, Math.max(14, glyphSize * 0.4)))
  return (
    <View style={[styles.row, fill && styles.rowFill]}>
      <View style={[styles.glyphCol, { width: glyphSize }]}>
        <StepGlyph icon={step.icon} state={step.state} size={glyphSize} />
        {isLast ? null : (
          <View
            style={[
              styles.connector,
              {
                backgroundColor: connectorDone ? theme.palette.green.color : theme.ui.border,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.rowText}>
        <View style={[styles.rowHeading, { minHeight: glyphSize }]}>
          <Text
            style={[styles.rowLabel, { fontSize: labelSize }, dim && styles.rowLabelDim]}
            numberOfLines={1}
          >
            {step.label}
          </Text>
          {step.caption ? (
            <Text
              style={[
                styles.rowCaption,
                { fontSize: labelSize - 2 },
                step.state === 'failed' && styles.rowCaptionError,
              ]}
              numberOfLines={1}
            >
              {step.caption}
            </Text>
          ) : null}
        </View>
        {step.content ? <View style={styles.rowContent}>{step.content}</View> : null}
      </View>
    </View>
  )
}

/** Compact thin-bordered outline circle — state lives in the border + icon colour, never a fill. */
function StepGlyph({
  icon: StepIcon,
  state,
  size,
}: {
  icon: Icon
  state: StepState
  size: number
}) {
  const color = GLYPH_COLOR[state]
  return (
    <View
      style={[
        styles.glyph,
        { borderColor: color, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {state === 'active' ? (
        <ActivityIndicator size="small" color={theme.ui.foreground} />
      ) : (
        <StepIcon size={Math.round(size * 0.5)} color={color} />
      )}
    </View>
  )
}

const GLYPH_COLOR: Record<StepState, ThemeColor> = {
  done: theme.palette.green.color,
  active: theme.ui.foreground,
  failed: theme.status.error.color,
  pending: theme.ui.faintForeground,
  absent: theme.ui.faintForeground,
}

const styles = StyleSheet.create({
  timeline: {
    alignSelf: 'stretch',
  },
  timelineFill: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  rowFill: {
    flexGrow: 1,
  },
  glyphCol: {
    alignItems: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 6,
    marginVertical: 2,
    borderRadius: 1,
  },
  glyph: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowHeading: {
    justifyContent: 'center',
    gap: 2,
  },
  rowLabel: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
  rowLabelDim: {
    color: theme.ui.mutedForeground,
  },
  rowCaption: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  rowCaptionError: {
    color: theme.status.error.text,
  },
  rowContent: {
    marginTop: 6,
    marginBottom: 8,
  },
})
