import { SelectMenu } from '@/components/ui/SelectMenu'
import { useTunePreviewFormat } from '@/modules/tune/hooks/useTunePreviewFormat'
import { HILLS_PRESETS, type HillsPresetId } from '@/modules/tune/lib/tunePreviewPresentation'

interface TunePreviewTerrainSelectProps {
  hillsPreset: HillsPresetId
  onHillsPresetChange: (preset: HillsPresetId) => void
  onHillHeightChange: (value: number) => void
  onHillSpacingChange: (value: number) => void
}

/** The terrain picker; choosing a preset also sets the hill height and spacing it stands for. */
export function TunePreviewTerrainSelect({
  hillsPreset,
  onHillsPresetChange,
  onHillHeightChange,
  onHillSpacingChange,
}: TunePreviewTerrainSelectProps) {
  const { options } = useTunePreviewFormat()

  const handleChange = (preset: HillsPresetId) => {
    onHillsPresetChange(preset)
    if (preset !== 'custom' && preset !== 'flat') {
      const values = HILLS_PRESETS[preset]
      onHillHeightChange(values.heightMeters)
      onHillSpacingChange(values.spacingMeters)
    }
  }

  return (
    <SelectMenu
      accessibilityLabel="Terrain"
      options={options.hills}
      value={hillsPreset}
      onChange={handleChange}
      triggerText={(option) => option.label.split(' · ')[0]}
    />
  )
}
