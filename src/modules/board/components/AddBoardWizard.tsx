import type { RefObject } from 'react'
import type { ScrollView } from 'react-native'

import { ConfirmStep } from '@/modules/board/components/add-board-wizard/ConfirmStep'
import { SetupStep } from '@/modules/board/components/add-board-wizard/SetupStep'
import { ScanStep } from '@/modules/board/components/add-board-wizard/ScanStep'
import { WizardProgress } from '@/modules/board/components/add-board-wizard/WizardProgress'
import type { UseAddBoardWizard } from '@/modules/board/hooks/useAddBoardWizard'

interface Props {
  wizard: UseAddBoardWizard
  onLinkActiveStepIndexChange?: (index: number) => void
  scrollRef?: RefObject<ScrollView | null>
}

export function AddBoardWizard({ wizard, onLinkActiveStepIndexChange, scrollRef }: Props) {
  return (
    <>
      <WizardProgress steps={wizard.steps} step={wizard.step} />
      {wizard.stepId === 'scan' && (
        <ScanStep
          wizard={wizard}
          scrollRef={scrollRef}
          onLinkActiveStepIndexChange={onLinkActiveStepIndexChange}
        />
      )}
      {wizard.stepId === 'setup' && <SetupStep wizard={wizard} />}
      {wizard.stepId === 'confirm' && <ConfirmStep wizard={wizard} />}
    </>
  )
}
