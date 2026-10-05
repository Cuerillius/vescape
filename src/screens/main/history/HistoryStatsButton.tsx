import { useState } from 'react'
import IconListDetails from '@tabler/icons-react-native/IconListDetails'
import type { HistoryGpsSample, TelemetrySample } from 'vescape-core'

import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import type { HistorySession } from '@/modules/history/store/historyStore'
import { RangeStatsBar } from '@/screens/main/history/RangeStatsBar'

interface HistoryStatsButtonProps {
  session: HistorySession
  samples: TelemetrySample[]
  gpsSamples: HistoryGpsSample[]
  trimming: boolean
}

/**
 * Next to the chart toggles: opens every figure of the ride in a drawer. The headline three are
 * already under the ride's name; the drawer holds the rest, for the zoomed stretch when the chart
 * is zoomed.
 */
export function HistoryStatsButton({
  session,
  samples,
  gpsSamples,
  trimming,
}: HistoryStatsButtonProps) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <Button
        icon={IconListDetails}
        variant="floating"
        size="lg"
        onPress={() => setVisible(true)}
        testID="history-stats-bar"
        accessibilityLabel="Ride stats"
      />
      <Drawer
        visible={visible}
        title="Ride stats"
        onClose={() => setVisible(false)}
        testID="history-stats-sheet"
      >
        <RangeStatsBar
          session={session}
          samples={samples}
          gpsSamples={gpsSamples}
          trimming={trimming}
        />
      </Drawer>
    </>
  )
}
