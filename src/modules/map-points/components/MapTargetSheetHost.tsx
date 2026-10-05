import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconNavigation from '@tabler/icons-react-native/IconNavigation'
import IconRefresh from '@tabler/icons-react-native/IconRefresh'
import type { MapPoint, MapPointPatch, NavigationProfile, NavigationStatus } from 'vescape-core'

import { ActiveNavigationSheet } from '@/modules/map-points/components/ActiveNavigationSheet'
import { MapTargetSheet } from '@/modules/map-points/components/MapTargetSheet'
import { NavigationProfileSelector } from '@/modules/map/components/NavigationProfileSelector'
import type { MapSelection } from '@/modules/map/lib/mapSelection'

interface MapTargetSheetHostProps {
  /** What the rider just tapped, searched or dropped. Takes the sheet when present. */
  selectedTarget: MapSelection | null
  /** Where the rider is currently navigating. Shown only when nothing else is selected. */
  activeTarget: MapSelection | null
  /** The add menu owns the same corner, so the navigation sheet steps aside while it is open. */
  activeTargetSuppressed: boolean
  bottom: number
  /** Set while the selected Map Point is in its edit draft. */
  editingMapPointId: string | null
  onBeginEdit: (id: string) => void
  onEndEdit: () => void
  onNavigateSelected: () => void
  onCancelNavigation: () => void
  /** The rider accepting the drawn path: the map steps aside and the ride view takes over. */
  onConfirmNavigation: () => void
  /** The rider already accepted this path and returned to the map. */
  activeNavigationAccepted: boolean
  /** Reopens the full path/profile chooser from the compact active state. */
  onEditActiveNavigation: () => void
  navigationRemainingDistanceMeters: number | null
  /** How the path to the active target ended up. `null` while there is no Navigation at all. */
  navigationStatus: NavigationStatus | null
  /** How far the drawn path runs and how long it takes. `null` while no path is drawn. */
  navigationPath: { distanceMeters: number; durationSeconds: number } | null
  /**
   * Native is working on a path right now. Without this the sheet is silent for the length of a
   * Directions call, and a switch that ends up failing never changes anything the rider can see.
   */
  navigationComputing: boolean
  /**
   * Which kind of ways produced the drawn path. `null` while there is no Navigation, which is when
   * the switcher has nothing to be the current state of and is not shown.
   */
  navigationProfile: NavigationProfile | null
  /** Rider-initiated recompute. The only thing that ever replaces a Navigation. */
  onRecomputeNavigation: () => void
  onSelectNavigationProfile: (profile: NavigationProfile) => void
  onDismissSelected: () => void
  onSaveMapPoint: (id: string, patch: MapPointPatch) => Promise<MapPoint | null>
  onVoteMapPoint: (id: string, reaction: 'up' | 'down' | null) => void
  onRemoveMapPoint: (id: string) => void
  onFocusTarget: (target: MapSelection) => void
  /** Gates every write. Returns false when the rider still has to sign in. */
  requireAccount: () => boolean
}

/**
 * Both target sheets the map can show, and the one rule between them: a selection always wins over
 * the active navigation target, so only one sheet is ever on screen.
 */
