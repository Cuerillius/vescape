import Mapbox, { Camera, MapView, RasterLayer, RasterSource, StyleImport } from '@rnmapbox/maps'
import { useNavigation } from 'expo-router'
import IconStack2 from '@tabler/icons-react-native/IconStack2'
import { useLayoutEffect, useState } from 'react'
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Text } from '@/components/base/Text'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { IS_MAPY_CONFIGURED, MAPBOX_ACCESS_TOKEN, MAPY_TILE_URL_TEMPLATE } from '@/config/mapy'
import { theme } from '@/constants/theme'
import { MapStyleList } from '@/modules/map/components/MapStyleList'
import { BLANK_STYLE, MAP_DEFAULTS, MAP_STYLES } from '@/modules/map/constants/mapStyles'
import { mapStyleForTheme } from '@/modules/map/lib/mapTheme'
import { useSettingsStore } from '@/modules/settings/store/settingsStore'
import { usePrivacyZoneEditor } from '@/screens/privacyZones/usePrivacyZoneEditor'
import { ZoneNameModal } from '@/screens/privacyZones/ZoneNameModal'
import { ZonePillBar } from '@/screens/privacyZones/ZonePillBar'

Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN)

const HEADER_HEIGHT = Platform.OS === 'android' ? 56 : 44
/** Pill bar height (36) plus its 10 vertical padding on each side, and a gap. */
const PILL_BAR_OFFSET = 64

