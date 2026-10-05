import { useCallback, useRef } from 'react'
import { router } from 'expo-router'
import { useShallow } from 'zustand/react/shallow'

import { useBoardStore } from '@/modules/board/store/boardStore'
import { useBleStore } from '@/modules/board/store/bleStore'
import { routes } from '@/navigation/routes'
import { boardNeedsLink } from '@/modules/board/lib/boardTransport'
import { recordingStateFrom } from '@/modules/board/lib/boardConnection'
import { switchBoard } from '@/modules/board/lib/boardSwitch'

function isBoardBusy(status: string): boolean {
  return (
    status === 'connecting' ||
    status === 'discovering' ||
    status === 'subscribing' ||
    status === 'connected' ||
    status === 'stale' ||
    status === 'waiting_for_telemetry' ||
    status === 'reconnecting' ||
    status === 'rescanning' ||
    status === 'disconnecting'
  )
}

export function useBoardConnection() {
  const boardSwitchInFlight = useRef<Promise<void> | null>(null)
  const { boards, activeBoardId, setActiveBoard } = useBoardStore(
    useShallow((s) => ({
      boards: s.boards,
      activeBoardId: s.activeBoardId,
      setActiveBoard: s.setActiveBoard,
    })),
  )
  const {
    status: bleStatus,
    nativeStateReady,
    stopScan,
    connect,
    disconnect,
    telemetryRecordingEnabled,
    telemetryRecordingPaused,
    startTelemetryRecording,
    stopTelemetryRecording,
  } = useBleStore(
    useShallow((s) => ({
      status: s.status,
      nativeStateReady: s.nativeStateReady,
      stopScan: s.stopScan,
      connect: s.connect,
      disconnect: s.disconnect,
      telemetryRecordingEnabled: s.telemetryRecordingEnabled,
      telemetryRecordingPaused: s.telemetryRecordingPaused,
      startTelemetryRecording: s.startTelemetryRecording,
      stopTelemetryRecording: s.stopTelemetryRecording,
    })),
  )
  const recordingState = recordingStateFrom(telemetryRecordingEnabled, telemetryRecordingPaused)

  const activeBoard = boards.find((b) => b.id === activeBoardId)

  const handleSelectBoard = useCallback(
    async (id: string) => {
      if (boardSwitchInFlight.current) return

      const switching = switchBoard(activeBoardId, id, {
        stopTelemetryRecording,
        disconnect,
        setActiveBoard,
      })
      boardSwitchInFlight.current = switching
      try {
        await switching
      } finally {
        if (boardSwitchInFlight.current === switching) {
          boardSwitchInFlight.current = null
        }
      }
    },
    [activeBoardId, disconnect, setActiveBoard, stopTelemetryRecording],
  )

  // Tapping a board in the list is the pick and the connect in one step. An unlinked Board can't
  // start a Board Session; route to the link/probe flow instead.
  const handleConnectBoard = useCallback(
    async (id: string) => {
      await handleSelectBoard(id)
      const board = boards.find((b) => b.id === id)
      if (!board) return
      if (boardNeedsLink(board)) {
        router.push({ pathname: routes.editBoardLink, params: { boardId: board.id } })
        return
      }
      void connect(id)
    },
    [boards, connect, handleSelectBoard],
  )

  const handleAddBoard = useCallback(() => {
    router.push(routes.addBoard)
  }, [])

  const handleCancel = useCallback(() => {
    const { status } = useBleStore.getState()
    if (isBoardBusy(status)) {
      void disconnect()
    } else {
      stopScan()
    }
  }, [stopScan, disconnect])

  const handleRetryConnect = useCallback(() => {
    if (!activeBoard) return
    // An unlinked Board can't start a Board Session; route to the link/probe flow.
    if (boardNeedsLink(activeBoard)) {
      router.push({ pathname: routes.editBoardLink, params: { boardId: activeBoard.id } })
      return
    }
    void connect(activeBoard.id)
  }, [activeBoard, connect])

  return {
    boards,
    activeBoard,
    activeBoardId,
    nativeStateReady,
    bleStatus,
    recordingState,
    handleConnectBoard,
    handleAddBoard,
    handleCancel,
    handleRetryConnect,
    handleEndRide: stopTelemetryRecording,
    handleStartRecording: startTelemetryRecording,
  }
}
