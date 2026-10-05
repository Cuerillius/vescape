import { useCallback, useLayoutEffect } from 'react'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import IconBattery from '@tabler/icons-react-native/IconBattery'

import { Accordion } from '@/components/ui/Accordion'
import { Card } from '@/components/ui/Card'
import { RawValuesButton } from '@/components/ui/RawValuesButton'
import { theme } from '@/constants/theme'
import { BmsCellVoltages } from '@/modules/battery/components/BmsCellVoltages'
import { BoardBatteryEditor } from '@/modules/board/components/BoardBatteryEditor'
import { useBoardBatteryForm } from '@/modules/board/hooks/useBoardBatteryForm'
import { acquireBmsSeriesStream, releaseBmsSeriesStream } from '@/modules/board/store/bleStore'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { routes } from '@/navigation/routes'

export default function BatteryCellsScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const board = useBoardStore((s) => s.boards.find((b) => b.id === s.activeBoardId))
  const updateBoard = useBoardStore((s) => s.updateBoard)
  const form = useBoardBatteryForm({ board, updateBoard })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <RawValuesButton
          onPress={() => router.push(routes.controlBatteryRaw)}
          accessibilityLabel="Raw BMS data"
        />
      ),
    })
  }, [navigation, router])

  // The cell card's peak spread is reduced over the BMS series, which is only streamed on demand.
  useFocusEffect(
    useCallback(() => {
      acquireBmsSeriesStream()
      return releaseBmsSeriesStream
    }, []),
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <BmsCellVoltages />
        </Card>
        {board ? (
          <Accordion
            defaultOpenKey=""
            items={[
              {
                key: 'battery-config',
                title: 'Battery configuration',
                summary: form.keepMissingBatteryConfig
                  ? 'Not configured'
                  : form.batterySummary.value,
                icon: IconBattery,
                testID: 'battery-config-row',
                content: (
                  <BoardBatteryEditor
                    key={board.id}
                    value={form.battery}
                    saving={form.saving}
                    onSave={form.saveBattery}
                  />
                ),
              },
            ]}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.ui.background,
  },
  card: {
    padding: 16,
    gap: 12,
  },
  content: {
    gap: 12,
    padding: 16,
    paddingBottom: 40,
  },
})
