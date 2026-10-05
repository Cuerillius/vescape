import { type ReactNode, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import type { TuneProfileFieldValue } from 'vescape-core'

import { InfoModal } from '@/components/modals/InfoModal'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { TunePreviewTerrainSelect } from '@/modules/tune/components/TunePreviewTerrainSelect'
import { TunePreview } from '@/modules/tune/components/TunePreview'
import {
  TunePreviewScenarioControls,
  type HillsPresetId,
} from '@/modules/tune/components/TunePreviewScenarioControls'

interface TunePreviewSectionProps {
  fields: Record<string, TuneProfileFieldValue>
  active: boolean
  visible: boolean
  children: ReactNode
}

export function TunePreviewSection({ fields, active, visible, children }: TunePreviewSectionProps) {
  const ui = useResolvedUiColors()
  const pitchInputDegrees = useSharedValue(0)
  const pitchInputActive = useSharedValue(false)
  const previewSpeedKmh = useSharedValue(15)
  const groundToBoardAngleDegrees = useSharedValue(0)
  const [hillsPreset, setHillsPreset] = useState<HillsPresetId>('flat')
  const [hillHeightMeters, setHillHeightMeters] = useState(2.5)
  const [hillSpacingMeters, setHillSpacingMeters] = useState(30)
  const hillsEnabled = hillsPreset !== 'flat'
  const [expanded, setExpanded] = useState(false)
  const [previewHelpVisible, setPreviewHelpVisible] = useState(false)

  if (!visible) return null

  return (
    <View style={[styles.tuneView, { backgroundColor: ui.background }]}>
      <ScrollView
        style={[styles.formScroll, { backgroundColor: ui.background }]}
        contentContainerStyle={{ paddingBottom: 24 }}
        contentInsetAdjustmentBehavior="automatic"
        stickyHeaderIndices={[0]}
      >
        <View style={[styles.pinned, { backgroundColor: ui.background }]}>
          <View style={styles.previewCard}>
            <TunePreview
              fields={fields}
              pitchInputDegrees={pitchInputDegrees}
              pitchInputActive={pitchInputActive}
              hillsEnabled={hillsEnabled}
              hillHeightMeters={hillHeightMeters}
              hillSpacingMeters={hillSpacingMeters}
              active={active}
              expanded={expanded}
              onToggleExpanded={() => setExpanded((current) => !current)}
              onHelp={() => setPreviewHelpVisible(true)}
              headerAccessory={
                <TunePreviewTerrainSelect
                  hillsPreset={hillsPreset}
                  onHillsPresetChange={setHillsPreset}
                  onHillHeightChange={setHillHeightMeters}
                  onHillSpacingChange={setHillSpacingMeters}
                />
              }
              speedKmh={previewSpeedKmh}
              groundToBoardAngleDegrees={groundToBoardAngleDegrees}
            />
            {expanded ? (
              <TunePreviewScenarioControls
                hillsPreset={hillsPreset}
                hillHeightMeters={hillHeightMeters}
                onHillHeightChange={setHillHeightMeters}
                hillSpacingMeters={hillSpacingMeters}
                onHillSpacingChange={setHillSpacingMeters}
                pitchInputDegrees={pitchInputDegrees}
                pitchInputActive={pitchInputActive}
                speedKmh={previewSpeedKmh}
                groundToBoardAngleDegrees={groundToBoardAngleDegrees}
              />
            ) : null}
          </View>
        </View>
        <View style={[styles.content, { backgroundColor: ui.background }]}>{children}</View>
      </ScrollView>

      <InfoModal
        visible={previewHelpVisible}
        variant="info"
        title="Tune Preview"
        message="Tune Preview is not a real-world simulation and will never perfectly represent how your board will behave while riding. It is only a comparison tool to help you understand tune behavior and differences between settings."
        onDismiss={() => setPreviewHelpVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  tuneView: { flex: 1 },
  formScroll: { flex: 1 },
  pinned: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, zIndex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  previewCard: {
    gap: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.ui.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.ui.card,
  },
})
