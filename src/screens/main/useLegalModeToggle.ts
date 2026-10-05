import { useCallback } from 'react'

import { errorMessage } from '@/helpers/error'
import { useBoardStore } from '@/modules/board/store/boardStore'
import { useLegalModeStore } from '@/modules/legal/store/legalModeStore'

/**
 * Legal Mode state and switch for the active board. `onError` receives a rider-readable message when
 * native rejects the change; each surface decides how to show it.
 */
export function useLegalModeToggle(onError: (message: string) => void) {
  const boardId = useBoardStore((state) => state.activeBoardId)
  const enabled = useBoardStore(
    (state) =>
      state.boards.find((board) => board.id === state.activeBoardId)?.legalMode?.enabled ?? false,
  )
  const setEnabled = useLegalModeStore((state) => state.setEnabled)

  const toggle = useCallback(
    (next: boolean) => {
      if (!boardId) return
      void setEnabled(boardId, next).catch((error: unknown) => {
        onError(errorMessage(error, 'Could not change Legal Mode.'))
      })
    },
    [boardId, setEnabled, onError],
  )

  return { available: boardId != null, enabled, toggle }
}
