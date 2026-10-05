import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconBell from '@tabler/icons-react-native/IconBell'
import IconBattery3 from '@tabler/icons-react-native/IconBattery3'
import IconCpu from '@tabler/icons-react-native/IconCpu'
import IconPlugConnected from '@tabler/icons-react-native/IconPlugConnected'
import IconScale from '@tabler/icons-react-native/IconScale'

import { Text } from '@/components/base/Text'
import { Card, CardDescription } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { theme } from '@/constants/theme'
import { BoardIssueDrawers } from '@/modules/board/components/BoardIssueDrawers'
import { BoardLinkSheet } from '@/modules/board/components/BoardLinkSheet'
import { useBoardIssues } from '@/modules/board/hooks/useBoardIssues'
import { summarizeBatteryConfig } from '@/modules/board/lib/boardSetup'
import { formatBoardTransport } from '@/modules/board/lib/boardTransport'
import type { Board } from '@/modules/board/store/boardStore'
import { LegalLimitCountrySheet } from '@/modules/legal/components/LegalLimitCountrySheet'
import { legalPolicyFromReference } from '@/modules/legal/lib/legalMode'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { useAlertsStore } from '@/modules/alerts/store/alertsStore'
import { boardAlertPresetSelection } from '@/modules/alerts/lib/boardAlertSettings'
import { activeAlertCount } from '@/modules/alerts/lib/alertSummary'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { routes } from '@/navigation/routes'
import { NavRow } from '@/screens/main/board/NavRow'
import { BoardWarningsNavRow } from '@/screens/main/board/BoardWarningsNavRow'
import { VescFaultsNavRow } from '@/screens/main/board/VescFaultsNavRow'

/**
 * The Board tab while a board is connected: the board itself, not the ride. Its setup with the
 * current values, its link, accessories and what is wrong with it. Live readouts and the quick
 * controls stay on Home. Other boards are not offered here. Legal limits opens the country's drawer; only an unresolved jurisdiction
 * sends the rider to the legal map to pick one.
 */
export function BoardDetails({
  board,
  onOpenLegalLimits,
}: {
  board: Board
  onOpenLegalLimits: () => void
}) {
  const activeProfile = useTuneProfileStore((s) => s.activeProfile)
  const legalPolicyReference = useSettingsStore((s) => s.legalPolicy)
  const legalPolicy = useMemo(
    () => legalPolicyFromReference(legalPolicyReference),
    [legalPolicyReference],
  )
  const alertRules = useAlertsStore((s) => s.rules)
  const activeAlerts = activeAlertCount(boardAlertPresetSelection(board), alertRules)
  const batterySummary = summarizeBatteryConfig(board.batteryConfig)
  const issues = useBoardIssues(board.id, board.id)
  const [warningsOpen, setWarningsOpen] = useState(false)
  const [faultsOpen, setFaultsOpen] = useState(false)
  const [legalSheetOpen, setLegalSheetOpen] = useState(false)
  const [linkSheetOpen, setLinkSheetOpen] = useState(false)
  const showHealth = issues.warningsEnabled || issues.faultsEnabled

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} testID="board-dashboard-name">
          {board.name}
        </Text>
      </View>

      <View style={styles.section}>
        <CardDescription>Board</CardDescription>
        <Card>
          <NavRow
            icon={IconAdjustmentsHorizontal}
            label="Tune"
            value={activeProfile?.boardId === board.id ? activeProfile.name : undefined}
            onPress={() => router.push(routes.tune)}
            testID="board-tune-row"
          />
          <Separator />
          <NavRow
            icon={IconBattery3}
            label="Battery"
            value={board.batteryConfig ? batterySummary.value : 'Not set'}
            onPress={() => router.push(routes.controlBatteryCells)}
            testID="board-battery-row"
          />
          <Separator />
          <NavRow
            icon={IconPlugConnected}
            label="Accessories"
            onPress={() => router.push(routes.accessories)}
            testID="board-accessories-row"
          />
          <Separator />
          <NavRow
            icon={IconCpu}
            label="Board link"
            value={
              board.link?.vescFirmwareVersion ?? formatBoardTransport(board.link?.transport ?? null)
            }
            onPress={() => setLinkSheetOpen(true)}
            testID="board-link-row"
          />
        </Card>
      </View>

      <View style={styles.section}>
        <CardDescription>Alerts & limits</CardDescription>
        <Card>
          <NavRow
            icon={IconBell}
            label="Alerts"
            value={activeAlerts > 0 ? `${activeAlerts} on` : 'Off'}
            onPress={() => router.push(routes.alerts)}
            testID="board-alerts-row"
          />
          <Separator />
          <NavRow
            icon={IconScale}
            label="Legal limits"
            value={legalPolicy?.name ?? 'Unresolved'}
            onPress={() => (legalPolicy ? setLegalSheetOpen(true) : onOpenLegalLimits())}
            testID="board-legal-row"
          />
        </Card>
      </View>

      {showHealth ? (
        <View style={styles.section}>
          <CardDescription>Health</CardDescription>
          <Card>
            {issues.warningsEnabled ? (
              <BoardWarningsNavRow
                count={issues.warningCount}
                severity={issues.severity}
                hasDismissed={issues.warnings.length > 0}
                onPress={() => setWarningsOpen(true)}
              />
            ) : null}
            {issues.warningsEnabled && issues.faultsEnabled ? <Separator /> : null}
            {issues.faultsEnabled ? (
              <VescFaultsNavRow count={issues.faultCount} onPress={() => setFaultsOpen(true)} />
            ) : null}
          </Card>
        </View>
      ) : null}

      <LegalLimitCountrySheet
        country={legalSheetOpen ? legalPolicy : null}
        onClose={() => setLegalSheetOpen(false)}
      />

      <BoardLinkSheet
        board={linkSheetOpen ? board : null}
        onClose={() => setLinkSheetOpen(false)}
        onRelink={(linked) => {
          setLinkSheetOpen(false)
          router.push({ pathname: routes.editBoardLink, params: { boardId: linked.id } })
        }}
      />

      <BoardIssueDrawers
        issues={issues}
        activeBoardId={board.id}
        sessionBoardId={board.id}
        warningsOpen={warningsOpen}
        faultsOpen={faultsOpen}
        onCloseWarnings={() => setWarningsOpen(false)}
        onCloseFaults={() => setFaultsOpen(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  section: {
    gap: 8,
  },
})
