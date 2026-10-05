import type { RefloatConfigField } from 'vescape-core'

import { BasicSliderCell } from '@/modules/tune/components/BasicSliderCell'
import { basicSliderIcon } from '@/modules/tune/components/basicSliderIcons'
import { TuneConfigCell } from '@/modules/tune/components/TuneConfigCell'
import type { BasicSliderItem } from '@/modules/tune/lib/sliderDefinitions'

export interface BasicSliderItemCellProps {
  item: BasicSliderItem
  editable: boolean
  fullWidth?: boolean
  onPress: (sliderId: string) => void
}

export function BasicSliderItemCell({ item, editable, onPress }: BasicSliderItemCellProps) {
  return (
    <BasicSliderCell
      item={item}
      icon={basicSliderIcon(item.id)}
      editable={editable}
      onPress={() => onPress(item.id)}
    />
  )
}

export interface TuneFieldCellProps {
  field: RefloatConfigField
  onPress: (field: RefloatConfigField) => void
}

export function TuneFieldCell({ field, onPress }: TuneFieldCellProps) {
  return <TuneConfigCell field={field} onPress={() => onPress(field)} />
}
