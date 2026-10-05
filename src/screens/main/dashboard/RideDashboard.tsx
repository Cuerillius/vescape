import { type ReactNode, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated'

import { MonoValue } from '@/components/base/MonoValue'
import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { rideDistanceFromMeters, rideDistanceUnit } from '@/helpers/units'
import { useUnitSystem } from '@/hooks/useUnitSystem'
import { isBmsCharging } from '@/modules/battery/lib'
import { FootpadIndicator } from '@/modules/board/components/FootpadIndicator'
import { ImuBackIndicator } from '@/modules/board/components/ImuBackIndicator'
import { ImuIndicator } from '@/modules/board/components/ImuIndicator'
import { telemetry } from '@/modules/board/constants/telemetry'
import { useFootpadThreshold, usePosiSensor } from '@/modules/board/store/boardConfigValuesStore'
import { liveTelemetryRuntime } from '@/modules/board/lib/liveTelemetryRuntime'
import { useBleStore } from '@/modules/board/store/bleStore'
import type { Board } from '@/modules/board/store/boardStore'
import { routes } from '@/navigation/routes'
import { BatteryCard } from '@/screens/main/dashboard/BatteryCard'
import {
  DualMetricBar,
  MetricTile,
  useLiveNumberText,
} from '@/screens/main/dashboard/DashboardWidgets'
import { QuickControls } from '@/screens/main/dashboard/QuickControls'
import { useLowestAlertThreshold } from '@/modules/alerts/hooks/useLowestAlertThreshold'
import { SpeedRing } from '@/screens/main/dashboard/SpeedRing'
import { DashboardTuningCard } from '@/screens/main/dashboard/DashboardTuningCard'
import { isLive } from '@/modules/board/lib/boardConnection'
import { useMainTabBarHeight } from '@/screens/main/MainTabBar'

const FADE_TIMING = { duration: 220 } as const
const SIDE_PADDING = 16
const FOOTPAD_WIDTH = 56
const IMU_SIZE = 128
/**
 * The board fills only a band of its square canvas, so the icons are cropped to that band: it
 * keeps the visible gap between the footpad and the two icons small without overlapping hit areas.
 */
const IMU_CROP = { top: IMU_SIZE * 0.33, height: IMU_SIZE * 0.5 }
/** Empty band the crop leaves above and below the board; the footpad is spaced by the same. */
const IMU_BAND_PAD = IMU_SIZE * 0.09

function ImuCrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.imuCrop}>
      <View style={styles.imuShift}>{children}</View>
    </View>
  )
}

interface RideDashboardProps {
  visible: boolean
  activeBoard: Board | undefined
  bleStatus: string
}

/**
 * The Ride view: live telemetry and tuning on an opaque dashboard, separate from the Map view.
 * Stays mounted and fades, so switching tabs never re-creates the live readouts.
 */
