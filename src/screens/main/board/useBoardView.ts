import { useState } from 'react'

import { isLive } from '@/modules/board/lib/boardConnection'
import { boardViewFor, type BoardView } from '@/screens/main/board/boardStatus'

/** Which face the Board tab shows, kept in one place so the tab's label and its screen agree. */
export function useBoardView(bleStatus: string): BoardView {
  const [view, setView] = useState<BoardView>(() => (isLive(bleStatus) ? 'board' : 'list'))

  // Follows the connection from render rather than an effect, so the label and the screen change
  // in the same pass.
  const next = boardViewFor(view, bleStatus)
  if (next !== view) setView(next)

  return next
}
