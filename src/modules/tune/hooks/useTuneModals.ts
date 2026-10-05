import { useCallback, useMemo, useState } from 'react'
import type { RefloatConfigField, TuneProfile, TuneProfileFieldValue } from 'vescape-core'

import type { FieldEditorTarget } from '@/modules/tune/components/TuneEditorDrawer'
import type { Board } from '@/modules/board/store/boardStore'
import { useTuneProfileStore } from '@/modules/tune/store/tuneProfileStore'
import { APP_TUNE_FIELD_BY_ID, formatTuneValue, tuneDisplayScale } from '@/modules/tune/lib/fields'
import {
  BASIC_SLIDER_BY_ID,
  basicSliderChanges,
  fieldHelp,
  fieldStep,
  getLinkedFieldPreviews,
  isEditableNumberField,
  type BasicSliderItem,
} from '@/modules/tune/lib/sliderDefinitions'
import { DASH } from '@/helpers/format'

type InfoModalState = { title: string; message: string } | null
type EditorKind = { kind: 'field'; fieldId: string } | { kind: 'basic'; sliderId: string }

export function useTuneModals(
  activeProfile: TuneProfile | null,
  basicSliders: BasicSliderItem[],
  draftFields: Record<string, TuneProfileFieldValue>,
  allBoards: Board[],
  selectedBoardId: string | null,
) {
  const editFields = useTuneProfileStore((s) => s.editFields)
  const storeRenameProfile = useTuneProfileStore((s) => s.renameProfile)
  const storeDeleteProfile = useTuneProfileStore((s) => s.deleteProfile)
  const storeCopyProfile = useTuneProfileStore((s) => s.copyProfileToBoard)

  const [infoModal, setInfoModal] = useState<InfoModalState>(null)
  const [editor, setEditor] = useState<FieldEditorTarget | null>(null)
  const [editorKind, setEditorKind] = useState<EditorKind | null>(null)
  const [metadataModalProfile, setMetadataModalProfile] = useState<TuneProfile | null>(null)
  const [copySourceProfile, setCopySourceProfile] = useState<TuneProfile | null>(null)
  const [copyTargetBoard, setCopyTargetBoard] = useState<Board | null>(null)
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<TuneProfile | null>(null)

  const showBadgeInfo = useCallback((title: string, message: string) => {
    setInfoModal({ title, message })
  }, [])

  const showFieldInfo = useCallback((field: RefloatConfigField) => {
    const scale = tuneDisplayScale(field.id)
    const limits =
      field.min != null || field.max != null
        ? `\n\nRange: ${field.min != null ? formatTuneValue(field.min * scale) : DASH} to ${
            field.max != null ? formatTuneValue(field.max * scale) : DASH
          }${field.unit ? ` ${field.unit}` : ''}`
        : ''
    const units = field.unit ? `\nUnit: ${field.unit}` : ''
    setInfoModal({
      title: field.label,
      message: `${fieldHelp(field)}${units}${limits}\nField ID: ${field.id}`,
    })
  }, [])

  const openFieldEditor = useCallback(
    (field: RefloatConfigField) => {
      if (!activeProfile) {
        showFieldInfo(field)
        return
      }
      if (!isEditableNumberField(field)) {
        showBadgeInfo(
          field.label,
          `${fieldHelp(field)}\n\nThis field is not numeric or has no schema bounds, so it cannot use the slider editor yet.\nField ID: ${field.id}`,
        )
        return
      }
      const scale = tuneDisplayScale(field.id)
      setEditorKind({ kind: 'field', fieldId: field.id })
      setEditor({
        label: field.label,
        fieldId: field.id,
        value: (field.value as number) * scale,
        min: field.min! * scale,
        max: field.max! * scale,
        step: fieldStep(field) * scale,
        manualDecimals: APP_TUNE_FIELD_BY_ID.get(field.id)?.manualDecimals ?? 3,
        unit: field.unit,
        help: fieldHelp(field),
      })
    },
    [activeProfile, showBadgeInfo, showFieldInfo],
  )

  const openBasicSliderEditor = useCallback(
    (sliderId: string) => {
      if (!activeProfile) return
      const def = BASIC_SLIDER_BY_ID.get(sliderId)
      const item = basicSliders.find((s) => s.id === sliderId)
      if (!def || !item) return
      setEditorKind({ kind: 'basic', sliderId })
      setEditor({
        label: item.label,
        description: item.description,
        fieldId: item.id,
        value: item.value ?? item.min,
        min: item.min,
        max: item.max,
        step: item.step,
        unit: null,
        help: `${item.info}\n\nSource: ${item.source}`,
        linkedFields: getLinkedFieldPreviews(def).map((field) => {
          const value = draftFields[field.id] ?? activeProfile.fields[field.id]
          return { ...field, currentValue: typeof value === 'number' ? value : undefined }
        }),
      })
    },
    [activeProfile, basicSliders, draftFields],
  )

  const handleEditorApply = useCallback(
    (value: number, linkedFieldValues?: Record<string, number>) => {
      if (!editorKind || !editor) return
      const def = editorKind.kind === 'basic' ? BASIC_SLIDER_BY_ID.get(editorKind.sliderId) : null
      const fieldValues =
        editorKind.kind === 'field'
          ? { [editorKind.fieldId]: value / tuneDisplayScale(editorKind.fieldId) }
          : def
            ? basicSliderChanges(def, value, editor.value, linkedFieldValues)
            : {}
      // intentional-suppression: a failed save keeps the edit and the store renders the error
      void editFields(fieldValues).catch(() => undefined)
      setEditor(null)
      setEditorKind(null)
    },
    [editorKind, editor, editFields],
  )

  const closeEditor = useCallback(() => {
    setEditor(null)
    setEditorKind(null)
  }, [])

  const handleCopyToBoard = useCallback((board: Board) => {
    setCopyTargetBoard(board)
  }, [])

  const handleCopyConfirm = useCallback(
    async (name: string) => {
      if (!copySourceProfile || !copyTargetBoard) return
      await storeCopyProfile(copySourceProfile.id, copyTargetBoard.id, name)
      setCopySourceProfile(null)
      setCopyTargetBoard(null)
    },
    [copySourceProfile, copyTargetBoard, storeCopyProfile],
  )

  const otherBoards = useMemo(
    () => allBoards.filter((b) => b.id !== selectedBoardId),
    [allBoards, selectedBoardId],
  )

  return {
    infoModal,
    setInfoModal,
    editor,
    editorKind,
    metadataModalProfile,
    setMetadataModalProfile,
    copySourceProfile,
    setCopySourceProfile,
    copyTargetBoard,
    setCopyTargetBoard,
    deleteConfirmProfile,
    setDeleteConfirmProfile,
    showBadgeInfo,
    showFieldInfo,
    openFieldEditor,
    openBasicSliderEditor,
    handleEditorApply,
    closeEditor,
    handleCopyToBoard,
    handleCopyConfirm,
    otherBoards,
    storeRenameProfile,
    storeDeleteProfile,
  }
}
