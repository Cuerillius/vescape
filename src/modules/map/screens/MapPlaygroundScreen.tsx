import { useResolvedAccentColors } from '@/hooks/useTheme'
import Mapbox, { type Camera as CameraRef } from '@rnmapbox/maps'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import { MAPBOX_ACCESS_TOKEN } from '@/config/mapy'
import { theme } from '@/constants/theme'
import { makeCircleFeature, offsetCoordinate } from '@/helpers/mapGeometry'
import { PlaygroundSlider } from '@/modules/map/components/PlaygroundSlider'
import { SpringTraceChart, type SpringTraceSample } from '@/modules/map/components/SpringTraceChart'
import {
  CAMERA_ENGINE_DEFAULT_OMEGA,
  createCameraEngine,
  type CameraEngine,
  type EngineCamera,
} from '@/modules/map/lib/cameraEngine/engine'
import { getPitchForZoom } from '@/modules/map/lib/cameraProfiles'
import {
  advanceFakeGps,
  createFakeGpsState,
  fakeCompassHeading,
  type FakeGpsMode,
  type FakeGpsState,
} from '@/modules/map/lib/fakeGps'

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN)

const START: [number, number] = [17.0385, 51.1079]
const START_ZOOM = 16
const GPS_TICK_MS = 1000
const COMPASS_TICK_MS = 100
const UI_TICK_MS = 100
const TRACE_WINDOW_MS = 5000
/** Retargets beyond this snap instead of animating. */
const TELEPORT_DISTANCE_M = 50_000
/** Comfortably past the threshold so the button always exercises the snap path. */
const TELEPORT_JUMP_M = 100_000
/** Below the teleport threshold: exercises the ballistic zoom-out-and-back arc. */
const MID_JUMP_M = 3000
const GPS_MODES = [
  { key: 'straight', label: 'Straight' },
  { key: 'curvy', label: 'Curvy' },
  { key: 'jitter', label: 'Jitter' },
] as const

interface Traces {
  lng: SpringTraceSample[]
  heading: SpringTraceSample[]
}

const emptyTraces = (): Traces => ({ lng: [], heading: [] })

const INITIAL_CAMERA: EngineCamera = {
  centerCoordinate: START,
  zoomLevel: START_ZOOM,
  heading: 0,
  pitch: 0,
}

/**
 * Dev-only bench for `cameraEngine`: synthetic GPS/compass drivers push targets
 * at realistic rates while the spring constants are tuned live and the position
 * vs target traces are plotted.
 */
