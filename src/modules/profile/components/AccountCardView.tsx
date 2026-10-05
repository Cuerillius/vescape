import { Image } from 'expo-image'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'
import IconRefresh from '@tabler/icons-react-native/IconRefresh'
import IconUser from '@tabler/icons-react-native/IconUser'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card, CardDescription } from '@/components/ui/Card'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** What the account card has to say, resolved from Clerk and the device credential. */
export type AccountCardState =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  /** Signed in, with the Clerk → Device Token exchange still running. */
  | { kind: 'provisioning'; name: string; imageUrl?: string }
  /** Signed in, but the exchange failed: the account buys the rider nothing until it succeeds. */
  | { kind: 'failed'; name: string; imageUrl?: string }
  | { kind: 'signedIn'; name: string; email?: string; imageUrl?: string }

interface AccountCardViewProps {
  state: AccountCardState
  onSignIn: () => void
  onOpenAccount: () => void
  onRetry: () => void
}

const AVATAR_SIZE = 44

/**
 * The Vescape Account as the top card of the Profile tab: who you are, or one button to sign in.
 *
 * Credential provisioning is part of the identity, not a separate widget, so a failed exchange
 * turns the card into a retry rather than leaving a signed-in rider with a dead account.
 */
export function AccountCardView({ state, onSignIn, onOpenAccount, onRetry }: AccountCardViewProps) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  const errorColor = useResolvedColor(theme.status.error.color)

  if (state.kind === 'loading') {
    return (
      <Card testID="account-card">
        <View style={styles.row}>
          <Avatar />
          <View style={styles.body}>
            <Text style={styles.title}>Checking account…</Text>
          </View>
          <ActivityIndicator size="small" color={mutedColor} />
        </View>
      </Card>
    )
  }

  if (state.kind === 'signedOut') {
    return (
      <Card testID="account-card">
        <View style={styles.row}>
          <Avatar />
          <View style={styles.body}>
            <Text style={styles.title}>Vescape account</Text>
            <CardDescription>Sign in or create an account</CardDescription>
          </View>
          <Button label="Sign in" variant="primary" onPress={onSignIn} testID="account-sign-in" />
        </View>
      </Card>
    )
  }

  if (state.kind === 'failed') {
    return (
      <Card style={styles.failedCard} testID="account-card">
        <View style={styles.row}>
          <Avatar imageUrl={state.imageUrl} />
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={1}>
              {state.name}
            </Text>
            <CardDescription style={{ color: theme.status.error.text }}>
              Account not connected
            </CardDescription>
          </View>
          <Button
            label="Retry"
            icon={IconRefresh}
            variant="outline"
            color={theme.status.error.color}
            onPress={onRetry}
            testID="account-retry"
          />
        </View>
      </Card>
    )
  }

  const provisioning = state.kind === 'provisioning'
  return (
    <Card
      onPress={onOpenAccount}
      accessibilityLabel={`Account, ${state.name}`}
      testID="account-card"
    >
      <View style={styles.row}>
        <Avatar imageUrl={state.imageUrl} />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {state.name}
          </Text>
          {provisioning ? (
            <CardDescription>Connecting account…</CardDescription>
          ) : state.email && state.email !== state.name ? (
            <CardDescription>{state.email}</CardDescription>
          ) : null}
        </View>
        {provisioning ? (
          <ActivityIndicator size="small" color={mutedColor} />
        ) : (
          <IconChevronRight size={18} color={mutedColor} />
        )}
      </View>
    </Card>
  )
}

/** The rider's picture, or a neutral person glyph while there is none. */
function Avatar({ imageUrl }: { imageUrl?: string }) {
  const mutedColor = useResolvedColor(theme.ui.mutedForeground)
  return imageUrl ? (
    <Image source={imageUrl} style={styles.avatar} contentFit="cover" />
  ) : (
    <View style={[styles.avatar, styles.avatarEmpty]}>
      <IconUser size={22} color={mutedColor} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.muted,
  },
  failedCard: {
    borderColor: theme.status.error.border,
    backgroundColor: theme.status.error.bg,
  },
})
