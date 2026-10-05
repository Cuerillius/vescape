import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlSize,
} from '@/components/ui/SegmentedControl'

export type SegmentedMenuOption<Key extends string> = SegmentedControlOption<Key>

interface SegmentedMenuProps<Key extends string> {
  activeKey: Key
  options: readonly SegmentedMenuOption<Key>[]
  expanded: boolean
  collapsedAccessibilityLabel: string
  /** Folds the menu this long after the last tap. `null` keeps it open until toggled. */
  autoCloseDelayMs?: number | null
  /** `lg` and `xl` match the 44 and 52 high floating buttons beside it. */
  size?: SegmentedControlSize
  onToggle: () => void
  onSelect: (key: Key) => void
}

const DEFAULT_AUTO_CLOSE_DELAY_MS = 1_500

/**
 * A floating icon button that unfolds into a `SegmentedControl`. Picking the active option again
 * folds the menu.
 */
export function SegmentedMenu<Key extends string>({
  activeKey,
  options,
  expanded,
  collapsedAccessibilityLabel,
  autoCloseDelayMs = DEFAULT_AUTO_CLOSE_DELAY_MS,
  size = 'default',
  onToggle,
  onSelect,
}: SegmentedMenuProps<Key>) {
  const onToggleRef = useRef(onToggle)
  const [interactionTick, setInteractionTick] = useState(0)

  useEffect(() => {
    onToggleRef.current = onToggle
  }, [onToggle])

  // The timer restarts on every pick, so the rider can try options one by one.
  useEffect(() => {
    if (!expanded || autoCloseDelayMs === null) return
    const timeout = setTimeout(() => onToggleRef.current(), autoCloseDelayMs)
    return () => clearTimeout(timeout)
  }, [autoCloseDelayMs, expanded, interactionTick])

  const active = options.find((option) => option.key === activeKey) ?? options[0]
  if (!expanded) {
    return (
      <Button
        icon={active.icon}
        variant="floating"
        size={size}
        accessibilityLabel={collapsedAccessibilityLabel}
        onPress={onToggle}
      />
    )
  }
  return (
    <SegmentedControl
      activeKey={activeKey}
      options={options}
      size={size}
      onSelect={(key) => {
        if (key === activeKey) {
          onToggle()
          return
        }
        setInteractionTick((tick) => tick + 1)
        onSelect(key)
      }}
    />
  )
}
