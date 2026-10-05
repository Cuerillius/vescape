import { useCallback, useEffect, useRef, useState } from 'react'

import type { Board } from '@/modules/board/store/boardStore'

export function useEditBoardForm({
  board,
  updateBoard,
}: {
  board: Board | undefined
  updateBoard: (board: Board) => Promise<void>
}) {
  const boardRef = useRef<Board | undefined>(board)
  const syncedBoardIdRef = useRef<string | null>(null)
  const [name, setName] = useState(board?.name ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    boardRef.current = board
    if (!board || syncedBoardIdRef.current === board.id) return

    setName(board.name)
    syncedBoardIdRef.current = board.id
  }, [board])

  const saveName = useCallback(
    async (value: string) => {
      setName(value)
      const current = boardRef.current
      if (!current) return
      const next = { ...current, name: value.trim() }
      boardRef.current = next
      setSaving(true)
      try {
        await updateBoard(next)
      } finally {
        setSaving(false)
      }
    },
    [updateBoard],
  )

  return { name, saving, saveName }
}
