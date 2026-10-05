import type { ReactNode, RefObject } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft'
import IconArrowRight from '@tabler/icons-react-native/IconArrowRight'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { theme } from '@/constants/theme'

interface WizardStepLayoutProps {
  title: string
  description?: ReactNode
  headerRight?: ReactNode
  footer?: ReactNode
  scrollRef?: RefObject<ScrollView | null>
  children: ReactNode
}

export function WizardStepLayout({
  title,
  description,
  headerRight,
  footer,
  scrollRef,
  children,
}: WizardStepLayoutProps) {
  return (
    <View style={styles.fill}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <StepHeader title={title} description={description} right={headerRight} />
        <View style={styles.contentStack}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  )
}

/** Step title with an optional muted sentence under it and an action on the right. */
export function StepHeader({
  title,
  description,
  right,
}: {
  title: string
  description?: ReactNode
  right?: ReactNode
}) {
  return (
    <View style={styles.topContent}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  )
}

interface WizardNavActionsProps {
  canContinue: boolean
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  testIDPrefix: string
}

export function WizardNavActions({
  canContinue,
  onBack,
  onNext,
  nextLabel = 'Next',
  testIDPrefix,
}: WizardNavActionsProps) {
  return (
    <WizardFooterButtons
      onBack={onBack}
      onForward={onNext}
      forwardLabel={nextLabel}
      forwardIcon={IconArrowRight}
      forwardDisabled={!canContinue}
      backTestID={`${testIDPrefix}-back`}
      forwardTestID={`${testIDPrefix}-next`}
    />
  )
}

/** Back (outline) beside the step's one primary action. */
export function WizardFooterButtons({
  onBack,
  onForward,
  forwardLabel,
  forwardIcon,
  forwardDisabled,
  backTestID,
  forwardTestID,
}: {
  onBack: () => void
  onForward: () => void
  forwardLabel: string
  forwardIcon: Parameters<typeof Button>[0]['icon']
  forwardDisabled?: boolean
  backTestID: string
  forwardTestID: string
}) {
  return (
    <View style={styles.actions}>
      <Button
        style={styles.action}
        size="lg"
        label="Back"
        variant="outline"
        icon={IconArrowLeft}
        onPress={onBack}
        testID={backTestID}
      />
      <Button
        style={styles.action}
        size="lg"
        label={forwardLabel}
        variant="primary"
        icon={forwardIcon}
        onPress={onForward}
        disabled={forwardDisabled}
        testID={forwardTestID}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    gap: 16,
  },
  scroll: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    gap: 20,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerRight: {
    flexShrink: 0,
  },
  topContent: {
    gap: 6,
  },
  contentStack: {
    flexGrow: 1,
    gap: 16,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  footer: {
    paddingBottom: 4,
  },
  action: {
    flex: 1,
  },
})
