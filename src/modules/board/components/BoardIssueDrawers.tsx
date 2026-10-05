import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { BoardWarningsSheet } from '@/modules/board/components/BoardWarningsSheet'
import { VescFaultsDrawer } from '@/modules/board/components/VescFaultsDrawer'
import { severityStatus } from '@/modules/board/constants/boardWarnings'
import type { BoardIssues } from '@/modules/board/hooks/useBoardIssues'

interface BoardIssueDrawersProps {
  issues: BoardIssues
  activeBoardId: string | null
  sessionBoardId: string | null
  warningsOpen: boolean
  faultsOpen: boolean
  onCloseWarnings: () => void
  onCloseFaults: () => void
}

/**
 * The two trouble drawers, mounted once above every surface that can open them — the pill badges
 * and the board selector's links strip both point here rather than owning a copy.
 */
export function BoardIssueDrawers({
  issues,
  activeBoardId,
  sessionBoardId,
  warningsOpen,
  faultsOpen,
  onCloseWarnings,
  onCloseFaults,
}: BoardIssueDrawersProps) {
  return (
    <>
      {issues.warningsEnabled && activeBoardId && (
        <Drawer
          visible={warningsOpen}
          title="Warnings"
          description="What Vescape found wrong with this board."
          headerRight={
            issues.warningCount > 0 ? (
              <Badge
                label={`${issues.warningCount} open`}
                color={severityStatus(issues.severity ?? 'warn').text}
              />
            ) : undefined
          }
          onClose={onCloseWarnings}
        >
          <BoardWarningsSheet boardId={activeBoardId} warnings={issues.warnings} />
        </Drawer>
      )}
      {issues.faultsEnabled && sessionBoardId && (
        <VescFaultsDrawer
          visible={faultsOpen}
          boardId={sessionBoardId}
          faults={issues.faults}
          onClose={onCloseFaults}
        />
      )}
    </>
  )
}
