import { useLayoutEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import IconBattery from '@tabler/icons-react-native/IconBattery'
import IconCpu from '@tabler/icons-react-native/IconCpu'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconTrash from '@tabler/icons-react-native/IconTrash'
import { useShallow } from 'zustand/react/shallow'

import { Text } from '@/components/base/Text'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { TextPromptModal } from '@/components/modals/TextPromptModal'
import { SettingsSectionTitle } from '@/components/settings/SettingsSectionTitle'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { RawValuesButton } from '@/components/ui/RawValuesButton'
import { Separator } from '@/components/ui/Separator'
import { theme } from '@/constants/theme'
import { BoardTopSpeedCard } from '@/modules/alerts/components/BoardTopSpeedCard'
import { boardTopSpeedKmh } from '@/modules/alerts/lib/boardAlertSettings'
import { BoardBatteryEditor } from '@/modules/board/components/BoardBatteryEditor'
import { BoardIssueDrawers } from '@/modules/board/components/BoardIssueDrawers'
import { BoardLinkSheet } from '@/modules/board/components/BoardLinkSheet'
import { useBoardBatteryForm } from '@/modules/board/hooks/useBoardBatteryForm'
import { useBoardIssues } from '@/modules/board/hooks/useBoardIssues'
import { useEditBoardForm } from '@/modules/board/hooks/useEditBoardForm'
import { formatBoardTransport } from '@/modules/board/lib/boardTransport'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { routes } from '@/navigation/routes'
import { BoardWarningsNavRow } from '@/screens/main/board/BoardWarningsNavRow'
import { NavRow } from '@/screens/main/board/NavRow'
import { VescFaultsNavRow } from '@/screens/main/board/VescFaultsNavRow'

export default function EditBoardScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>()
  const { boards, updateBoard, removeBoard } = useBoardStore(
    useShallow((s) => ({
      boards: s.boards,
      updateBoard: s.updateBoard,
      removeBoard: s.removeBoard,
    })),
  )
  const navigation = useNavigation()
  const editingBoard = boards.find((b) => b.id === boardId)
  const issues = useBoardIssues(boardId, boardId)
  const [warningsOpen, setWarningsOpen] = useState(false)
  const [faultsOpen, setFaultsOpen] = useState(false)
  const [linkSheetOpen, setLinkSheetOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState(false)
  const [removeSaving, setRemoveSaving] = useState(false)
  const form = useEditBoardForm({
    board: editingBoard,
    updateBoard,
  })

  const batteryForm = useBoardBatteryForm({ board: editingBoard, updateBoard })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <RawValuesButton
          onPress={() => router.push({ pathname: routes.editBoardConfig, params: { boardId } })}
          accessibilityLabel="Board config"
          testID="edit-board-config-button"
        />
      ),
    })
  }, [navigation, boardId])

  if (!editingBoard) return null

  const handleRemoveBoard = async () => {
    setRemoveSaving(true)
    try {
      await removeBoard(editingBoard.id)
      setRemoveConfirmVisible(false)
      router.dismissAll()
    } finally {
      setRemoveSaving(false)
    }
  }

  // Linked boards re-probe their existing peripheral; unlinked ones scan for a device first.
  const handleLink = () => {
    setLinkSheetOpen(false)
    router.push({
      pathname: editingBoard.link ? routes.editBoardLink : routes.addBoardScan,
      params: { boardId },
    })
  }

  const showHealth = issues.warningsEnabled || issues.faultsEnabled

  return (
    <View style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1} testID="edit-board-name">
              {form.name.trim() || 'Unnamed board'}
            </Text>
            <Button
              icon={IconPencil}
              variant="ghost"
              accessibilityLabel="Rename board"
              onPress={() => setRenameOpen(true)}
              testID="edit-board-name-edit"
            />
          </View>

          <View style={styles.section}>
            <SettingsSectionTitle>Board top speed</SettingsSectionTitle>
            <BoardTopSpeedCard
              value={boardTopSpeedKmh(editingBoard)}
              onChange={(kmh) => {
                void updateBoard({ ...editingBoard, topSpeedKmh: kmh })
              }}
            />
          </View>

          <Accordion
            defaultOpenKey=""
            items={[
              {
                key: 'battery-config',
                title: 'Battery configuration',
                summary: batteryForm.keepMissingBatteryConfig
                  ? 'Not configured'
                  : batteryForm.batterySummary.value,
                icon: IconBattery,
                testID: 'battery-config-row',
                content: (
                  <BoardBatteryEditor
                    key={editingBoard.id}
                    value={batteryForm.battery}
                    saving={batteryForm.saving}
                    onSave={batteryForm.saveBattery}
                  />
                ),
              },
            ]}
          />

          <Card>
            <NavRow
              icon={IconCpu}
              label="Board link"
              value={
                editingBoard.link
                  ? (editingBoard.link.vescFirmwareVersion ??
                    formatBoardTransport(editingBoard.link.transport))
                  : 'Not linked'
              }
              onPress={() => setLinkSheetOpen(true)}
              testID="edit-board-link-row"
            />
          </Card>

          {showHealth ? (
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
          ) : null}

          <Button
            icon={IconTrash}
            label="Remove board"
            color={theme.status.error.text}
            onPress={() => setRemoveConfirmVisible(true)}
            style={styles.remove}
            testID="edit-board-remove-button"
          />
        </ScrollView>
      </SafeAreaView>

      <BoardLinkSheet
        board={linkSheetOpen ? editingBoard : null}
        onClose={() => setLinkSheetOpen(false)}
        onRelink={handleLink}
      />

      <BoardIssueDrawers
        issues={issues}
        activeBoardId={editingBoard.id}
        sessionBoardId={editingBoard.id}
        warningsOpen={warningsOpen}
        faultsOpen={faultsOpen}
        onCloseWarnings={() => setWarningsOpen(false)}
        onCloseFaults={() => setFaultsOpen(false)}
      />

      <TextPromptModal
        visible={renameOpen}
        title="Rename board"
        placeholder="Board name"
        initialValue={form.name}
        confirmLabel="Save"
        loading={form.saving}
        onConfirm={(value) => {
          void form.saveName(value).then(() => setRenameOpen(false))
        }}
        onDismiss={() => setRenameOpen(false)}
      />

      <ConfirmModal
        visible={removeConfirmVisible}
        title="Remove board"
        message={`Remove "${editingBoard.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        destructive
        loading={removeSaving}
        onConfirm={handleRemoveBoard}
        onCancel={() => setRemoveConfirmVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
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
  remove: {
    marginTop: 8,
  },
})
