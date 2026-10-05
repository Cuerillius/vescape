import { useIsFocused, useNavigation, useRouter } from 'expo-router'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import IconCopy from '@tabler/icons-react-native/IconCopy'
import IconCopyPlus from '@tabler/icons-react-native/IconCopyPlus'
import IconDotsVertical from '@tabler/icons-react-native/IconDotsVertical'
import IconDownload from '@tabler/icons-react-native/IconDownload'
import IconHistory from '@tabler/icons-react-native/IconHistory'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconSettings2 from '@tabler/icons-react-native/IconSettings2'
import IconTrash from '@tabler/icons-react-native/IconTrash'

import { Text } from '@/components/base/Text'
import { Button as FlatButton } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { ActionsDrawer, type DrawerAction } from '@/components/ui/ActionsDrawer'
import { TuneGroupGrid } from '@/modules/tune/components/TuneGroupGrid'
import { TunePreviewSection } from '@/modules/tune/components/TunePreviewSection'
import { TuneSyncBar } from '@/modules/tune/components/TuneSyncBar'
import { useTuneModals } from '@/modules/tune/hooks/useTuneModals'
import { useTuneScreenData } from '@/modules/tune/hooks/useTuneScreenData'
import { reportTuneCompatibilityIssue } from '@/modules/tune/lib/tuneCompatibilityReporting'
import { BasicSliderItemCell, TuneFieldCell } from '@/modules/tune/screens/TuneFieldCells'
import { TuneModalHost } from '@/modules/tune/screens/TuneModalHost'
import { TuneScreenStates } from '@/modules/tune/screens/TuneScreenStates'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { routes } from '@/navigation/routes'
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle'
import IconAlertCircleFilled from '@tabler/icons-react-native/IconAlertCircleFilled'

/** How long the actions drawer takes to slide away; a modal opened sooner would be dropped. */
const DRAWER_CLOSE_SETTLE_MS = 220

