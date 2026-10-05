import { useEffect, useMemo, useState, type RefObject } from 'react'
import { ActivityIndicator, Pressable, type ScrollView, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import IconArrowRight from '@tabler/icons-react-native/IconArrowRight'
import IconBluetooth from '@tabler/icons-react-native/IconBluetooth'
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconRefresh from '@tabler/icons-react-native/IconRefresh'
import { useShallow } from 'zustand/react/shallow'

import { DeviceRow } from '@/components/base/DeviceRow'
import { Text } from '@/components/base/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription, CardTitle } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { BoardLinkTimeline } from '@/modules/board/components/BoardLinkTimeline'
import {
  WizardFooterButtons,
  WizardStepLayout,
} from '@/modules/board/components/add-board-wizard/WizardStepLayout'
import type { UseAddBoardWizard } from '@/modules/board/hooks/useAddBoardWizard'
import { useBoardLink } from '@/modules/board/hooks/useBoardLink'
import { formatBmsSuffix, formatBoardTransport } from '@/modules/board/lib/boardTransport'
import { NUS_SERVICE_UUID, useBleStore } from '@/modules/board/store/bleStore'
import { usePermissions } from '@/modules/settings/hooks/usePermissions'

interface Props {
  wizard: UseAddBoardWizard
  onLinkActiveStepIndexChange?: (index: number) => void
  scrollRef?: RefObject<ScrollView | null>
}

export function ScanStep({ wizard, onLinkActiveStepIndexChange, scrollRef }: Props) {
  if (wizard.pairPhase === 'probing') {
    return (
      <LinkStep
        wizard={wizard}
        scrollRef={scrollRef}
        onLinkActiveStepIndexChange={onLinkActiveStepIndexChange}
      />
    )
  }
  return <ScanSelectStep wizard={wizard} />
}

function LinkStep({ wizard, onLinkActiveStepIndexChange, scrollRef }: Props) {
  const link = useBoardLink(wizard.bleId || null, wizard.boardId)

  const forward =
    link.phase === 'picking'
      ? {
          label: 'Next',
          icon: IconArrowRight,
          disabled: link.selectedLink == null || link.isFinalizing,
          onPress: () => {
            if (link.selectedLink) wizard.onDeviceProbed(link.selectedLink)
          },
          testID: 'add-board-link-save',
        }
      : link.phase === 'failed'
        ? {
            label: 'Retry',
            icon: IconRefresh,
            disabled: false,
            onPress: link.retry,
            testID: 'add-board-link-retry',
          }
        : {
            label: 'Next',
            icon: IconArrowRight,
            disabled: true,
            onPress: () => {},
            testID: 'add-board-link-next',
          }

  return (
    <WizardStepLayout
      title={wizard.bleName || wizard.bleId}
      description="Linking your board over Bluetooth"
      scrollRef={scrollRef}
      footer={
        <WizardFooterButtons
          onBack={wizard.clearDevice}
          onForward={forward.onPress}
          forwardLabel={forward.label}
          forwardIcon={forward.icon}
          forwardDisabled={forward.disabled}
          backTestID="add-board-link-choose-another"
          forwardTestID={forward.testID}
        />
      }
    >
      <BoardLinkTimeline
        phase={link.phase}
        progress={link.progress}
        candidates={link.candidates}
        selected={link.selected}
        onSelect={link.select}
        bleId={wizard.bleId}
        fill
        testIDPrefix="add-board-link"
        onActiveStepIndexChange={onLinkActiveStepIndexChange}
      />
    </WizardStepLayout>
  )
}

function ScanSelectStep({ wizard }: { wizard: UseAddBoardWizard }) {
  const { status, request } = usePermissions()
  const { devices, error, startScan, stopScan, isScanning } = useBleStore(
    useShallow((state) => ({
      devices: state.devices,
      error: state.error,
      startScan: state.startScan,
      stopScan: state.stopScan,
      isScanning: state.scanStatus === 'scanning',
    })),
  )
  const [showOther, setShowOther] = useState(false)
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)

  useEffect(() => {
    void request()
  }, [request])

  useEffect(() => {
    if (status === 'granted') startScan()
    return () => stopScan()
  }, [status, startScan, stopScan])

  const { vescDevices, otherDevices } = useMemo(() => {
    const vesc = []
    const other = []
    for (const device of devices) {
      if (device.serviceUUIDs.some((uuid) => uuid.toLowerCase() === NUS_SERVICE_UUID)) {
        vesc.push(device)
      } else {
        other.push(device)
      }
    }
    return { vescDevices: vesc, otherDevices: other }
  }, [devices])

  const scanStatus =
    status === 'denied'
      ? 'Bluetooth permission required'
      : error
        ? error
        : isScanning
          ? 'Scanning for nearby boards…'
          : 'No boards found'

  return (
    <WizardStepLayout
      title="Pair your board"
      description="Power the board on and keep the phone close."
      footer={
        <WizardFooterButtons
          onBack={() => router.back()}
          onForward={wizard.next}
          forwardLabel="Next"
          forwardIcon={IconArrowRight}
          forwardDisabled={wizard.draftLink == null}
          backTestID="add-board-pair-back"
          forwardTestID="add-board-pair-next"
        />
      }
    >
      {wizard.draftLink ? (
        <>
          <Card style={styles.pairedCard}>
            <Badge label="Linked" dot={theme.status.success.color} />
            <CardTitle>{wizard.bleName || wizard.bleId}</CardTitle>
            <CardDescription>
              {`${formatBoardTransport(wizard.draftLink.transport)}${formatBmsSuffix(wizard.draftLink.hasBms)}`}
            </CardDescription>
          </Card>
          <Button
            label="Change device"
            variant="outline"
            size="lg"
            icon={IconBluetooth}
            onPress={wizard.clearDevice}
          />
        </>
      ) : (
        <>
          <View style={styles.scanHeader}>
            {isScanning ? <ActivityIndicator color={mutedColor} size="small" /> : null}
            <CardDescription style={styles.scanStatus}>{scanStatus}</CardDescription>
          </View>
          <View style={styles.deviceList}>
            {vescDevices.map((device) => (
              <DeviceRow
                key={device.id}
                id={device.id}
                name={device.name}
                rssi={device.rssi}
                onPress={() => wizard.selectDevice(device.id, device.name)}
              />
            ))}
          </View>
          {vescDevices.length === 0 && devices.length === 0 && isScanning ? (
            <Text style={styles.emptyHint}>Boards will appear as they are found</Text>
          ) : null}
          {otherDevices.length > 0 ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showOther }}
                style={styles.otherDevicesToggle}
                onPress={() => setShowOther((visible) => !visible)}
                hitSlop={8}
              >
                {showOther ? (
                  <IconChevronDown size={16} color={mutedColor} />
                ) : (
                  <IconChevronRight size={16} color={mutedColor} />
                )}
                <CardDescription>{`Other devices (${otherDevices.length})`}</CardDescription>
              </Pressable>
              {showOther ? (
                <View style={styles.deviceList}>
                  {otherDevices.map((device) => (
                    <DeviceRow
                      key={device.id}
                      id={device.id}
                      name={device.name}
                      rssi={device.rssi}
                      onPress={() => wizard.selectDevice(device.id, device.name)}
                    />
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </WizardStepLayout>
  )
}

const styles = StyleSheet.create({
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanStatus: {
    flex: 1,
    minWidth: 0,
  },
  deviceList: {
    gap: 8,
  },
  emptyHint: {
    color: theme.ui.mutedForeground,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
  otherDevicesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  pairedCard: {
    gap: 6,
    padding: 16,
  },
})
