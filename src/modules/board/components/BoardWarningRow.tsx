import { StyleSheet, View } from 'react-native'
import IconEngine from '@tabler/icons-react-native/IconEngine'
import IconEye from '@tabler/icons-react-native/IconEye'
import IconEyeOff from '@tabler/icons-react-native/IconEyeOff'
import type { BoardWarning } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SEVERITY_LABEL, severityStatus } from '@/modules/board/constants/boardWarnings'
import {
  parseWarningDetail,
  warningDescription,
  warningTitle,
} from '@/modules/board/lib/boardWarnings'
import { fmtTimeAgo } from '@/helpers/format'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface BoardWarningRowProps {
  warning: BoardWarning
  /** Rider acknowledged this warning: grayed out here, excluded from the board warning indicator. */
  dismissed: boolean
  /** Toggle the dismissed (acknowledged) state, persisted on the board record. */
  onSetDismissed: (kind: string, dismissed: boolean) => void
}

/**
 * One row in the Board Warnings sheet: title, severity badge, description, first/last detected, and
 * payload-driven detail. Passive display only — no sounds or vibration. Data comes from the JS mirror
 * store; dismissing never touches the native warning registry, only the board's dismissed list.
 *
 * Styled like `VescFaultRow`: an undismissed warning is a loud card in its severity color with an
 * icon tile; a dismissed one drops back to a neutral, dimmed card.
 */
export function BoardWarningRow({ warning, dismissed, onSetDismissed }: BoardWarningRowProps) {
  const status = severityStatus(warning.severity)
  const loud = !dismissed
  const title = warningTitle(warning.kind)
  const description = warningDescription(warning.kind)
  const detail = parseWarningDetail(warning.kind, warning.payloadJson)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const accent = useResolvedColor(status.color)
  const accentBg = useResolvedColor(status.bg)

  return (
    <View
      style={[
        styles.card,
        loud && { borderColor: accent, backgroundColor: accentBg },
        dismissed && styles.cardDismissed,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.tile,
            { backgroundColor: loud ? theme.alpha(accent, 0.3) : theme.ui.muted },
          ]}
        >
          <IconEngine size={24} color={loud ? accent : mutedColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.chips}>
            {loud ? (
              <Badge label={SEVERITY_LABEL[warning.severity]} color={status.text} />
            ) : (
              <Badge label="Dismissed" variant="outline" />
            )}
          </View>
        </View>
        <Button
          variant="ghost"
          icon={dismissed ? IconEye : IconEyeOff}
          onPress={() => onSetDismissed(warning.kind, !dismissed)}
          accessibilityLabel={`${dismissed ? 'Restore' : 'Dismiss'} ${title}`}
        />
      </View>

      {description != null && <Text style={styles.description}>{description}</Text>}

      <Text style={styles.detected}>
        First {fmtTimeAgo(warning.firstDetectedAtMs)} · Last {fmtTimeAgo(warning.lastDetectedAtMs)}
      </Text>

      {detail.length > 0 && (
        <View style={styles.detail}>
          {detail.map((entry) => (
            <View key={entry.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{entry.label}</Text>
              <Text style={styles.detailValue}>{entry.value}</Text>
            </View>
          ))}
        </View>
      )}
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
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
  },
  detected: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  detail: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    flexShrink: 1,
  },
  detailValue: {
    color: theme.ui.foreground,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
})
