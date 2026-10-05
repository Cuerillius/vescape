import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck'
import type { BoardWarning } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { BoardWarningRow } from '@/modules/board/components/BoardWarningRow'
import { severityStatus } from '@/modules/board/constants/boardWarnings'
import { worstSeverity } from '@/modules/board/lib/boardWarnings'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { useBoardWarningsStore } from '@/modules/board/store/boardWarningsStore'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface BoardWarningsSheetProps {
  boardId: string
  warnings: BoardWarning[]
}

/**
 * Warnings sheet for the selected Board. Active warnings list first, dismissed (acknowledged) ones
 * grayed below — dismissing never deletes from the native registry, it only persists the kind on the
 * board record, so the row stays visible here while the board warning indicator ignores it.
 */
export function BoardWarningsSheet({ boardId, warnings }: BoardWarningsSheetProps) {
  const [mutationError, setMutationError] = useState<string | null>(null)
  const readError = useBoardWarningsStore((state) => state.error)
  const dismissedKinds = useBoardStore(
    (s) => s.boards.find((b) => b.id === boardId)?.dismissedWarnings ?? EMPTY_KINDS,
  )
  const okColor = useResolvedColor(theme.status.success.color)
  const setWarningDismissed = useBoardStore((s) => s.setWarningDismissed)
  const dismissAllWarnings = useBoardStore((s) => s.dismissAllWarnings)

  const active = warnings.filter((w) => !dismissedKinds.includes(w.kind))
  const dismissed = warnings.filter((w) => dismissedKinds.includes(w.kind))
  const accent = severityStatus(worstSeverity(active) ?? 'warn')
  const accentColor = useResolvedColor(accent.color)

  return (
    <View style={styles.list}>
      {active.length > 0 ? (
        <View
          style={[
            styles.banner,
            { borderColor: accentColor, backgroundColor: theme.alpha(accentColor, 0.3) },
          ]}
        >
          <Text style={[styles.bannerCount, { color: accent.text }]}>{active.length}</Text>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {active.length === 1 ? 'Warning needs attention' : 'Warnings need attention'}
            </Text>
            <Text style={styles.bannerHint}>Dismiss one once you have dealt with it.</Text>
          </View>
        </View>
      ) : null}

      {warnings.length === 0 ? (
        <Card style={styles.empty}>
          <IconCircleCheck size={22} color={okColor} />
          <View style={styles.emptyText}>
            <CardTitle>{readError ? 'Warnings unavailable' : 'No warnings'}</CardTitle>
            <CardDescription>{readError ?? 'This board is clean.'}</CardDescription>
          </View>
        </Card>
      ) : null}
      {[...active, ...dismissed].map((warning) => (
        <BoardWarningRow
          key={warning.kind}
          warning={warning}
          dismissed={dismissedKinds.includes(warning.kind)}
          onSetDismissed={(kind, value) => {
            setMutationError(null)
            void setWarningDismissed(boardId, kind, value).catch(() => {
              setMutationError('Warning dismissal could not be saved.')
            })
          }}
        />
      ))}
      {active.length > 1 && (
        <Button
          label="Dismiss all"
          variant="outline"
          onPress={() => {
            setMutationError(null)
            void dismissAllWarnings(
              boardId,
              active.map((w) => w.kind),
            ).catch(() => setMutationError('Warning dismissals could not be saved.'))
          }}
        />
      )}
      {mutationError || (warnings.length > 0 && readError) ? (
        <Text style={styles.error}>{mutationError ?? readError}</Text>
      ) : null}
    </View>
  )
}

/** Stable empty array so the selector doesn't churn references for boards with nothing dismissed. */
const EMPTY_KINDS: string[] = []

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
  error: {
    color: theme.status.error.text,
    fontSize: 12,
  },
})
