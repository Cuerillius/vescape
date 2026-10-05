import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronLeft from '@tabler/icons-react-native/IconChevronLeft'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'

import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

interface StepBarProps {
  /** Steps back; null while there is nowhere to go. */
  onPrevious: (() => void) | null
  /** Steps forward; null while there is nowhere to go. */
  onNext: (() => void) | null
  previousLabel: string
  nextLabel: string
  previousTestID?: string
  nextTestID?: string
  /** The thing being stepped through; fills the space between the arrows. */
  children: ReactNode
}

/**
 * One bordered bar with a step arrow at each end and the current item between them, so the three
 * read as a single control: months in the stats picker, rides in History.
 */
export function StepBar({
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
  previousTestID,
  nextTestID,
  children,
}: StepBarProps) {
  return (
    <View style={styles.bar}>
      <StepButton
        icon={IconChevronLeft}
        label={previousLabel}
        onPress={onPrevious}
        testID={previousTestID}
      />
      <View style={styles.divider} />
      <View style={styles.center}>{children}</View>
      <View style={styles.divider} />
      <StepButton icon={IconChevronRight} label={nextLabel} onPress={onNext} testID={nextTestID} />
    </View>
  )
}

function StepButton({
  icon: IconComponent,
  label,
  onPress,
  testID,
}: {
  icon: typeof IconChevronLeft
  label: string
  onPress: (() => void) | null
  testID?: string
}) {
  const color = useResolvedColor(onPress ? theme.ui.foreground : theme.ui.faintForeground)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress ?? undefined}
      android_ripple={interaction.ripple}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
      testID={testID}
    >
      <IconComponent size={18} color={color} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    minWidth: 0,
  },
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: theme.ui.border,
  },
  step: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPressed: {
    backgroundColor: theme.ui.muted,
  },
})
