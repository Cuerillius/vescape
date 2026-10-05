import { SelectMenu, type SelectMenuOption } from '@/components/ui/SelectMenu'
import { StepBar } from '@/components/ui/StepBar'

interface StatsPeriodPickerProps {
  options: readonly SelectMenuOption<string>[]
  value: string
  onChange: (value: string) => void
  /** Steps toward older months; null while there is nowhere to go (including on All time). */
  onPrevious: (() => void) | null
  /** Steps toward newer months. */
  onNext: (() => void) | null
  testID?: string
}

/** Which period the stats describe: a menu of All time and every month, with arrows between months. */
export function StatsPeriodPicker({
  options,
  value,
  onChange,
  onPrevious,
  onNext,
  testID,
}: StatsPeriodPickerProps) {
  return (
    <StepBar
      onPrevious={onPrevious}
      onNext={onNext}
      previousLabel="Previous month"
      nextLabel="Next month"
    >
      <SelectMenu
        options={options}
        value={value}
        onChange={onChange}
        accessibilityLabel="Stats period"
        testID={testID}
        flat
      />
    </StepBar>
  )
}
