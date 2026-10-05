import { useEffect, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconSettings from '@tabler/icons-react-native/IconSettings'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import type { HistorySession } from '@/modules/history/lib/sessions'
import { AccountCard } from '@/modules/profile/components/AccountCard'
import { ProfileStatsSummary } from '@/modules/profile/components/ProfileStatsSummary'
import { routes } from '@/navigation/routes'
import { CoverTabView } from '@/screens/main/CoverTabView'
import { ProfileRideList } from '@/screens/main/profile/ProfileRideList'
import { ProfileRides, type RideListMode } from '@/screens/main/profile/ProfileRides'
import { useProfileRides } from '@/screens/main/profile/useProfileRides'

/**
 * The Profile tab: who the rider is, their riding totals and their rides. Every setting is behind
 * the gear beside the account card. Stays mounted and fades like the Board view.
 */
export function ProfileDashboard({
  visible,
  onOpenRide,
  onOpenFavorite,
}: {
  visible: boolean
  onOpenRide: (session: HistorySession) => void
  onOpenFavorite: (favoriteId: string, session: HistorySession) => void
}) {
  const iconColor = useResolvedColor(theme.ui.mutedForeground)
  const rides = useProfileRides(visible)
  const [listMode, setListMode] = useState<RideListMode | null>(null)
  const listVisible = visible && listMode !== null

  // Leaving the tab closes the list, so coming back lands on the profile.
  useEffect(() => {
    if (!visible) setListMode(null)
  }, [visible])

  // Registered after the main screen's own handler, so back closes the list before anything else.
  useEffect(() => {
    if (!listVisible) return
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setListMode(null)
      return true
    })
    return () => subscription.remove()
  }, [listVisible])

  return (
    <>
      <CoverTabView visible={visible} testID="profile-dashboard">
        <View style={styles.header}>
          <View style={styles.account}>
            <AccountCard />
          </View>
          <Card
            onPress={() => router.push(routes.settings)}
            accessibilityLabel="Settings"
            style={styles.settings}
            testID="profile-settings-button"
          >
            <View style={styles.settingsInner}>
              <IconSettings size={20} color={iconColor} />
            </View>
          </Card>
        </View>

        <ProfileStatsSummary
          active={visible}
          action={
            <Button
              label="Details"
              icon={IconChevronRight}
              variant="outline"
              onPress={() => router.push(routes.profileStats)}
              testID="profile-stats-details"
            />
          }
        />

        <ProfileRides
          rides={rides}
          onOpenRide={onOpenRide}
          onOpenFavorite={onOpenFavorite}
          onShowAll={setListMode}
        />
      </CoverTabView>

      <ProfileRideList
        visible={listVisible}
        mode={listMode ?? 'rides'}
        onModeChange={setListMode}
        rides={rides}
        onBack={() => setListMode(null)}
        onOpenRide={onOpenRide}
        onOpenFavorite={onOpenFavorite}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  account: {
    flex: 1,
  },
  // Same card surface and height as the account card, only narrower.
  settings: {
    width: 56,
    alignSelf: 'stretch',
  },
  settingsInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
