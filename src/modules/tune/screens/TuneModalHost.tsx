import { ConfirmModal } from '@/components/modals/ConfirmModal'
import { InfoModal } from '@/components/modals/InfoModal'
import { TextPromptModal } from '@/components/modals/TextPromptModal'
import { BoardPickerModal } from '@/modules/tune/components/BoardPickerModal'
import { TuneEditorDrawer } from '@/modules/tune/components/TuneEditorDrawer'
import { PromptDialog } from '@/components/ui/PromptDialog'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import type { useTuneModals } from '@/modules/tune/hooks/useTuneModals'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { createTuneModalOperationRunner } from './tuneModalOperationRunner'

/** Every modal the Tune screen can raise, driven by one `useTuneModals` state bag. */
export function TuneModalHost({ modals }: { modals: ReturnType<typeof useTuneModals> }) {
  const router = useRouter()
  const error = useTuneProfileStore((state) => state.error)
  const [pending, setPending] = useState(false)
  const runRef = useRef<ReturnType<typeof createTuneModalOperationRunner> | null>(null)
  if (runRef.current == null) runRef.current = createTuneModalOperationRunner(setPending)
  const run = runRef.current
  return (
    <>
      <InfoModal
        visible={modals.infoModal != null}
        title={modals.infoModal?.title ?? ''}
        message={modals.infoModal?.message ?? ''}
        onDismiss={() => modals.setInfoModal(null)}
      />

      <TuneEditorDrawer
        target={modals.editor}
        onCommit={modals.handleEditorApply}
        onClose={modals.closeEditor}
      />

      <PromptDialog
        visible={modals.metadataModalProfile != null}
        title="Edit name"
        confirmLabel="Save"
        placeholder="Tune name"
        loading={pending}
        error={error}
        initialValue={modals.metadataModalProfile?.name ?? ''}
        onConfirm={(name) => {
          const profile = modals.metadataModalProfile
          if (profile) {
            run(
              () => modals.storeRenameProfile(profile.id, name, profile.icon, profile.color),
              () => modals.setMetadataModalProfile(null),
            )
          }
        }}
        onDismiss={() => modals.setMetadataModalProfile(null)}
      />

      <BoardPickerModal
        visible={modals.copySourceProfile != null && modals.copyTargetBoard == null}
        boards={modals.otherBoards}
        onSelect={modals.handleCopyToBoard}
        onDismiss={() => modals.setCopySourceProfile(null)}
      />

      <TextPromptModal
        visible={modals.copyTargetBoard != null}
        title={`Copy to ${modals.copyTargetBoard?.name ?? 'board'}`}
        placeholder="Profile name"
        initialValue={modals.copySourceProfile ? `${modals.copySourceProfile.name} (copy)` : ''}
        confirmLabel="Copy"
        loading={pending}
        error={error}
        onConfirm={(name) => run(() => modals.handleCopyConfirm(name))}
        onDismiss={() => {
          modals.setCopyTargetBoard(null)
          modals.setCopySourceProfile(null)
        }}
      />

      <ConfirmModal
        visible={modals.deleteConfirmProfile != null}
        title="Delete Profile"
        message={`Delete "${modals.deleteConfirmProfile?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={pending}
        error={error}
        onConfirm={() => {
          if (modals.deleteConfirmProfile) {
            run(
              () => modals.storeDeleteProfile(modals.deleteConfirmProfile!.id),
              () => {
                modals.setDeleteConfirmProfile(null)
                // This screen is that tune's detail page; with the tune gone there is nothing to show.
                router.back()
              },
            )
          }
        }}
        onCancel={() => modals.setDeleteConfirmProfile(null)}
      />
    </>
  )
}
