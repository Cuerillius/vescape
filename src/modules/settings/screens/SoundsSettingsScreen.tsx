import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import type { ScrollView as ScrollViewType } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconDeviceSpeaker from '@tabler/icons-react-native/IconDeviceSpeaker'
import IconPaperclip from '@tabler/icons-react-native/IconPaperclip'
import IconPencil from '@tabler/icons-react-native/IconPencil'
import IconPlayerPlay from '@tabler/icons-react-native/IconPlayerPlay'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import IconTrash from '@tabler/icons-react-native/IconTrash'
import IconVolume from '@tabler/icons-react-native/IconVolume'
import IconX from '@tabler/icons-react-native/IconX'
import {
  createAppSoundPack,
  customAppSoundPacks,
  deleteAppSoundPack,
  importAppSound,
  playAppSound,
  removeAppSound,
  renameAppSoundPack,
  type CustomAppSoundPack,
} from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { SelectMenu } from '@/components/ui/SelectMenu'
import { Switch } from '@/components/ui/Switch'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import {
  SettingsDescription,
  SettingsGroup,
  SettingsLink,
} from '@/modules/settings/components/SettingsGroup'
import { APP_SOUND_CUES } from '@/modules/settings/lib/appSounds'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'

const PACKS = [
  { id: 'retro', name: 'Retro' },
  { id: 'simple', name: 'Classic' },
] as const

const NEW_PACK_NAME = 'Unnamed'

const AUDIO_OUTPUT_OPTIONS = [
  { label: 'Alarm', value: 'alarm' },
  { label: 'Media', value: 'media' },
] as const

