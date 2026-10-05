import { useCallback, useState } from 'react'

import { uniqueTuneName } from '@/modules/tune/store/tuneProfileHelpers'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { useTuneSnapshotStore } from '@/modules/tune/store/tuneSnapshotStore'

/** Name of a tune created straight from the board; the rider renames it on its detail page. */
const NEW_TUNE_NAME = 'New tune'

/**
 * Creates a Tune Profile from what the board runs now. Reads the board fresh instead of trusting
 * the Last Known values, so the new tune matches the board. Rejects when the board cannot be read
 * or the tune cannot be saved; the caller shows the failure.
 */
export function useCreateTune(existingNames: string[]) {
  const readSnapshot = useTuneSnapshotStore((state) => state.read)
  const setBoardSnapshot = useTuneProfileStore((state) => state.setBoardSnapshot)
  const createProfile = useTuneProfileStore((state) => state.createProfile)
  const [creating, setCreating] = useState(false)

  const create = useCallback(async () => {
    setCreating(true)
    try {
      const fresh = await readSnapshot()
      if (!fresh) throw new Error('Could not read the board.')
      setBoardSnapshot(fresh)
      const created = await createProfile(uniqueTuneName(NEW_TUNE_NAME, existingNames), '', '')
      if (!created) throw new Error('Could not create the tune.')
      return created
    } finally {
      setCreating(false)
    }
  }, [createProfile, existingNames, readSnapshot, setBoardSnapshot])

  return { create, creating }
}
