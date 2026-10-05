import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconEye from '@tabler/icons-react-native/IconEye'
import IconEyeOff from '@tabler/icons-react-native/IconEyeOff'
import type { VescFaultOccurrence } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { VescFaultCaptureSection } from '@/modules/board/components/VescFaultCaptureSection'
import { useVescFaultCapture } from '@/modules/board/hooks/useVescFaultCapture'
import { faultTitle } from '@/modules/board/lib/vescFaults'
import { fmtTimeAgo } from '@/helpers/format'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface VescFaultRowProps {
  fault: VescFaultOccurrence
  /** Toggle the occurrence-level dismissal. Never deletes the occurrence. */
  onSetDismissed: (id: string, dismissed: boolean) => void
}

/**
 * One row in the VESC Faults group: what the controller reported, when it happened, and whether it
 * is still active. Distinct from `BoardWarningRow` on purpose — a fault is the controller's own
 * evidence, not an app-authored finding, and it is dismissed per occurrence rather than per kind.
 *
 * An undismissed fault is loud: an orange card with an orange icon tile, the live one filled
 * stronger. A dismissed fault drops back to a neutral, dimmed card.
 *
 * Expanding the row pulls the occurrence's VESC Fault Capture — the decoded Board samples retained
 * before detection — on demand, keeping samples out of the always-on fault mirror.
 */
export function VescFaultRow({ fault, onSetDismissed }: VescFaultRowProps) {
  const [expanded, setExpanded] = useState(false)
  const dismissed = fault.dismissed
  const active = fault.clearedAtMs == null
  const loud = !dismissed
  const title = faultTitle(fault.code)
  const { capture, loading, error } = useVescFaultCapture(fault.id, expanded)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const orange = useResolvedColor(theme.status.warning.color)
  const orangeBg = useResolvedColor(theme.status.warning.bg)

  return (
    <View
      style={[
        styles.card,
        loud && {
          borderColor: orange,
          backgroundColor: active ? theme.alpha(orange, 0.12) : orangeBg,
        },
        dismissed && styles.cardDismissed,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.tile,
            { backgroundColor: loud ? theme.alpha(orange, active ? 0.3 : 0.12) : theme.ui.muted },
          ]}
        >
          <IconAlertTriangle size={24} color={loud ? orange : mutedColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.chips}>
            <Badge label={`Code ${fault.code}`} />
            {active && loud ? <Badge label="Active now" color={theme.status.warning.text} /> : null}
            {dismissed ? <Badge label="Dismissed" variant="outline" /> : null}
          </View>
        </View>
        <Button
          variant="ghost"
          icon={dismissed ? IconEye : IconEyeOff}
          onPress={() => onSetDismissed(fault.id, !dismissed)}
          accessibilityLabel={`${dismissed ? 'Restore' : 'Dismiss'} ${title}`}
        />
      </View>

      <Text style={styles.detected}>
        {`Occurred ${fmtTimeAgo(fault.occurredAtMs)}`}
        {fault.clearedAtMs != null ? ` · cleared ${fmtTimeAgo(fault.clearedAtMs)}` : ''}
      </Text>

      <Pressable
        style={styles.expand}
        onPress={() => setExpanded((prev) => !prev)}
        android_ripple={interaction.ripple}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Hide' : 'Show'} telemetry capture for ${title}`}
      >
        <Text style={styles.expandLabel}>{expanded ? 'Hide capture' : 'Telemetry capture'}</Text>
        <IconChevronDown
          size={16}
          color={mutedColor}
          style={expanded ? styles.caretOpen : undefined}
        />
      </Pressable>

      {expanded && error ? <Text style={styles.error}>{error}</Text> : null}
      {expanded && !error ? <VescFaultCaptureSection capture={capture} loading={loading} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.ui.card,
    borderColor: theme.ui.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  cardDismissed: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detected: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  error: {
    color: theme.status.error.text,
    fontSize: 12,
  },
  expand: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },
  expandLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  caretOpen: {
    transform: [{ rotate: '180deg' }],
  },
})