export function RideDashboard({ visible, activeBoard, bleStatus }: RideDashboardProps) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const tabBarHeight = useMainTabBarHeight()
  const units = useUnitSystem()
  const posiSensor = usePosiSensor()
  const footpadThreshold1 = useFootpadThreshold(0)
  const footpadThreshold2 = useFootpadThreshold(1)

  const charging = useBleStore((s) => s.status === 'connected' && isBmsCharging(s.latestBms))
  const connected = isLive(bleStatus)
  const legalModeActive = activeBoard?.legalMode?.enabled ?? false

  const values = liveTelemetryRuntime.values
  const fade = useDerivedValue(() => withTiming(visible ? 1 : 0, FADE_TIMING))
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }))

  const distanceUnit = rideDistanceUnit(units).toUpperCase()
  const rangeText = useDerivedValue(() => {
    const meters = values.rangeM.value
    if (meters == null) return 'Unknown'
    return `${rideDistanceFromMeters(meters, units).toFixed(1)}${distanceUnit}`
  })
  const sessionText = useDerivedValue(
    () => `${rideDistanceFromMeters(values.tripM.value ?? 0, units).toFixed(1)}${distanceUnit}`,
  )
  // How much of this charge's projected distance the session has covered.
  const sessionFraction = useDerivedValue(() => {
    const trip = values.tripM.value
    const range = values.rangeM.value
    return trip == null || range == null || trip + range === 0 ? null : trip / (trip + range)
  })

  const motorTempText = useLiveNumberText(values.motorTemp, telemetry.motorTemp.decimals, '°')
  const controllerTempText = useLiveNumberText(
    values.controllerTemp,
    telemetry.controllerTemp.decimals,
    '°',
  )
  const motorCurrentText = useLiveNumberText(
    values.motorCurrent,
    telemetry.motorCurrent.decimals,
    'A',
  )
  const batteryCurrentText = useLiveNumberText(
    values.batteryCurrent,
    telemetry.battCurrent.decimals,
    'A',
  )

  const dutyAlarmThreshold = useLowestAlertThreshold('duty')
  const ringSize = Math.min(Math.round((width - SIDE_PADDING * 2) * 0.68), 300)

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.root, fadeStyle]}
      testID="ride-dashboard"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: tabBarHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <BatteryCard
          percent={values.batteryPercent}
          voltage={values.batteryVoltage}
          charging={charging}
          onPress={() => router.push(activeBoard ? routes.controlBattery : routes.addBoard)}
        />

        <QuickControls />

        <View style={styles.gaugeRow}>
          <SpeedRing
            size={ringSize}
            speedKmh={values.speedKmh}
            dutyPercent={values.dutyPercent}
            alarmThresholdPercent={dutyAlarmThreshold}
            onPressSpeed={() => router.push(routes.controlSpeed)}
            onPressDuty={() => router.push(routes.controlDuty)}
          />
          <View style={styles.sideColumn}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Footpad"
              hitSlop={8}
              onPress={() => router.push(routes.controlFootpad)}
              style={({ pressed }) => [styles.footpad, pressed && styles.pressed]}
              testID="dashboard-footpad"
            >
              <FootpadIndicator
                adc1={values.adc1}
                adc2={values.adc2}
                posi={posiSensor}
                threshold1={footpadThreshold1}
                threshold2={footpadThreshold2}
                width={FOOTPAD_WIDTH}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Roll"
              hitSlop={8}
              onPress={() => router.push(routes.controlImu)}
              style={({ pressed }) => pressed && styles.pressed}
              testID="dashboard-imu-roll"
            >
              <ImuCrop>
                <ImuBackIndicator roll={values.roll} size={IMU_SIZE} />
              </ImuCrop>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pitch"
              hitSlop={8}
              onPress={() => router.push(routes.controlImu)}
              style={({ pressed }) => pressed && styles.pressed}
              testID="dashboard-imu"
            >
              <ImuCrop>
                <ImuIndicator pitch={values.pitch} size={IMU_SIZE} />
              </ImuCrop>
            </Pressable>
          </View>
        </View>

        <DualMetricBar
          fraction={sessionFraction}
          left={
            <>
              <Text style={styles.barText}>Session</Text>
              <MonoValue
                text={sessionText}
                size={17}
                weight="600"
                align="left"
                width={66}
                color={theme.ui.foreground}
              />
            </>
          }
          right={
            <>
              <MonoValue
                text={rangeText}
                size={17}
                weight="600"
                align="right"
                width={80}
                color={theme.ui.foreground}
              />
              <Text style={styles.barText}>Range</Text>
            </>
          }
        />

        <View style={styles.tilesRow}>
          <MetricTile
            label="Motor"
            value={motorTempText}
            onPress={() => router.push(routes.controlMotorTemp)}
            testID="telemetry-motor-temp-cell"
          />
          <MetricTile
            label="Controller"
            value={controllerTempText}
            onPress={() => router.push(routes.controlControllerTemp)}
            testID="telemetry-controller-temp-cell"
          />
          <MetricTile
            label="Battery"
            value={batteryCurrentText}
            onPress={() => router.push(routes.controlBatteryCurrent)}
            testID="telemetry-battery-current-cell"
          />
          <MetricTile
            label="Current"
            value={motorCurrentText}
            onPress={() => router.push(routes.controlMotorCurrent)}
            testID="telemetry-motor-current-cell"
          />
        </View>

        <View style={styles.tuningBleed}>
          <DashboardTuningCard connected={connected} legalModeActive={legalModeActive} />
        </View>
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 6,
    backgroundColor: theme.ui.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: SIDE_PADDING,
    gap: 20,
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footpad: {
    marginBottom: IMU_BAND_PAD,
  },
  imuCrop: {
    height: IMU_CROP.height,
    overflow: 'hidden',
  },
  imuShift: {
    marginTop: -IMU_CROP.top,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  barText: {
    color: theme.ui.foreground,
    fontSize: 17,
    fontWeight: '500',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tuningBleed: {
    flex: 1,
    marginHorizontal: -SIDE_PADDING,
  },
})
