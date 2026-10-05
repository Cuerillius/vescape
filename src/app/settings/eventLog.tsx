import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native'
import { useNavigation } from 'expo-router'
import IconList from '@tabler/icons-react-native/IconList'
import IconTrash from '@tabler/icons-react-native/IconTrash'
import { clearDiagnosticEvents, getDiagnosticEvents, type LocalDiagnosticEvent } from 'vescape-core'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { MessageCard } from '@/components/ui/MessageCard'
import { Separator } from '@/components/ui/Separator'
import { theme, type ThemeColor } from '@/constants/theme'
import { SettingsDescription } from '@/modules/settings/components/SettingsGroup'

const PAGE_SIZE = 50

const GOOD_EVENTS = new Set([
  'board_ready',
  'board_probe_ble_connected',
  'board_probe_bms_detected',
  'board_probe_completed',
  'board_probe_firmware_detected',
  'board_probe_refloat_detected',
  'board_probe_service_ready',
  'board_probe_telemetry_confirmed',
  'board_probe_transport_confirmed',
  'gatt_connected',
  'gatt_ready',
  'gps_fix_recovered',
  'gps_updates_started',
  'reconnect_scan_found',
  'telemetry_polling_started',
  'watch_mirror_present',
  'watch_mirror_launched',
  'watch_frame_send_recovered',
])

const INFO_EVENTS = new Set([
  'board_probe_can_responders_updated',
  'board_probe_progress',
  'board_probe_started',
  'board_probe_transport_finished',
  'board_probe_transport_probe_started',
  'gps_session_summary',
])

const WARNING_EVENTS = new Set([
  'board_probe_cancelled',
  'board_probe_connect_retry',
  'board_probe_disconnected_mid_detection',
  'gps_fix_stale',
  'gps_updates_stopped',
  'watch_mirror_absent',
  'watch_mirror_launch_skipped',
])

const BAD_EVENTS = new Set([
  'ble_connect_failed',
  'ble_disconnected_unexpectedly',
  'board_probe_failed',
  'config_decode_failed',
  'gps_provider_error',
  'gps_start_denied',
  'profile_push_failed',
  'board_ready_timeout',
  'reconnect_scan_failed',
  'reconnect_scan_start_failed',
  'reconnect_scan_timeout',
  'connect_phase_timeout',
  'telemetry_parse_failed',
  'telemetry_stale',
  'telemetry_unavailable',
  'watch_frame_send_failed',
  'watch_frame_no_nodes',
  'watch_nodes_lookup_failed',
  'watch_mirror_launch_failed',
])

function getEventColor(eventName: string): ThemeColor {
  if (GOOD_EVENTS.has(eventName)) return theme.status.success.color
  if (INFO_EVENTS.has(eventName)) return theme.status.info.color
  if (WARNING_EVENTS.has(eventName)) return theme.status.warning.color
  if (BAD_EVENTS.has(eventName)) return theme.status.error.color
  return theme.status.warning.color
}

function formatProperties(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2)
  } catch {
    return json
  }
}

interface EventItemProps {
  event: LocalDiagnosticEvent
  expanded: boolean
  onToggle: (id: number) => void
}

function EventItem({ event, expanded, onToggle }: EventItemProps) {
  const time = new Date(event.occurredAtMs).toLocaleTimeString()
  const meta = [event.operation, event.phase].filter(Boolean).join(' · ')
  const dotColor = getEventColor(event.eventName)

  return (
    <Card style={styles.eventRow} onPress={() => onToggle(event.id)}>
      <View style={styles.eventHeader}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.eventTime}>{time}</Text>
        <Text style={styles.eventName} numberOfLines={expanded ? undefined : 1}>
          {event.eventName}
        </Text>
      </View>
      {meta ? <Text style={styles.eventMeta}>{meta}</Text> : null}
      {event.message ? (
        <Text style={styles.eventMessage} numberOfLines={expanded ? undefined : 1}>
          {event.message}
        </Text>
      ) : null}
      {expanded ? (
        <View style={styles.eventExpanded}>
          <Separator />
          <Text style={styles.fieldLabel}>Timestamp</Text>
          <Text style={styles.fieldValue} selectable>
            {new Date(event.occurredAtMs).toLocaleString()}
          </Text>
          {event.boardId ? (
            <>
              <Text style={[styles.fieldLabel, styles.fieldGap]}>Board ID</Text>
              <Text style={styles.fieldValue} selectable>
                {event.boardId}
              </Text>
            </>
          ) : null}
          <Text style={[styles.fieldLabel, styles.fieldGap]}>Properties</Text>
          <Text style={styles.eventJson} selectable>
            {formatProperties(event.propertiesJson)}
          </Text>
        </View>
      ) : null}
    </Card>
  )
}