export function MapPlaygroundScreen() {
  const accents = useResolvedAccentColors()
  const cameraRef = useRef<CameraRef>(null)
  const engineRef = useRef<CameraEngine | null>(null)
  const cameraStateRef = useRef<EngineCamera>(INITIAL_CAMERA)
  const targetRef = useRef<{ center: [number, number]; heading: number }>({
    center: START,
    heading: 0,
  })
  const tracesRef = useRef<Traces>(emptyTraces())
  const gpsStateRef = useRef<FakeGpsState>(createFakeGpsState(START))
  const compassElapsedRef = useRef(0)

  const [omegaCenter, setOmegaCenter] = useState(CAMERA_ENGINE_DEFAULT_OMEGA.center)
  const [omegaZoom, setOmegaZoom] = useState(CAMERA_ENGINE_DEFAULT_OMEGA.zoom)
  const [omegaHeading, setOmegaHeading] = useState(CAMERA_ENGINE_DEFAULT_OMEGA.heading)
  const [omegaPitch, setOmegaPitch] = useState(CAMERA_ENGINE_DEFAULT_OMEGA.pitch)
  const [derivePitchOn, setDerivePitchOn] = useState(true)
  const [ballisticOn, setBallisticOn] = useState(true)
  const [zoom, setZoom] = useState(START_ZOOM)
  const [gpsMode, setGpsMode] = useState<FakeGpsMode>('curvy')
  const [gpsRunning, setGpsRunning] = useState(true)
  const [speedKmh, setSpeedKmh] = useState(20)
  const [compassOn, setCompassOn] = useState(false)
  const [compassNoise, setCompassNoise] = useState(false)
  const [gpsFix, setGpsFix] = useState<[number, number]>(START)
  const [traces, setTraces] = useState<Traces>(emptyTraces)
  const [readout, setReadout] = useState<{ camera: EngineCamera; animating: boolean }>({
    camera: INITIAL_CAMERA,
    animating: false,
  })

  const zoomRef = useRef(zoom)
  // Drivers read live settings without restarting their timers.
  const driversRef = useRef({ gpsMode, gpsRunning, speedKmh, compassOn, compassNoise })
  useEffect(() => {
    zoomRef.current = zoom
    driversRef.current = { gpsMode, gpsRunning, speedKmh, compassOn, compassNoise }
  }, [zoom, gpsMode, gpsRunning, speedKmh, compassOn, compassNoise])

  const applyFrame = useCallback((camera: EngineCamera) => {
    cameraStateRef.current = camera
    // TODO: switch to setCameraDirect once the extended patch lands
    cameraRef.current?.setCamera({
      centerCoordinate: camera.centerCoordinate,
      zoomLevel: camera.zoomLevel,
      heading: camera.heading,
      pitch: camera.pitch,
      animationDuration: 0,
    })
    const t = Date.now()
    const traceState = tracesRef.current
    traceState.lng.push({
      t,
      position: camera.centerCoordinate[0],
      target: targetRef.current.center[0],
    })
    traceState.heading.push({ t, position: camera.heading, target: targetRef.current.heading })
    const cutoff = t - TRACE_WINDOW_MS
    while (traceState.lng.length > 0 && traceState.lng[0]!.t < cutoff) traceState.lng.shift()
    while (traceState.heading.length > 0 && traceState.heading[0]!.t < cutoff) {
      traceState.heading.shift()
    }
  }, [])

  // Omega is a creation-time constant, so a tuning change rebuilds the engine
  // on top of the camera the old one left behind.
  useEffect(() => {
    const engine = createCameraEngine({
      applyFrame,
      omega: {
        center: omegaCenter,
        zoom: omegaZoom,
        heading: omegaHeading,
        pitch: omegaPitch,
      },
      derivePitch: derivePitchOn ? (z) => getPitchForZoom(z, true) : undefined,
      teleportDistanceM: TELEPORT_DISTANCE_M,
      ballistic: ballisticOn ? {} : false,
    })
    engine.reset(cameraStateRef.current)
    // reset() parks every spring on the current camera; restore the live targets
    // so a retune mid-flight keeps chasing them instead of stalling.
    engine.setTarget({
      center: targetRef.current.center,
      zoom: zoomRef.current,
      ...(driversRef.current.compassOn ? { heading: targetRef.current.heading } : {}),
    })
    engineRef.current = engine
    return () => {
      engine.destroy()
      if (engineRef.current === engine) engineRef.current = null
    }
  }, [applyFrame, omegaCenter, omegaZoom, omegaHeading, omegaPitch, derivePitchOn, ballisticOn])

  useEffect(() => {
    const id = setInterval(() => {
      const { gpsMode: mode, gpsRunning: running, speedKmh: speed } = driversRef.current
      if (!running) return
      const sample = advanceFakeGps({
        state: gpsStateRef.current,
        mode,
        speedKmh: speed,
        dtSeconds: GPS_TICK_MS / 1000,
      })
      gpsStateRef.current = sample.state
      targetRef.current.center = sample.reported
      setGpsFix(sample.reported)
      engineRef.current?.setTarget({ center: sample.reported })
    }, GPS_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const { compassOn: on, compassNoise: noise } = driversRef.current
      if (!on) return
      compassElapsedRef.current += COMPASS_TICK_MS / 1000
      const heading = fakeCompassHeading({
        elapsedS: compassElapsedRef.current,
        degPerSecond: 12,
        noiseDeg: noise ? 6 : 0,
      })
      targetRef.current.heading = heading
      engineRef.current?.setTarget({ heading })
    }, COMPASS_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setTraces({ lng: [...tracesRef.current.lng], heading: [...tracesRef.current.heading] })
      setReadout({
        camera: cameraStateRef.current,
        animating: engineRef.current?.isAnimating() ?? false,
      })
    }, UI_TICK_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    engineRef.current?.setTarget({ zoom })
  }, [zoom])

  const jumpBy = (distanceM: number) => {
    const far = offsetCoordinate(gpsStateRef.current.position, 90, distanceM)
    gpsStateRef.current = { ...gpsStateRef.current, position: far }
    targetRef.current.center = far
    setGpsFix(far)
    engineRef.current?.setTarget({ center: far })
  }

  const recenter = () => {
    gpsStateRef.current = createFakeGpsState(START)
    targetRef.current.center = START
    setGpsFix(START)
    engineRef.current?.snap({ center: START, zoom })
  }

  const { camera, animating } = readout

  return (
    <View style={styles.screen}>
      <View style={styles.mapPane}>
        <Mapbox.MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Dark}
          scaleBarEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
          compassEnabled={false}
        >
          <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: START,
              zoomLevel: START_ZOOM,
              heading: 0,
              pitch: 0,
            }}
            animationMode="none"
          />
          <Mapbox.ShapeSource
            id="playground-fix"
            shape={makeCircleFeature(gpsFix[0], gpsFix[1], 8)}
          >
            <Mapbox.FillLayer
              id="playground-fix-fill"
              style={{
                fillColor: accents.violet.color,
                fillOutlineColor: accents.violet.light,
              }}
            />
          </Mapbox.ShapeSource>
        </Mapbox.MapView>
      </View>

      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        <Section title="GPS driver">
          <View style={styles.row}>
            <Text style={styles.label}>Mode</Text>
            <ToggleGroup activeKey={gpsMode} options={GPS_MODES} onSelect={setGpsMode} />
          </View>
          <ToggleRow label="Running (1 Hz)" value={gpsRunning} onToggle={setGpsRunning} />
          <PlaygroundSlider
            label="Speed"
            value={speedKmh}
            min={5}
            max={50}
            step={1}
            format={(v) => `${v.toFixed(0)} km/h`}
            onChange={setSpeedKmh}
          />
          <View style={styles.buttons}>
            <Button label="Jump 3 km" onPress={() => jumpBy(MID_JUMP_M)} />
            <Button label="Teleport 100 km" onPress={() => jumpBy(TELEPORT_JUMP_M)} />
            <Button label="Reset to Wrocław" onPress={recenter} />
          </View>
        </Section>

        <Section title="Compass driver">
          <ToggleRow label="Phone heading (10 Hz)" value={compassOn} onToggle={setCompassOn} />
          <ToggleRow label="Heading noise" value={compassNoise} onToggle={setCompassNoise} />
        </Section>

        <Section title="Springs">
          <PlaygroundSlider
            label="Omega center"
            value={omegaCenter}
            min={1}
            max={20}
            onChange={setOmegaCenter}
          />
          <PlaygroundSlider
            label="Omega zoom"
            value={omegaZoom}
            min={1}
            max={20}
            onChange={setOmegaZoom}
          />
          <PlaygroundSlider
            label="Omega heading"
            value={omegaHeading}
            min={1}
            max={20}
            onChange={setOmegaHeading}
          />
          <PlaygroundSlider
            label="Omega pitch"
            value={omegaPitch}
            min={1}
            max={20}
            onChange={setOmegaPitch}
          />
          <PlaygroundSlider
            label="Zoom target"
            value={zoom}
            min={10}
            max={19}
            format={(v) => v.toFixed(1)}
            onChange={setZoom}
          />
          <ToggleRow
            label="Derive pitch (zoom→pitch)"
            value={derivePitchOn}
            onToggle={setDerivePitchOn}
          />
          <ToggleRow label="Ballistic transit zoom" value={ballisticOn} onToggle={setBallisticOn} />
        </Section>

        <Section title="Telemetry">
          <SpringTraceChart
            label="Center lng"
            samples={traces.lng}
            windowMs={TRACE_WINDOW_MS}
            format={(v) => v.toFixed(5)}
          />
          <SpringTraceChart
            label="Heading"
            samples={traces.heading}
            windowMs={TRACE_WINDOW_MS}
            format={(v) => `${v.toFixed(1)}°`}
          />
          <ValueRow
            label="Center"
            value={`${camera.centerCoordinate[0].toFixed(5)}, ${camera.centerCoordinate[1].toFixed(5)}`}
          />
          <ValueRow label="Zoom" value={camera.zoomLevel.toFixed(3)} />
          <ValueRow label="Heading" value={`${camera.heading.toFixed(1)}°`} />
          <ValueRow label="Pitch" value={`${camera.pitch.toFixed(1)}°`} />
          <ValueRow label="isAnimating" value={animating ? 'true' : 'false'} />
        </Section>
      </ScrollView>
    </View>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card>
        <View style={styles.sectionBody}>{children}</View>
      </Card>
    </View>
  )
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: (value: boolean) => void
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch accessibilityLabel={label} value={value} onValueChange={onToggle} />
    </View>
  )
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} selectable>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.ui.background },
  mapPane: { flex: 1, overflow: 'hidden' },
  map: { flex: 1 },
  panel: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: theme.ui.border,
    backgroundColor: theme.ui.background,
  },
  panelContent: { padding: 16, gap: 24, paddingBottom: 32 },
  section: { gap: 8 },
  sectionTitle: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionBody: { padding: 16, gap: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: { color: theme.ui.mutedForeground, fontSize: 13, fontWeight: '500' },
  value: { color: theme.ui.foreground, fontSize: 13, fontFamily: theme.mono('600') },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
})
