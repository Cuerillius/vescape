import { useCallback, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, type ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import IconBluetooth from '@tabler/icons-react-native/IconBluetooth'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconRefresh from '@tabler/icons-react-native/IconRefresh'
import { useShallow } from 'zustand/react/shallow'

import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { BoardLinkTimeline } from '@/modules/board/components/BoardLinkTimeline'
import {
  WizardFooterButtons,
  WizardStepLayout,
} from '@/modules/board/components/add-board-wizard/WizardStepLayout'
import { useBoardLink } from '@/modules/board/hooks/useBoardLink'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { routes } from '@/navigation/routes'

const LINK_STEP_ROW_HEIGHT = 44

/** Links an existing board, laid out like the add-board wizard's pairing step. */
export default function BoardLinkScreen() {
  const {
    boardId,
    bleId: routeBleId,
    bleName,
  } = useLocalSearchParams<{
    boardId: string
    bleId?: string
    bleName?: string
  }>()
  const { board, updateBoard } = useBoardStore(
    useShallow((s) => ({
      board: s.boards.find((b) => b.id === boardId),
      updateBoard: s.updateBoard,
    })),
  )

  // The peripheral to link: a freshly-scanned device, else the board's existing
  // link (re-link). The existing link is left intact until a new one is saved —
  // a cancelled or failed re-link must not destroy a working link.
  const [bleId] = useState(() => routeBleId ?? board?.link?.bleId ?? null)
  const existingLink = board?.link ?? null

  const link = useBoardLink(bleId, boardId)
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const handleActiveStepIndexChange = useCallback((index: number) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: index < 0 ? 0 : Math.max(0, index * LINK_STEP_ROW_HEIGHT - LINK_STEP_ROW_HEIGHT),
        animated: true,
      })
    })
  }, [])

  // Pure persist: config was already acquired as the last step of the linking run.
  const handleSave = async () => {
    if (!board || !link.selectedLink) return
    setSaving(true)
    try {
      await updateBoard({ ...board, link: link.selectedLink })
      router.back()
    } catch (err) {
      console.log('[board-link] save failed', err)
    } finally {
      setSaving(false)
    }
  }

  const scanNewDevice = () => {
    router.push({ pathname: routes.addBoardScan, params: { boardId } })
  }

  const deviceLabel = board?.name?.trim() || bleName || bleId || 'Board'
  const failed = link.phase === 'failed'

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <View style={styles.content}>
          <WizardStepLayout
            title={deviceLabel}
            description="Linking your board over Bluetooth"
            scrollRef={scrollRef}
            headerRight={
              failed ? (
                <Button
                  label="Scan new device"
                  variant="outline"
                  icon={IconBluetooth}
                  onPress={scanNewDevice}
                  testID="board-link-choose-another"
                />
              ) : undefined
            }
            footer={
              <WizardFooterButtons
                onBack={() => router.back()}
                onForward={failed ? link.retry : handleSave}
                forwardLabel={failed ? 'Retry' : 'Save link'}
                forwardIcon={failed ? IconRefresh : IconCheck}
                forwardDisabled={
                  !failed &&
                  (link.phase !== 'picking' ||
                    link.selectedLink == null ||
                    link.isFinalizing ||
                    saving)
                }
                backTestID="board-link-back"
                forwardTestID={failed ? 'board-link-retry' : 'board-link-save'}
              />
            }
          >
            {bleId != null ? (
              <BoardLinkTimeline
                phase={link.phase}
                progress={link.progress}
                candidates={link.candidates}
                selected={link.selected}
                onSelect={link.select}
                bleId={bleId}
                fill
                testIDPrefix="board-link"
                failureNote={
                  existingLink ? 'Existing link kept — your board still works' : undefined
                }
                onActiveStepIndexChange={handleActiveStepIndexChange}
              />
            ) : null}
          </WizardStepLayout>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
})
