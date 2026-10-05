import { useCallback, useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import IconArrowBackUp from '@tabler/icons-react-native/IconArrowBackUp'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { TuneHistoryEntry, TuneProfileFieldValue } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'
import { DASH } from '@/helpers/format'
import { APP_TUNE_FIELD_BY_ID, formatTuneValue } from '@/modules/tune/lib/fields'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'

interface HistoryFieldDiff {
  fieldId: string
  label: string
  oldValue: string
  newValue: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatHistoryDate(ms: number): string {
  const d = new Date(ms)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${h}:${m}`
}

function diffHistoryEntries(
  newer: { fields: Record<string, TuneProfileFieldValue> },
  older: { fields: Record<string, TuneProfileFieldValue> },
): HistoryFieldDiff[] {
  const diffs: HistoryFieldDiff[] = []
  const allKeys = new Set([...Object.keys(newer.fields), ...Object.keys(older.fields)])
  for (const key of allKeys) {
    const nv = newer.fields[key]
    const ov = older.fields[key]
    if (nv === ov) continue
    if (typeof nv === 'number' && typeof ov === 'number' && Object.is(nv, ov)) continue
    const label = APP_TUNE_FIELD_BY_ID.get(key)?.label ?? key
    diffs.push({
      fieldId: key,
      label,
      oldValue:
        ov != null && ov !== '' ? String(typeof ov === 'number' ? formatTuneValue(ov) : ov) : DASH,
      newValue:
        nv != null && nv !== '' ? String(typeof nv === 'number' ? formatTuneValue(nv) : nv) : DASH,
    })
  }
  return diffs
}

export default function TuneHistoryScreen() {
  const router = useRouter()
  const activeProfile = useTuneProfileStore((s) => s.activeProfile)
  const loadHistory = useTuneProfileStore((s) => s.loadHistory)
  const rollbackToHistory = useTuneProfileStore((s) => s.rollbackToHistory)
  const currentFields = useTuneProfileStore((s) => s.activeProfile?.fields)
  const error = useTuneProfileStore((s) => s.error)

  const [entries, setEntries] = useState<TuneHistoryEntry[]>([])
  const [rollbackConfirmEntryId, setRollbackConfirmEntryId] = useState<number | null>(null)

  useEffect(() => {
    if (!activeProfile) return
    // intentional-suppression: Tune store error is rendered by the active screen or modal
    void loadHistory(activeProfile.id)
      .then(setEntries)
      .catch(() => undefined) // Store error renders in Tune.
  }, [activeProfile, loadHistory])

  const handleRestore = useCallback((entryId: number) => {
    setRollbackConfirmEntryId(entryId)
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {entries.length === 0 ? (
        <Text style={styles.empty}>No history entries yet.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          renderItem={({ item, index }) => {
            const newer =
              index === 0 && currentFields ? { fields: currentFields } : entries[index - 1]
            const diffs = newer ? diffHistoryEntries(newer, item) : []
            const isOldest = index === entries.length - 1
            return (
              <View style={styles.entry}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryDate}>{formatHistoryDate(item.createdAt)}</Text>
                  {diffs.length > 0 ? (
                    <View style={styles.diffs}>
                      {diffs.map((d) => (
                        <Text key={d.fieldId} style={styles.diffLine} numberOfLines={1}>
                          {d.label} <Text style={styles.diffOld}>{d.oldValue}</Text>
                          {' → '}
                          <Text style={styles.diffNew}>{d.newValue}</Text>
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.entryDetail}>
                      {isOldest ? 'Initial save' : 'No changes'}
                    </Text>
                  )}
                </View>
                <Button
                  label="Restore"
                  icon={IconArrowBackUp}
                  variant="outline"
                  onPress={() => handleRestore(item.id)}
                />
              </View>
            )
          }}
        />
      )}
      <ConfirmModal
        visible={rollbackConfirmEntryId != null}
        title="Restore"
        message="Replace current profile fields with this snapshot?"
        confirmLabel="Restore"
        onConfirm={() => {
          if (rollbackConfirmEntryId != null) {
            // intentional-suppression: Tune store error is rendered by the active screen or modal
            void rollbackToHistory(rollbackConfirmEntryId)
              .then(() => router.back())
              .catch(() => undefined) // Keep this screen open; the store owns the visible error.
          }
          setRollbackConfirmEntryId(null)
        }}
        onCancel={() => setRollbackConfirmEntryId(null)}
      />
    </SafeAreaView>
  )
}

function Separator() {
  return <View style={styles.separator} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  error: {
    color: theme.status.error.text,
    fontSize: 12,
    padding: 16,
  },
  empty: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  separator: { height: 1, backgroundColor: theme.ui.border },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  entryInfo: {
    flex: 1,
    gap: 4,
  },
  entryDate: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  entryDetail: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  diffs: {
    gap: 2,
  },
  diffLine: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  diffOld: {
    textDecorationLine: 'line-through',
  },
  diffNew: {
    color: theme.ui.foreground,
    fontWeight: '600',
  },
})
