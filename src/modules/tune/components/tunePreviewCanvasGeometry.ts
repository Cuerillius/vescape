'worklet'
import { Skia } from '@shopify/react-native-skia'

import {
  MAX_PITCH_INPUT_DEGREES,
  MAX_PITCH_INPUT_RATE_DEGREES_PER_SECOND,
} from '@/modules/tune/lib/tunePreview'
import {
  GROUND_TICK_SPACING_METERS,
  TUNE_PREVIEW_PIXELS_PER_METER,
  TUNE_PREVIEW_WHEEL_RADIUS_PIXELS,
} from '@/modules/tune/lib/tunePreviewGeometry'

export const GROUND_Y = 112
export const WHEEL_RADIUS = TUNE_PREVIEW_WHEEL_RADIUS_PIXELS
export const DECK_HALF_LENGTH = 72
export const DECK_CENTER_Y = GROUND_Y - WHEEL_RADIUS
export const ZERO_MARKER_GAP = 6
export const GROUND_TICK_SPACING = GROUND_TICK_SPACING_METERS * TUNE_PREVIEW_PIXELS_PER_METER
export const FOOTPAD_OFFSET = 46
const INPUT_ARROW_IDLE_GAP = 62
const INPUT_ARROW_TRAVEL = 18
const INPUT_ARROW_HEAD = 6
const INPUT_ARROW_CHEVRON_GAP = 6
export const CANVAS_HEIGHT = 168
export const READOUT_FONT_SIZE = 14
export const READOUT_BASELINE = 15
export const READOUT_HEIGHT = 20
export const READOUT_VALUE_WIDTH = 72
export const SPEED_FONT_SIZE = 22
export const SCENE_LABEL_FONT_SIZE = 11

export function formatSignedDegrees(value: number): string {
  'worklet'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}°`
}

export function pitchInputArrow(
  angleDegrees: number,
  pitchInputDegreesValue: number,
  centerX: number,
  footpadOffset: number,
) {
  'worklet'
  const normalized =
    Math.min(MAX_PITCH_INPUT_DEGREES, Math.max(-MAX_PITCH_INPUT_DEGREES, pitchInputDegreesValue)) /
    MAX_PITCH_INPUT_DEGREES
  const magnitude = Math.abs(normalized)
  const rate =
    Math.sign(normalized) * (1 - (1 - magnitude) ** 2) * MAX_PITCH_INPUT_RATE_DEGREES_PER_SECOND
  const sideRate = footpadOffset < 0 ? Math.max(-rate, 0) : Math.max(rate, 0)
  const progress = Math.min(1, Math.max(0, sideRate / MAX_PITCH_INPUT_RATE_DEGREES_PER_SECOND))
  const radians = (angleDegrees * Math.PI) / 180
  const footpadX = centerX + Math.cos(radians) * footpadOffset
  const footpadY = DECK_CENTER_Y + Math.sin(radians) * footpadOffset
  const arrowTop = footpadY - INPUT_ARROW_IDLE_GAP + INPUT_ARROW_TRAVEL * progress
  const opacity = progress <= 0 ? 0 : 0.18 + progress * 0.82

  // Two stacked chevrons pointing down at the footpad.
  const path = Skia.Path.Make()
  for (let index = 0; index < 2; index += 1) {
    const tipY = arrowTop + INPUT_ARROW_CHEVRON_GAP * index + INPUT_ARROW_HEAD
    path.moveTo(footpadX - INPUT_ARROW_HEAD, tipY - INPUT_ARROW_HEAD)
    path.lineTo(footpadX, tipY)
    path.lineTo(footpadX + INPUT_ARROW_HEAD, tipY - INPUT_ARROW_HEAD)
  }
  return { path, opacity }
}
