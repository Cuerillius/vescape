import { canRunFirmwareCommand } from '@/modules/board/lib/boardLinkIntegrity'
import { useBleStore } from '@/modules/board/store/bleStore'

/** The board is live on a trusted link, so firmware commands (lights, tune writes) may run. */
export function useFirmwareCommandsReady(): boolean {
  return useBleStore(
    (state) => state.status === 'connected' && canRunFirmwareCommand(state.linkIntegrity),
  )
}
