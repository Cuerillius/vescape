import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconPlayerPauseFilled from '@tabler/icons-react-native/IconPlayerPauseFilled'
import IconPlayerRecord from '@tabler/icons-react-native/IconPlayerRecord'
import IconPlayerRecordFilled from '@tabler/icons-react-native/IconPlayerRecordFilled'

import { Pulse } from '@/components/controls/RaisedActionButton'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { RecordingState } from '@/modules/board/lib/boardConnection'

const SIZE = 32
const RING_PADDING = 3
const RING_BOX_SIZE = SIZE + RING_PADDING * 2
const ICON_SIZE = 18
const HIT_SLOP = 6

interface RecordBadgeProps {
  /** `undefined` once the ride was ended while the board stayed linked. */
  recordingState: RecordingState | undefined
  /** Fired once the rider confirms ending the ride. */
  onEndRide?: () => void
  /** Manually starts a new ride after one was ended; recording otherwise auto-starts on connect. */
  onStartRecording?: () => void
}

/**
 * The ride's face on the connect button: a small disc pinned to its corner. Recording pulses a red
 * dot, paused shows a pause glyph (pause and resume are automatic), and tapping either asks to end
 * the ride — a confirmation, since a thumb on the badge is easy to land by accident. Once ended, a
 * hollow record dot offers an explicit tap to start the next ride.
 */
export function RecordBadge({ recordingState, onEndRide, onStartRecording }: RecordBadgeProps) {
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const errorColor = useResolvedColor(theme.status.error.color)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const foregroundColor = useResolvedColor(theme.ui.foreground)

  if (!recordingState && !onStartRecording) return null

  const recording = recordingState === 'recording'
  const paused = recordingState === 'paused'
  const accessibilityLabel = recordingState
    ? `${recording ? 'Recording' : 'Recording paused'}. End the ride.`
    : 'Start recording'

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={HIT_SLOP}
        onPress={recordingState ? () => setConfirmingEnd(true) : onStartRecording}
        style={({ pressed }) => [styles.ringWrapper, pressed && styles.pressed]}
        testID="main-tab-record"
      >
        <View style={styles.ring}>
          <View style={[styles.disc, recording && { borderColor: errorColor }]}>
            {recording ? (
              <Pulse>
                <IconPlayerRecordFilled size={ICON_SIZE} color={errorColor} />
              </Pulse>
            ) : paused ? (
              <IconPlayerPauseFilled size={ICON_SIZE} color={mutedColor} />
            ) : (
              <IconPlayerRecord size={ICON_SIZE} color={foregroundColor} strokeWidth={2} />
            )}
          </View>
        </View>
      </Pressable>
      <ConfirmModal
        visible={confirmingEnd}
        title="End ride?"
        message="This stops the recording and saves the ride to your history. Your board stays connected."
        confirmLabel="End ride"
        destructive
        onConfirm={() => {
          setConfirmingEnd(false)
          onEndRide?.()
        }}
        onCancel={() => setConfirmingEnd(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  ringWrapper: {
    width: RING_BOX_SIZE,
    height: RING_BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    // A ring of page background separates the badge from the disc beneath it.
    padding: RING_PADDING,
    borderRadius: RING_BOX_SIZE / 2,
    backgroundColor: theme.ui.background,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.card,
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
})
