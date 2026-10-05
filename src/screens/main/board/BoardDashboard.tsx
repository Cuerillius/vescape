import type { Board } from '@/modules/board/store/boardStore'
import { BoardDetails } from '@/screens/main/board/BoardDetails'
import { BoardsList } from '@/screens/main/board/BoardsList'
import type { BoardView } from '@/screens/main/board/boardStatus'
import { CoverTabView } from '@/screens/main/CoverTabView'

interface BoardDashboardProps {
  visible: boolean
  view: BoardView
  boards: Board[]
  activeBoardId: string | null
  activeBoard: Board | undefined
  bleStatus: string
  onConnectBoard: (id: string) => void
  onDisconnect: () => void
  onOpenLegalLimits: () => void
  onAddBoard: () => void
}

/**
 * The Board view. With no board connected it lists the saved boards, where a tap connects one;
 * once a board is live it becomes that board's page. Stays mounted and fades like the Ride
 * dashboard.
 */
export function BoardDashboard({
  visible,
  view,
  boards,
  activeBoardId,
  activeBoard,
  bleStatus,
  onConnectBoard,
  onDisconnect,
  onOpenLegalLimits,
  onAddBoard,
}: BoardDashboardProps) {
  return (
    <CoverTabView visible={visible} testID="board-dashboard">
      {view === 'board' && activeBoard ? (
        <BoardDetails board={activeBoard} onOpenLegalLimits={onOpenLegalLimits} />
      ) : (
        <BoardsList
          boards={boards}
          activeBoardId={activeBoardId}
          bleStatus={bleStatus}
          onConnectBoard={onConnectBoard}
          onDisconnect={onDisconnect}
          onAddBoard={onAddBoard}
        />
      )}
    </CoverTabView>
  )
}