export default function SoundsSettingsScreen() {
  const soundPack = useSettingsStore((state) => state.soundPack)
  const audioSource = useSettingsStore((state) => state.audioSource)
  const enabled = useSettingsStore((state) => state.connectionSoundsEnabled)
  const set = useSettingsStore((state) => state.set)
  const [customPacks, setCustomPacks] = useState<CustomAppSoundPack[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPackId, setNewPackId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [packLoadError, setPackLoadError] = useState(false)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const foregroundColor = useResolvedColor(theme.ui.foreground)
  const scrollRef = useRef<ScrollViewType>(null)
  const newPackRef = useRef<View | null>(null)
  const revealNewPack = () => {
    requestAnimationFrame(() => {
      newPackRef.current?.measureInWindow((_x, y, _w, h) => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 16 - 60), animated: true })
      })
    })
  }
  useFocusEffect(
    useCallback(() => {
      void customAppSoundPacks()
        .then((packs) => {
          setCustomPacks(packs)
          setPackLoadError(false)
        })
        .catch(() => setPackLoadError(true))
    }, []),
  )
  const refresh = async () => setCustomPacks(await customAppSoundPacks())
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await action()
      await refresh()
    } catch (error) {
      Alert.alert(
        'Sound pack',
        error instanceof Error ? error.message : 'Could not save sound pack',
      )
    } finally {
      setBusy(false)
    }
  }
  const pick = (id: string, cue: (typeof APP_SOUND_CUES)[number]['id']) => {
    void run(async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/wav', 'audio/x-wav'],
        copyToCacheDirectory: true,
      })
      if (result.canceled) return
      const uri = result.assets[0]?.uri
      if (!uri) throw new Error('No audio file selected')
      await importAppSound(id, cue, uri)
    })
  }
  const addPack = () => {
    void run(async () => {
      const packs = await createAppSoundPack(NEW_PACK_NAME)
      setCustomPacks(packs)
      const created = packs[packs.length - 1]
      if (created) {
        void set('soundPack', created.id)
        setNewPackId(created.id)
        setEditingId(created.id)
        setName('')
        revealNewPack()
      }
    })
  }
  const commitName = (id: string, currentName: string) => {
    if (editingId !== id) return
    setEditingId(null)
    const trimmed = name.trim()
    const isNew = id === newPackId
    if (isNew) setNewPackId(null)
    if (!trimmed && !isNew) return
    if (trimmed === currentName) return
    void run(async () => {
      await renameAppSoundPack(id, isNew ? trimmed || NEW_PACK_NAME : trimmed)
    })
  }
  const packs: { id: string; name: string; sounds?: CustomAppSoundPack['sounds'] }[] = [
    ...PACKS,
    ...customPacks,
  ]

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <SettingsDescription>Choose and preview a sound pack.</SettingsDescription>
        <SettingsGroup title="Playback">
          <SettingsLink
            icon={IconVolume}
            label="App sounds"
            hint="Connection and ride cues"
            right={
              <Switch
                accessibilityLabel="App sounds"
                value={enabled}
                onValueChange={(value) => void set('connectionSoundsEnabled', value)}
              />
            }
          />
          {Platform.OS === 'android' ? (
            <SettingsLink
              icon={IconDeviceSpeaker}
              label="Audio output"
              hint="Which volume the cues follow"
              right={
                <SelectMenu
                  options={AUDIO_OUTPUT_OPTIONS}
                  value={audioSource}
                  onChange={(source) => void set('audioSource', source)}
                  accessibilityLabel="Audio output"
                  testID="audio-output-select"
                />
              }
            />
          ) : null}
        </SettingsGroup>
        {Platform.OS === 'android' ? (
          <Text style={styles.sourceDescription}>
            Alarm is recommended. Make sure alarm volume isn't muted. If it causes problems, choose
            Media, which uses media volume.
          </Text>
        ) : null}

        {packLoadError ? (
          <Text style={styles.sourceDescription}>
            Sound packs could not be loaded. Try opening this screen again.
          </Text>
        ) : null}
        <View style={!enabled && styles.disabledPacks} pointerEvents={enabled ? 'auto' : 'none'}>
          <SettingsGroup title="Sound packs">
            {packs.map((pack) => {
              const active = soundPack === pack.id
              const custom = pack.sounds !== undefined
              const editingName = editingId === pack.id
              return (
                <View key={pack.id} ref={pack.id === newPackId ? newPackRef : undefined}>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active, disabled: !enabled }}
                    accessibilityLabel={pack.name}
                    android_ripple={interaction.ripple}
                    onPress={() => void set('soundPack', pack.id)}
                    style={({ pressed }) => [styles.packHeader, pressed && styles.pressed]}
                  >
                    <IconVolume size={20} color={mutedColor} />
                    {editingName ? (
                      <Input
                        value={name}
                        onChangeText={setName}
                        maxLength={60}
                        placeholder={pack.id === newPackId ? '' : pack.name}
                        style={styles.nameInput}
                        autoFocus
                        onBlur={() => commitName(pack.id, pack.name)}
                        onSubmitEditing={() => commitName(pack.id, pack.name)}
                      />
                    ) : (
                      <Text style={styles.packName}>{pack.name}</Text>
                    )}
                    {custom && !editingName ? (
                      <Button
                        icon={IconPencil}
                        variant="ghost"
                        accessibilityLabel={`Rename ${pack.name}`}
                        disabled={!active}
                        onPress={() => {
                          setName(pack.name)
                          setEditingId(pack.id)
                        }}
                      />
                    ) : null}
                    {editingName ? (
                      <Button
                        label="Save"
                        variant="primary"
                        disabled={busy || !name.trim()}
                        onPress={() => commitName(pack.id, pack.name)}
                      />
                    ) : active ? (
                      <IconCheck size={20} color={foregroundColor} />
                    ) : null}
                  </Pressable>
                  {active && !custom ? (
                    <View style={styles.previewStrip}>
                      {APP_SOUND_CUES.map((cue) => (
                        <Button
                          key={cue.id}
                          icon={IconPlayerPlay}
                          label={cue.label}
                          accessibilityLabel={`Play ${cue.label}`}
                          onPress={() => playAppSound(pack.id, cue.id)}
                        />
                      ))}
                    </View>
                  ) : null}
                  {active && custom ? (
                    <View style={styles.editor}>
                      {APP_SOUND_CUES.map((cue) => (
                        <View key={cue.id} style={styles.cueRow}>
                          <Text style={styles.cueName}>{cue.label}</Text>
                          {pack.sounds?.[cue.id] ? (
                            <>
                              <Button
                                icon={IconPlayerPlay}
                                accessibilityLabel={`Play ${cue.label}`}
                                onPress={() => playAppSound(pack.id, cue.id)}
                              />
                              <Button
                                icon={IconX}
                                accessibilityLabel={`Remove ${cue.label} sound`}
                                disabled={busy}
                                onPress={() => void run(() => removeAppSound(pack.id, cue.id))}
                              />
                            </>
                          ) : (
                            <Button
                              icon={IconPaperclip}
                              accessibilityLabel={`Add ${cue.label} sound`}
                              disabled={busy}
                              onPress={() => pick(pack.id, cue.id)}
                            />
                          )}
                        </View>
                      ))}
                      <View style={styles.editorFooter}>
                        <Button
                          label="Delete pack"
                          icon={IconTrash}
                          color={theme.status.error.color}
                          onPress={() => setDeleteId(pack.id)}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              )
            })}
            <SettingsLink
              icon={IconPlus}
              label="Add sound pack"
              onPress={busy ? undefined : addPack}
              testID="add-sound-pack"
            />
          </SettingsGroup>
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={deleteId !== null}
        title="Delete sound pack"
        message="Delete this pack and its imported sounds?"
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        onDismiss={() => setDeleteId(null)}
        onConfirm={() => {
          const id = deleteId
          setDeleteId(null)
          if (id)
            void run(async () => {
              await deleteAppSoundPack(id)
              if (soundPack === id) await useSettingsStore.getState().load()
            })
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  sourceDescription: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
    marginTop: -16,
    marginHorizontal: 4,
  },
  disabledPacks: { opacity: 0.5 },
  packHeader: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  packName: { flex: 1, fontSize: 15, color: theme.ui.foreground, fontWeight: '600' },
  nameInput: { flex: 1, height: 40 },
  previewStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  editor: { paddingHorizontal: 16, paddingBottom: 14, gap: 4 },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  cueName: { flex: 1, color: theme.ui.foreground, fontSize: 14, fontWeight: '500' },
  editorFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  pressed: { backgroundColor: theme.ui.muted },
})