/** Areas where recording pauses. The map's camera is the editor: pan to move, zoom to resize. */
export function PrivacyZonesScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const editor = usePrivacyZoneEditor()
  const mapStyleKey = useSettingsStore((s) => s.mapStyleKey)
  const setSetting = useSettingsStore((s) => s.set)
  const [layersOpen, setLayersOpen] = useState(false)

  const requestedStyle =
    MAP_STYLES.find((style) => style.key === mapStyleForTheme(mapStyleKey)) ?? MAP_STYLES[0]
  const mapStyle =
    requestedStyle.key === 'mapy' && !IS_MAPY_CONFIGURED ? MAP_STYLES[0] : requestedStyle
  const isMapy = mapStyle.key === 'mapy'
  const isStandard = mapStyle.key === 'colorfulDark'

  useLayoutEffect(() => {
    navigation.setOptions({ headerTransparent: true })
  }, [navigation])

  const {
    circleDiameter,
    cameraRef,
    cameraCenter,
    cameraZoom,
    loaded,
    saving,
    isEditing,
    isUnsaved,
    pills,
    selectedId,
    zoneEnabled,
  } = editor
  const mapInteractive = isEditing || isUnsaved
  const toggleLabel = zoneEnabled ? 'Disable' : 'Enable'

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        // Mapy draws its own raster tiles over an empty document; the rest are hosted styles.
        styleURL={isMapy ? undefined : (mapStyle.styleURL ?? undefined)}
        styleJSON={isMapy ? BLANK_STYLE : undefined}
        onCameraChanged={editor.handleCameraChanged}
        onDidFinishLoadingMap={() => editor.setMapReady(true)}
        scaleBarEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
        compassEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={mapInteractive}
        zoomEnabled={mapInteractive}
      >
        {isStandard ? (
          <StyleImport id="basemap" existing config={{ lightPreset: 'night' }} />
        ) : null}
        {isMapy && MAPY_TILE_URL_TEMPLATE ? (
          <RasterSource
            id="zone-mapy-tiles"
            tileUrlTemplates={[MAPY_TILE_URL_TEMPLATE]}
            tileSize={256}
            maxZoomLevel={MAP_DEFAULTS.maxZoom}
          >
            <RasterLayer
              id="zone-mapy-tiles-layer"
              sourceID="zone-mapy-tiles"
              style={{ rasterOpacity: 1 }}
            />
          </RasterSource>
        ) : null}
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: cameraCenter, zoomLevel: cameraZoom }}
          animationMode="none"
        />
      </MapView>

      <View style={styles.circleWrapper} pointerEvents="none">
        <View
          style={[
            styles.circle,
            { width: circleDiameter, height: circleDiameter, borderRadius: circleDiameter / 2 },
            zoneEnabled || isUnsaved ? styles.circleEnabled : styles.circleDisabled,
          ]}
        />
      </View>

      <View style={styles.zoneLabelWrapper} pointerEvents="none">
        <Text style={styles.zoneLabel}>{pills.find((p) => p.id === selectedId)?.name ?? ''}</Text>
      </View>

      <View style={[styles.pillsFloating, { top: insets.top + HEADER_HEIGHT }]}>
        <ZonePillBar
          pills={pills}
          selectedId={selectedId}
          onSelect={editor.handleSelectPill}
          onAdd={editor.handleAddPress}
          onRename={editor.handleRenamePress}
          onDelete={editor.handleDeletePress}
        />
      </View>

      <View style={[styles.layersButton, { top: insets.top + HEADER_HEIGHT + PILL_BAR_OFFSET }]}>
        <Button
          icon={IconStack2}
          variant="floating"
          size="lg"
          accessibilityLabel="Map layers"
          testID="privacy-zone-map-layers"
          onPress={() => setLayersOpen(true)}
        />
      </View>

      <Drawer visible={layersOpen} title="Map type" onClose={() => setLayersOpen(false)}>
        <MapStyleList
          activeKey={mapStyleKey}
          onSelect={(key) => void setSetting('mapStyleKey', key)}
        />
      </Drawer>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {isUnsaved ? (
          <Button
            label="Save and enable"
            variant="primary"
            size="lg"
            testID="privacy-zone-save-button"
            onPress={() => void editor.handleSave()}
            loading={saving}
            style={styles.actionButton}
          />
        ) : isEditing ? (
          <View style={styles.savedActions}>
            <Button
              label="Cancel"
              testID="privacy-zone-edit-cancel-button"
              variant="floating"
              size="lg"
              onPress={editor.handleCancelEdit}
              style={styles.actionButton}
            />
            <Button
              label="Save changes"
              variant="primary"
              size="lg"
              testID="privacy-zone-save-button"
              onPress={() => void editor.handleUpdate()}
              loading={saving}
              style={styles.actionButton}
            />
          </View>
        ) : (
          <View style={styles.savedActions}>
            <Button
              label="Change zone"
              testID="privacy-zone-change-button"
              variant="floating"
              size="lg"
              onPress={editor.handleStartEdit}
              style={styles.actionButton}
            />
            <Button
              key={toggleLabel}
              label={toggleLabel}
              testID="privacy-zone-toggle-button"
              variant={zoneEnabled ? 'floating' : 'primary'}
              size="lg"
              onPress={() => void editor.handleToggle()}
              style={styles.actionButton}
            />
          </View>
        )}
      </View>

      {!loaded ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={theme.ui.mutedForeground} />
        </View>
      ) : null}

      <ZoneNameModal
        visible={editor.addNameVisible}
        title="Zone name"
        value={editor.addNameText}
        confirmLabel="Add"
        testIdPrefix="privacy-zone-name"
        placeholder="e.g. Gym, Work 2"
        onChangeText={editor.setAddNameText}
        onConfirm={editor.handleAddConfirm}
        onCancel={() => editor.setAddNameVisible(false)}
      />

      <ZoneNameModal
        visible={editor.renameTarget != null}
        title="Rename zone"
        value={editor.renameText}
        confirmLabel="Save"
        testIdPrefix="privacy-zone-rename"
        placeholder="Zone name"
        onChangeText={editor.setRenameText}
        onConfirm={() => void editor.handleRenameConfirm()}
        onCancel={() => editor.setRenameTarget(null)}
      />

      <ConfirmDialog
        visible={editor.confirmDeleteId != null}
        title="Delete zone"
        message="This zone will be removed and recording will resume in this area."
        confirmLabel="Delete"
        destructive
        onConfirm={() => void editor.handleDeleteConfirm()}
        cancelLabel="Cancel"
        onDismiss={() => editor.setConfirmDeleteId(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  pillsFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  layersButton: {
    position: 'absolute',
    right: 12,
  },
  circleWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderWidth: 2,
  },
  circleEnabled: {
    backgroundColor: theme.zone.bg,
    borderColor: theme.zone.border,
  },
  circleDisabled: {
    backgroundColor: 'transparent',
    borderColor: theme.zone.borderDim,
  },
  zoneLabelWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: theme.alpha(theme.palette.mono.black, 0.85),
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.alpha(theme.ui.background, 0.6),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  savedActions: {
    flexDirection: 'row',
    gap: 8,
  },
})
