import { useState } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import IconBroadcast from '@tabler/icons-react-native/IconBroadcast'
import IconUsersGroup from '@tabler/icons-react-native/IconUsersGroup'

import { Button, type ButtonVariant } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { theme } from '@/constants/theme'
import { GroupRideStatusBadge, SocialSheet } from '@/modules/group-ride/components/SocialSheet'
import { useGroupRideStore } from '@/modules/group-ride/store/groupRideStore'

/**
 * The way into Group Ride: an icon button that opens the Social sheet (rider name and colour, and
 * starting, joining or leaving a ride). It wears the ride: the Group Ride accent while a ride is
 * active, and a dot while riders are nearby and none is joined.
 */
export function GroupRideControl({
  variant = 'ghost',
  style,
}: {
  variant?: ButtonVariant
  style?: StyleProp<ViewStyle>
}) {
  const [open, setOpen] = useState(false)
  const rideActive = useGroupRideStore((s) => s.activeRideId !== null)
  const nearbyBadge = useGroupRideStore((s) => s.badge)
  const accent = theme.palette.groupRide.color

  return (
    <>
      <View style={style}>
        <Button
          icon={rideActive ? IconBroadcast : IconUsersGroup}
          variant={variant}
          size={variant === 'floating' ? 'lg' : 'default'}
          color={rideActive ? accent : undefined}
          accessibilityLabel="Group ride"
          testID="group-ride-trigger"
          onPress={() => setOpen(true)}
        />
        {nearbyBadge && !rideActive ? (
          <View style={[styles.dot, { backgroundColor: accent }]} testID="group-ride-trigger-dot" />
        ) : null}
      </View>
      <Drawer
        visible={open}
        title="Group ride"
        description="Ride together and see each other on the map."
        headerRight={<GroupRideStatusBadge />}
        testID="social-drawer"
        onClose={() => setOpen(false)}
      >
        <SocialSheet />
      </Drawer>
    </>
  )
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.ui.background,
  },
})
