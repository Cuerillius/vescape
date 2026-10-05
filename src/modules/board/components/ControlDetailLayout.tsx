import { useNavigation } from 'expo-router'
import { type ReactNode, useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SectionHeader } from '@/components/base/SectionHeader'
import { Text } from '@/components/base/Text'
import { Accordion, type AccordionItem } from '@/components/ui/Accordion'

import { useBoardMetricAlerts } from '@/modules/alerts/hooks/useMetricAlerts'
import { getAlertThresholdValues } from '@/modules/alerts/lib/alertTest'
import { theme } from '@/constants/theme'
import { MetricDetailAlertContext } from '@/modules/board/components/metricDetailAlertContext'
import IconBellRinging from '@tabler/icons-react-native/IconBellRinging'

interface Props {
  title: string
  children?: ReactNode
  /** The control whose alert thresholds the screen's charts draw; omit when it has none. */
  controlId?: string
  /** Live gauge shown under the hero. */
  gauge?: ReactNode
  /**
   * Switches the screen to the metric layout: the hero on top, then `chart` always visible, then
   * `sections` as an accordion that starts closed. Children are not rendered in this layout.
   */
  hero?: ReactNode
  /** Always-visible block under the hero. */
  chart?: ReactNode
  /** Collapsed accordion rows under `chart`. */
  sections?: AccordionItem[]
}

/**
 * Shared chrome for a `/control/<metric>` detail screen: title, gauge and the screen's own charts.
 * Alerts are set up on the Alerts screen; the charts here only draw where they would trigger.
 */
export function ControlDetailLayout({
  title,
  children,
  controlId,
  gauge,
  hero,
  chart,
  sections,
}: Props) {
  const navigation = useNavigation()
  useEffect(() => {
    navigation.setOptions({ title })
  }, [title, navigation])

  const body = hero ? (
    <>
      {hero}
      {gauge}
      {chart}
      {sections?.length ? <Accordion items={sections} defaultOpenKey="" /> : null}
    </>
  ) : (
    <>
      {gauge}
      {children}
    </>
  )

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, hero ? styles.flatContent : null]}
    >
      {controlId === 'state' ? (
        <>
          {body}
          <View style={styles.alertsSection}>
            <SectionHeader
              icon={IconBellRinging}
              color={theme.palette.yellow.color}
              title="Alerts"
            />
            <Text style={styles.stateNote}>Fault alerts are always active.</Text>
          </View>
        </>
      ) : controlId ? (
        <ControlThresholds controlId={controlId}>{body}</ControlThresholds>
      ) : (
        body
      )}
    </ScrollView>
  )
}

/** Gives the screen's charts the control's current alert thresholds to draw as reference lines. */
function ControlThresholds({ controlId, children }: { controlId: string; children: ReactNode }) {
  const controller = useBoardMetricAlerts(controlId)
  const thresholds = useMemo(
    () => getAlertThresholdValues(controller?.ruleSnapshot ?? []),
    [controller?.ruleSnapshot],
  )
  const alertContext = useMemo(() => ({ controlId, thresholds }), [controlId, thresholds])

  return <MetricDetailAlertContext value={alertContext}>{children}</MetricDetailAlertContext>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  flatContent: {
    gap: 24,
    paddingBottom: 40,
  },
  alertsSection: {
    gap: 10,
    paddingTop: 8,
  },
  stateNote: {
    color: theme.ui.faintForeground,
    fontSize: 14,
  },
})