/** Edits the active Tune Profile: basic sliders, advanced field groups, and the sync bar. */
export function TuneScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const isFocused = useIsFocused()
  const {
    activeProfile,
    allBoards,
    basicSliders,
    boardSnapshot,
    boardsLoaded,
    displayGroups,
    draftFields,
    firmwareCommandsTrusted,
    firmwareCommandBlockReason,
    loadOffline,
    loadOnline,
    profileError,
    profileFields,
    profileState,
    retryBoardSnapshot,
    schemaMismatchFields,
    selectedBoardId,
    syncBarState,
    tuneCompatibilityIssue,
  } = useTuneScreenData()
  const reportedCompatibilityIssue = useRef<string | null>(null)
  // Advanced swaps the basic sliders for every field, grouped. It starts off each time the tune opens.
  const [advanced, setAdvanced] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const acceptAllBoardValues = useTuneProfileStore((s) => s.acceptAllBoardValues)
  const saveActiveProfile = useTuneProfileStore((s) => s.saveActiveProfile)
  const duplicateProfile = useTuneProfileStore((s) => s.duplicateProfile)
  const syncToBoard = useTuneProfileStore((s) => s.syncToBoard)

  const modals = useTuneModals(activeProfile, basicSliders, draftFields, allBoards, selectedBoardId)

  useEffect(() => {
    if (!tuneCompatibilityIssue || !boardSnapshot) return
    const reportKey = [selectedBoardId, boardSnapshot.refloatVersion, boardSnapshot.fwVersion].join(
      ':',
    )
    if (reportedCompatibilityIssue.current === reportKey) return
    reportedCompatibilityIssue.current = reportKey
    reportTuneCompatibilityIssue(tuneCompatibilityIssue, boardSnapshot)
  }, [boardSnapshot, selectedBoardId, tuneCompatibilityIssue])

  const openHistory = useCallback(() => {
    router.push(routes.tuneHistory)
  }, [router])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: activeProfile?.name ?? 'Tune',
      headerRight: activeProfile
        ? () => (
            <FlatButton
              variant="ghost"
              icon={IconDotsVertical}
              accessibilityLabel="Tune actions"
              onPress={() => setActionsOpen(true)}
              testID="tune-actions"
            />
          )
        : undefined,
    })
  }, [activeProfile, navigation])

  // A modal opened while the drawer is still sliding away would be dropped, so those wait for it.
  const afterDrawer = (action: () => void) => () => {
    setActionsOpen(false)
    setTimeout(action, DRAWER_CLOSE_SETTLE_MS)
  }
  const actions: DrawerAction[] = activeProfile
    ? [
        {
          id: 'advanced',
          label: 'Advanced tuning',
          icon: IconSettings2,
          checked: advanced,
          onPress: () => {
            setAdvanced((current) => !current)
          },
        },
        ...(syncBarState?.variant === 'sync_with_board'
          ? [
              {
                id: 'pull',
                label: 'Pull from board',
                icon: IconDownload,
                onPress: () => {
                  setActionsOpen(false)
                  acceptBoard(acceptAllBoardValues)
                },
              },
            ]
          : []),
        {
          id: 'history',
          label: 'History',
          icon: IconHistory,
          onPress: () => {
            setActionsOpen(false)
            openHistory()
          },
        },
        {
          id: 'duplicate',
          label: 'Duplicate tune',
          icon: IconCopyPlus,
          onPress: () => {
            setActionsOpen(false)
            // intentional-suppression: Tune store error is rendered by the active screen or modal
            void duplicateProfile(activeProfile.id).catch(() => undefined) // Store error renders in the banner.
          },
        },
        {
          id: 'edit',
          label: 'Edit name',
          icon: IconPencil,
          onPress: afterDrawer(() => modals.setMetadataModalProfile(activeProfile)),
        },
        ...(modals.otherBoards.length > 0
          ? [
              {
                id: 'copy',
                label: 'Copy to different board',
                icon: IconCopy,
                onPress: afterDrawer(() => modals.setCopySourceProfile(activeProfile)),
              },
            ]
          : []),
        {
          id: 'delete',
          label: 'Delete tune',
          icon: IconTrash,
          danger: true,
          onPress: afterDrawer(() => modals.setDeleteConfirmProfile(activeProfile)),
        },
      ]
    : []

  // Taking the board's value is an edit like any other, so it saves at once.
  const acceptBoard = (accept: () => void) => {
    accept()
    // intentional-suppression: Tune store error is rendered by the active screen or modal
    void saveActiveProfile().catch(() => undefined) // Store error renders in the banner below.
  }

  const retrySave = () => {
    // intentional-suppression: Tune store error is rendered by the active screen or modal
    void saveActiveProfile().catch(() => undefined) // Store error renders in the banner below.
  }

  const handleSync = () => {
    if (!firmwareCommandsTrusted) return
    // intentional-suppression: Tune store error is rendered by the active screen or modal
    void syncToBoard().catch(() => undefined) // Store error renders in the banner below.
  }

  const hasTuneView = activeProfile != null

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TuneScreenStates
        hasTuneView={hasTuneView}
        boardsLoaded={boardsLoaded}
        selectedBoardId={selectedBoardId}
        profileState={profileState}
        firmwareCommandBlockReason={firmwareCommandBlockReason}
        loadOnline={loadOnline}
        loadOffline={loadOffline}
      />

      <TunePreviewSection fields={profileFields ?? {}} active={isFocused} visible={hasTuneView}>
        {profileError ? (
          <View style={styles.errorBanner}>
            <IconAlertCircle size={16} color={theme.status.error.color} />
            <Text style={styles.errorBannerText}>{profileError}</Text>
          </View>
        ) : null}

        {schemaMismatchFields ? (
          <Pressable
            style={styles.schemaMismatchBar}
            onPress={() =>
              modals.showBadgeInfo(
                'Schema Mismatch',
                `Profile and board have different field sets.${
                  schemaMismatchFields.profileOnly.length > 0
                    ? `\n\nIn profile but not board: ${schemaMismatchFields.profileOnly.join(', ')}`
                    : ''
                }${
                  schemaMismatchFields.boardOnly.length > 0
                    ? `\n\nIn board but not profile: ${schemaMismatchFields.boardOnly.join(', ')}`
                    : ''
                }`,
              )
            }
          >
            <IconAlertCircleFilled size={16} color={theme.palette.yellow.color} />
            <View style={styles.schemaMismatchTextWrap}>
              <Text style={styles.schemaMismatchTitle}>Schema mismatch</Text>
              <Text style={styles.schemaMismatchText}>
                {schemaMismatchFields.profileOnly.length > 0
                  ? `${schemaMismatchFields.profileOnly.length} field${schemaMismatchFields.profileOnly.length === 1 ? '' : 's'} in profile not on board`
                  : ''}
                {schemaMismatchFields.profileOnly.length > 0 &&
                schemaMismatchFields.boardOnly.length > 0
                  ? ' · '
                  : ''}
                {schemaMismatchFields.boardOnly.length > 0
                  ? `${schemaMismatchFields.boardOnly.length} new field${schemaMismatchFields.boardOnly.length === 1 ? '' : 's'} on board`
                  : ''}
              </Text>
            </View>
          </Pressable>
        ) : null}

        {advanced ? (
          displayGroups.map((group) => (
            <TuneGroupGrid
              key={group.id}
              title={group.title}
              subtitle={`${group.fields.length} ${activeProfile ? 'profile' : 'read-only'} values`}
            >
              {group.fields.map((field) => (
                <TuneFieldCell key={field.id} field={field} onPress={modals.openFieldEditor} />
              ))}
            </TuneGroupGrid>
          ))
        ) : (
          <TuneGroupGrid title="Basic">
            {basicSliders.map((item) => (
              <BasicSliderItemCell
                key={item.id}
                item={item}
                editable={activeProfile != null}
                fullWidth={item.id === 'aggressiveness' || item.id === 'atrIntensity'}
                onPress={modals.openBasicSliderEditor}
              />
            ))}
          </TuneGroupGrid>
        )}
      </TunePreviewSection>

      {hasTuneView && !modals.editor ? (
        <TuneSyncBar
          state={syncBarState}
          onRetrySave={retrySave}
          onSync={handleSync}
          onRetryConfig={() => void retryBoardSnapshot()}
        />
      ) : null}
      <ActionsDrawer
        testIDPrefix="tune-action"
        visible={actionsOpen && activeProfile != null}
        title="Tune actions"
        actions={actions}
        onClose={() => setActionsOpen(false)}
      />
      <TuneModalHost modals={modals} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: theme.status.error.bg,
    borderColor: theme.status.error.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  errorBannerText: {
    color: theme.status.error.text,
    flex: 1,
  },
  schemaMismatchBar: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.palette.yellow.border,
    backgroundColor: theme.palette.yellow.bg,
    padding: 12,
  },
  schemaMismatchTextWrap: {
    flex: 1,
    gap: 2,
  },
  schemaMismatchTitle: {
    color: theme.palette.yellow.text,
    fontSize: 13,
    fontWeight: '900',
  },
  schemaMismatchText: {
    color: theme.palette.yellow.color,
    fontSize: 11,
    fontWeight: '700',
  },
})