export function MapTargetSheetHost({
  selectedTarget,
  activeTarget,
  activeTargetSuppressed,
  bottom,
  editingMapPointId,
  onBeginEdit,
  onEndEdit,
  onNavigateSelected,
  onCancelNavigation,
  onConfirmNavigation,
  activeNavigationAccepted,
  onEditActiveNavigation,
  navigationRemainingDistanceMeters,
  navigationStatus,
  navigationPath,
  navigationComputing,
  navigationProfile,
  onRecomputeNavigation,
  onSelectNavigationProfile,
  onDismissSelected,
  onSaveMapPoint,
  onVoteMapPoint,
  onRemoveMapPoint,
  onFocusTarget,
  requireAccount,
}: MapTargetSheetHostProps) {
  if (selectedTarget) {
    const isMapPoint = selectedTarget.type === 'mapPoint'
    const editing = isMapPoint && editingMapPointId === selectedTarget.id
    const ownedByMe = isMapPoint && selectedTarget.point.ownedByMe

    return (
      <MapTargetSheet
        key={selectedTarget.id}
        target={selectedTarget}
        bottom={bottom}
        mode={editing ? 'edit' : 'select'}
        action={{
          label: editing ? 'Save' : 'Navigate',
          accessibilityLabel: editing ? 'Save map feature' : 'Navigate to target',
          Icon: IconNavigation,
          onPress: onNavigateSelected,
        }}
        onEdit={
          ownedByMe
            ? () => {
                if (!requireAccount()) return
                onBeginEdit(selectedTarget.id)
              }
            : undefined
        }
        onSave={onEndEdit}
        onSaveMapPoint={onSaveMapPoint}
        onVoteMapPoint={(id, nextReaction) => {
          if (!requireAccount()) return false
          onVoteMapPoint(id, nextReaction)
          return true
        }}
        onFocusTarget={() => onFocusTarget(selectedTarget)}
        onDelete={
          ownedByMe
            ? () => {
                if (!requireAccount()) return
                onEndEdit()
                onRemoveMapPoint(selectedTarget.id)
              }
            : undefined
        }
        onDismiss={onDismissSelected}
      />
    )
  }

  if (!activeTarget || activeTargetSuppressed) return null

  if (activeNavigationAccepted) {
    return (
      <ActiveNavigationSheet
        target={activeTarget}
        bottom={bottom}
        remainingDistanceMeters={navigationRemainingDistanceMeters}
        durationSeconds={navigationPath?.durationSeconds ?? 0}
        onOpen={onEditActiveNavigation}
        onCancel={onCancelNavigation}
      />
    )
  }

  const failureNotice = navigationStatus ? NAVIGATION_FAILURE_NOTICES[navigationStatus] : null
  // Setting a Direction Point leaves the rider on the map looking at the path, because a path is a
  // proposal: they check where it goes, switch the Profile, ask again — and only then accept it.
  // Accepting is what closes the map, so it leads the row while the other two flank it.
  const confirmAction = {
    label: 'Ride it',
    accessibilityLabel: 'Accept path and return to ride view',
    Icon: IconCheck,
    onPress: onConfirmNavigation,
  }
  // After a failure recompute is the only thing that can change the situation; with a path drawn it
  // is how the rider asks for a fresh one from where they are now. Never happens on its own.
  const recomputeAction = {
    label: failureNotice ? 'Retry' : 'Recompute',
    accessibilityLabel: failureNotice ? 'Retry path to target' : 'Recompute path from here',
    Icon: IconRefresh,
    onPress: onRecomputeNavigation,
  }

  return (
    <MapTargetSheet
      key={activeTarget.id}
      target={activeTarget}
      bottom={bottom}
      mode="navigation"
      action={confirmAction}
      sideAction={recomputeAction}
      onDismiss={onCancelNavigation}
      notice={failureNotice}
      path={navigationPath}
      computing={navigationComputing}
      profileSelector={
        navigationProfile ? (
          <NavigationProfileSelector
            activeProfile={navigationProfile}
            onSelect={onSelectNavigationProfile}
          />
        ) : null
      }
      onFocusTarget={() => onFocusTarget(activeTarget)}
    />
  )
}

/**
 * What the rider is told when no line is drawn. Deliberately says what is missing rather than
 * apologising: the pin, the bearing and the distance are still there, and in a trackless forest
 * that is all the information that exists.
 */
const NAVIGATION_FAILURE_NOTICES: Record<NavigationStatus, string | null> = {
  ready: null,
  fetchFailed: 'No path yet — could not reach routing. Check your signal and retry.',
  noPathFound: 'No path leads here. Ride by the pin, bearing and distance.',
}
