import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import type { TuneProfile } from 'vescape-core'

import { Placeholder } from '@/components/base/Placeholder'
import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { InfoModal } from '@/components/modals/InfoModal'
import { interaction, theme } from '@/constants/theme'
import { errorMessage } from '@/helpers/error'
import { useResolvedColor } from '@/hooks/useTheme'
import { useFirmwareCommandsReady } from '@/modules/board/hooks/useFirmwareCommandsReady'
import { tuneProfileIconComponent } from '@/modules/tune/components/tuneProfileMetadata'
import { useBoardTuneProfiles } from '@/modules/tune/hooks/useBoardTuneProfiles'
import { useCreateTune } from '@/modules/tune/hooks/useCreateTune'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { routes } from '@/navigation/routes'

/**
 * The active board's saved tunes. Tapping one selects it and opens its editor; "New tune" saves
 * what the board runs now as a new tune and opens that. Order is creation order.
 */
export function TuneListScreen() {
  const { boardId, compatibility, loaded, profiles, activeProfile } = useBoardTuneProfiles()
  const loadProfiles = useTuneProfileStore((state) => state.loadProfiles)
  const setActiveProfile = useTuneProfileStore((state) => state.setActiveProfile)
  const commandsReady = useFirmwareCommandsReady()
  const { create, creating } = useCreateTune(profiles.map((profile) => profile.name))
  // The message outlives `visible` so the modal's exit animation does not blank it.
  const [notice, setNotice] = useState({ message: '', visible: false })

  useEffect(() => {
    // intentional-suppression: the editor screen renders the store's load error
    if (boardId) void loadProfiles(boardId, compatibility).catch(() => undefined)
  }, [boardId, compatibility, loadProfiles])

  const edit = (profileId: string) => {
    if (profileId !== activeProfile?.id) setActiveProfile(profileId)
    router.push(routes.tuneEdit)
  }

  const createAndEdit = async () => {
    try {
      await create()
      router.push(routes.tuneEdit)
    } catch (error) {
      setNotice({ message: errorMessage(error, 'Could not create the tune.'), visible: true })
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {boardId == null ? (
        <Placeholder
          icon={IconAdjustmentsHorizontal}
          title="No board selected"
          description="Select a board to see its tunes"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {loaded && profiles.length === 0 ? (
            <Placeholder
              icon={IconAdjustmentsHorizontal}
              title="No tunes yet"
              description="Connect to your board and save its current values as your first tune"
            />
          ) : (
            <Card>
              {profiles.map((profile, index) => (
                <View key={profile.id}>
                  {index > 0 ? <Separator /> : null}
                  <TuneRow profile={profile} onPress={() => edit(profile.id)} />
                </View>
              ))}
            </Card>
          )}

          <Button
            label="New tune"
            icon={IconPlus}
            variant="primary"
            onPress={() => void createAndEdit()}
            disabled={!commandsReady || creating || !loaded}
            testID="tune-new"
          />
          {!commandsReady ? (
            <Text style={styles.hint}>Connect to your board to create a tune from its values.</Text>
          ) : null}
        </ScrollView>
      )}

      <InfoModal
        visible={notice.visible}
        title="Tune not created"
        message={notice.message}
        variant="danger"
        dismissLabel="Close"
        onDismiss={() => setNotice((current) => ({ ...current, visible: false }))}
      />
    </SafeAreaView>
  )
}

function TuneRow({ profile, onPress }: { profile: TuneProfile; onPress: () => void }) {
  const ProfileIcon = tuneProfileIconComponent(profile.icon)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={profile.name}
      onPress={onPress}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      testID={`tune-row-${profile.id}`}
    >
      <ProfileIcon size={22} color={mutedColor} />
      <Text style={styles.rowLabel} numberOfLines={1}>
        {profile.name}
      </Text>
      <IconChevronRight size={18} color={mutedColor} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  rowPressed: {
    backgroundColor: theme.ui.muted,
  },
  rowLabel: {
    flexShrink: 1,
    flexGrow: 1,
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    textAlign: 'center',
  },
})