export default function DiagnosticEventsScreen() {
  const navigation = useNavigation()
  const [events, setEvents] = useState<LocalDiagnosticEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearConfirmVisible, setClearConfirmVisible] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const loadingRef = useRef(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          icon={IconTrash}
          variant="ghost"
          color={theme.status.error.color}
          accessibilityLabel="Clear event log"
          disabled={events.length === 0}
          loading={clearing}
          onPress={() => setClearConfirmVisible(true)}
        />
      ),
    })
  }, [clearing, events.length, navigation])

  const loadPage = useCallback(async (cursor?: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const page = await getDiagnosticEvents({
        toMs: cursor,
        limit: PAGE_SIZE,
      })
      if (page.length < PAGE_SIZE) setHasMore(false)
      setEvents((prev) => (cursor === undefined ? page : [...prev, ...page]))
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  useEffect(() => {
    void loadPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; loadPage is stable
  }, [])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || events.length === 0) return
    const oldest = events[events.length - 1]
    void loadPage(oldest.occurredAtMs - 1)
  }, [hasMore, events, loadPage])

  const refresh = useCallback(() => {
    setHasMore(true)
    setExpandedId(null)
    void loadPage(undefined)
  }, [loadPage])

  const toggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const clearEvents = useCallback(async () => {
    setClearConfirmVisible(false)
    setClearing(true)
    try {
      await clearDiagnosticEvents()
      setEvents([])
      setExpandedId(null)
      setHasMore(false)
    } finally {
      setClearing(false)
    }
  }, [])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<LocalDiagnosticEvent>) => (
      <EventItem event={item} expanded={expandedId === item.id} onToggle={toggleExpand} />
    ),
    [expandedId, toggleExpand],
  )

  const keyExtractor = useCallback((item: LocalDiagnosticEvent) => String(item.id), [])

  return (
    <>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.description}>
            <SettingsDescription>Browse locally persisted diagnostic events.</SettingsDescription>
          </View>
        }
        data={events}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        onRefresh={refresh}
        refreshing={loading && events.length === 0}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          loading ? null : (
            <MessageCard
              icon={IconList}
              title="No events"
              description="Diagnostic events recorded on this phone appear here."
            />
          )
        }
        ListFooterComponent={
          loading && events.length > 0 ? (
            <ActivityIndicator color={theme.ui.mutedForeground} style={styles.footer} />
          ) : !hasMore && events.length > 0 ? (
            <Text style={styles.footerText}>— end —</Text>
          ) : null
        }
      />
      <ConfirmDialog
        visible={clearConfirmVisible}
        title="Clear event log"
        message="Delete all local diagnostic events?"
        confirmLabel="Clear"
        destructive
        onConfirm={() => void clearEvents()}
        cancelLabel="Cancel"
        onDismiss={() => setClearConfirmVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  description: {
    marginBottom: 24,
  },
  separator: {
    height: 8,
  },
  footer: {
    paddingVertical: 16,
  },
  footerText: {
    color: theme.ui.faintForeground,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
  eventRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  eventTime: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
  eventName: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  eventMeta: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
  },
  eventMessage: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  eventExpanded: {
    marginTop: 8,
    gap: 2,
  },
  fieldLabel: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  fieldGap: {
    marginTop: 8,
  },
  fieldValue: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  eventJson: {
    color: theme.ui.foreground,
    fontSize: 11,
    fontFamily: 'monospace',
  },
})
