import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck'
import { readVescFaultLog, setVescFaultDismissed, type VescFaultOccurrence } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { VescFaultRow } from '@/modules/board/components/VescFaultRow'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { useVescFaultsStore } from '@/modules/board/store/vescFaultsStore'

interface VescFaultsViewProps {
  /** VESC Fault Occurrences for this Board, newest first. */
  faults: VescFaultOccurrence[]
  onSetDismissed: (id: string, dismissed: boolean) => void
  /** Raw controller terminal output; null until read. */
  faultLog: string | null
  faultLogError: string | null
  readingFaultLog: boolean
  /** A dismissal or fault-mirror failure to show above the log. */
  error: string | null
}

/** The faults drawer's content, free of native reads so the showcase can drive it with mock data. */
export function VescFaultsView({
  faults,
  onSetDismissed,
  faultLog,
  faultLogError,
  readingFaultLog,
  error,
}: VescFaultsViewProps) {
  const okColor = useResolvedColor(theme.status.success.color)
  const orange = useResolvedColor(theme.status.warning.color)
  const open = faults.filter((fault) => !fault.dismissed)
  const live = open.filter((fault) => fault.clearedAtMs == null).length
  return (
    <View style={styles.list}>
      {open.length > 0 ? (
        <View
          style={[
            styles.banner,
            { borderColor: orange, backgroundColor: theme.alpha(orange, 0.3) },
          ]}
        >
          <Text style={[styles.bannerCount, { color: theme.status.warning.text }]}>
            {open.length}
          </Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {open.length === 1 ? 'Fault needs attention' : 'Faults need attention'}
            </Text>
            <Text style={styles.bannerHint}>
              {live > 0
                ? `${live} still active. Dismiss one once you have dealt with it.`
                : 'All cleared by the controller. Dismiss them once you have looked.'}
            </Text>
          </View>
        </View>
      ) : null}

      {faults.length === 0 ? (
        <Card style={styles.empty}>
          <IconCircleCheck size={22} color={okColor} />
          <View style={styles.emptyText}>
            <CardTitle>No faults</CardTitle>
            <CardDescription>No live faults recorded by Vescape.</CardDescription>
          </View>
        </Card>
      ) : (
        <View style={styles.faults}>
          {faults.map((fault) => (
            <VescFaultRow key={fault.id} fault={fault} onSetDismissed={onSetDismissed} />
          ))}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card style={styles.log}>
        <View style={styles.logHeader}>
          <View style={styles.logCopy}>
            <CardTitle>Controller fault log</CardTitle>
            <CardDescription>
              Read when opened. Board must be connected and stopped.
            </CardDescription>
          </View>
          {readingFaultLog ? <ActivityIndicator color={orange} /> : null}
        </View>
        {faultLogError ? <Text style={styles.error}>{faultLogError}</Text> : null}
        {faultLog != null ? (
          <View style={styles.logOutput}>
            <Text style={styles.logText}>{faultLog.trim() || '(no output)'}</Text>
          </View>
        ) : null}
      </Card>
    </View>
  )
}

interface VescFaultsSheetProps {
  boardId: string
  visible: boolean
  /** VESC Fault Occurrences for this Board, newest first. */
  faults: VescFaultOccurrence[]
}

/**
 * VESC Fault sheet for the selected Board: the controller's own evidence, one row per activation,
 * dismissed per occurrence in native storage. Deliberately separate from the Board Warnings sheet —
 * app-authored warnings and controller faults are different subsystems with different dismissal
 * models, and blurring them hides which one produced a finding.
 *
 * Dismissed occurrences stay listed here even though they do not light the indicator. Raw VESC
 * terminal output is fetched once per drawer opening and never becomes an occurrence.
 */
export function VescFaultsSheet({ boardId, faults, visible }: VescFaultsSheetProps) {
  const [faultLog, setFaultLog] = useState<string | null>(null)
  const [faultLogError, setFaultLogError] = useState<string | null>(null)
  const [readingFaultLog, setReadingFaultLog] = useState(false)
  const [dismissError, setDismissError] = useState<string | null>(null)
  const readError = useVescFaultsStore((state) => state.error)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setReadingFaultLog(true)
    setFaultLog(null)
    setFaultLogError(null)
    void readVescFaultLog(boardId)
      .then((output) => {
        if (!cancelled) setFaultLog(output)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFaultLogError(
            error instanceof Error ? error.message : 'Could not read controller fault log',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setReadingFaultLog(false)
      })
    return () => {
      cancelled = true
    }
  }, [boardId, visible])

  return (
    <VescFaultsView
      faults={faults}
      onSetDismissed={(id, value) => {
        setDismissError(null)
        void setVescFaultDismissed(id, value).catch(() => {
          setDismissError('Fault dismissal could not be saved.')
        })
      }}
      faultLog={faultLog}
      faultLogError={faultLogError}
      readingFaultLog={readingFaultLog}
      error={dismissError ?? readError}
    />
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
  },
  bannerCount: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    color: theme.ui.foreground,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bannerHint: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  list: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  faults: {
    gap: 10,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  emptyText: {
    flex: 1,
    gap: 2,
  },
  log: {
    padding: 14,
    gap: 10,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logCopy: {
    flex: 1,
    gap: 2,
  },
  logOutput: {
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.ui.muted,
  },
  logText: {
    color: theme.ui.foreground,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  error: {
    color: theme.status.error.text,
    fontSize: 12,
  },
})
