import { useEffect, useState } from 'react'

import { deriveGpsStatusBadge, type GpsStatusBadge } from '@/modules/location/lib/gpsStatusBadge'
import { useLocationStore } from '@/modules/location/store/locationStore'

const STALE_CHECK_INTERVAL_MS = 5_000

/**
 * The live GPS badge: what is wrong with GPS right now, or `null` while it is healthy. Re-checks on
 * a timer because a fix going stale is the absence of an update, so nothing else would re-render.
 */
export function useGpsStatusBadge(): GpsStatusBadge | null {
  const phase = useLocationStore((s) => s.gpsStatus)
  const latestFix = useLocationStore((s) => s.latestApproximateLocation)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    setNowMs(Date.now())
    const id = setInterval(() => setNowMs(Date.now()), STALE_CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [latestFix])

  return deriveGpsStatusBadge({ phase, latestFix, nowMs })
}
