import { useUser } from '@clerk/expo'
import { useRouter } from 'expo-router'

import {
  AccountCardView,
  type AccountCardState,
} from '@/modules/profile/components/AccountCardView'
import { useDeviceAuthStore } from '@/modules/profile/store/deviceAuthStore'
import { routes } from '@/navigation/routes'

/** The Vescape Account card, wired to Clerk and the device credential. */
export function AccountCard() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const deviceAuthStatus = useDeviceAuthStore((s) => s.status)
  const retryDeviceAuth = useDeviceAuthStore((s) => s.retry)

  let state: AccountCardState
  if (!isLoaded) {
    state = { kind: 'loading' }
  } else if (!isSignedIn) {
    state = { kind: 'signedOut' }
  } else {
    const email = user.primaryEmailAddress?.emailAddress
    const identity = {
      name: user.fullName ?? email ?? 'Vescape rider',
      imageUrl: user.imageUrl || undefined,
    }
    state =
      deviceAuthStatus === 'failed'
        ? { kind: 'failed', ...identity }
        : deviceAuthStatus === 'provisioning'
          ? { kind: 'provisioning', ...identity }
          : { kind: 'signedIn', ...identity, email }
  }

  return (
    <AccountCardView
      state={state}
      onSignIn={() => router.push(routes.signIn)}
      onOpenAccount={() => router.push(routes.account)}
      onRetry={retryDeviceAuth}
    />
  )
}
