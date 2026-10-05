import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconChartLine from '@tabler/icons-react-native/IconChartLine'

import { ChartStackShowcase } from '@/components/charts/line/ChartStackShowcase'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { theme } from '@/constants/theme'

export default function NewComponentChartPage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconChartLine}
          description="ChartStack, the zoomable telemetry chart, on the zinc theme.ui tokens — scrub, pinch, selection and a stacked second chart."
        />
        <ChartStackShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
})
