import type { ReactNode } from 'react'
import type { VescFaultOccurrence } from 'vescape-core'

import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { theme } from '@/constants/theme'
import { VescFaultsSheet } from '@/modules/board/components/VescFaultsSheet'

interface VescFaultsDrawerProps {
  visible: boolean
  boardId: string
  faults: VescFaultOccurrence[]
  onClose: () => void
  /** Replaces the live sheet, so the showcase can fill the drawer without a board. */
  children?: ReactNode
}

/** The bottom drawer listing a Board's VESC Fault occurrences and the controller's fault log. */
export function VescFaultsDrawer({
  visible,
  boardId,
  faults,
  onClose,
  children,
}: VescFaultsDrawerProps) {
  const open = faults.filter((fault) => !fault.dismissed).length
  return (
    <Drawer
      visible={visible}
      title="VESC faults"
      description="What the controller itself reported."
      headerRight={
        open > 0 ? <Badge label={`${open} open`} color={theme.status.warning.text} /> : undefined
      }
      onClose={onClose}
    >
      {children ?? (
        <VescFaultsSheet key={boardId} boardId={boardId} faults={faults} visible={visible} />
      )}
    </Drawer>
  )
}
