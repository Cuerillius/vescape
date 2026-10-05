import { StyleSheet, View } from 'react-native'
import {
  clearAllBoardWarnings,
  devInjectBoardWarning,
  devReportCleanBoardWarning,
} from 'vescape-core'
import { useCallback } from 'react'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { EMPTY_WARNINGS, useBoardWarningsStore } from '@/modules/board/store/boardWarningsStore'
import { ProbeHint, ProbeSection, probeStyles } from '@/screens/showcase/other/ProbeSection'

/** Fake kind used by the dev warning injector; real detector kinds land in later slices. */
const DEV_WARNING_KIND = 'cell-spread'
/** Board id used when no board is selected, so the pipe is demoable without a saved board. */
const DEV_WARNING_BOARD_ID = 'dev-board'

/** Fires warnings through the native registry and mirrors what the store received back. */
export function BoardWarningProbe() {
  const warningBoardId = useBoardStore((s) => s.activeBoardId) ?? DEV_WARNING_BOARD_ID
  const boardWarnings = useBoardWarningsStore(
    (s) => s.warningsByBoard[warningBoardId] ?? EMPTY_WARNINGS,
  )

  const injectWarning = useCallback(
    (severity: 'warn' | 'critical') => {
      const payload = JSON.stringify({
        peakSpread: severity === 'critical' ? 0.27 : 0.12,
        worstGroup: 4,
        injectedAt: Date.now(),
      })
      void devInjectBoardWarning(warningBoardId, DEV_WARNING_KIND, severity, payload)
    },
    [warningBoardId],
  )

  const reportClean = useCallback(() => {
    void devReportCleanBoardWarning(warningBoardId, DEV_WARNING_KIND)
  }, [warningBoardId])

  const clearWarnings = useCallback(() => {
    void clearAllBoardWarnings(warningBoardId)
  }, [warningBoardId])

  return (
    <ProbeSection title="Board warnings">
      <ProbeHint>
        Injects a fake warning through the native registry (fire → persist → emit). Target board:{' '}
        {warningBoardId}
      </ProbeHint>
      <View style={probeStyles.row}>
        <Button
          label="Inject warn"
          color={theme.status.warning.color}
          style={probeStyles.fill}
          onPress={() => injectWarning('warn')}
        />
        <Button
          label="Inject critical"
          color={theme.status.error.color}
          style={probeStyles.fill}
          onPress={() => injectWarning('critical')}
        />
      </View>
      <View style={probeStyles.row}>
        <Button label="Report clean" style={probeStyles.fill} onPress={reportClean} />
        <Button label="Clear all" style={probeStyles.fill} onPress={clearWarnings} />
      </View>
      {boardWarnings.length === 0 ? (
        <Text style={styles.empty}>No warnings (mirror store empty)</Text>
      ) : (
        boardWarnings.map((warning) => (
          <View key={warning.kind} style={styles.warning}>
            <Text style={styles.kind}>
              {warning.kind} · {warning.severity}
            </Text>
            <Text style={styles.payload} numberOfLines={1}>
              {warning.payloadJson}
            </Text>
          </View>
        ))
      )}
    </ProbeSection>
  )
}

const styles = StyleSheet.create({
  empty: {
    color: theme.ui.faintForeground,
    fontSize: 13,
  },
  warning: {
    gap: 2,
  },
  kind: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  payload: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontFamily: 'monospace',
  },
})
