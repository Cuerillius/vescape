import { useCallback, useEffect, useMemo, useState } from 'react'

import { useHistoryAutoRefresh } from '@/modules/history/hooks/useHistoryAutoRefresh'
import { favoriteToSession } from '@/modules/history/lib/favorites'
import type { HistorySession } from '@/modules/history/lib/sessions'
import { useFavoriteStore, type Favorite } from '@/modules/history/store/favoriteStore'
import { useHistoryStore } from '@/modules/history/store/historyStore'

export interface ProfileFavorite {
  favorite: Favorite
  /** The ride the Favorite was cut from, as the list and the map's History view open it. */
  session: HistorySession
}

/**
 * The rides and Favorites the Profile tab lists, loaded while it is on screen. One hook so the
 * Last rides section and the full list read the same data and neither reloads the other's.
 */
export function useProfileRides(active: boolean) {
  const [ridesLoaded, setRidesLoaded] = useState(false)
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const blocks = useHistoryStore((state) => state.blocks)
  const sessions = useHistoryStore((state) => state.sessions)
  const ridesLoading = useHistoryStore((state) => state.loading)
  const ridesError = useHistoryStore((state) => state.error)
  const hasMoreRides = useHistoryStore((state) => state.hasMore)
  const favorites = useFavoriteStore((state) => state.favorites)
  const favoritesLoading = useFavoriteStore((state) => state.loading)
  const favoritesError = useFavoriteStore((state) => state.error)
  const loadFavorites = useFavoriteStore((state) => state.load)

  useHistoryAutoRefresh(active)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    setRidesLoaded(false)
    setFavoritesLoaded(false)
    void useHistoryStore
      .getState()
      .loadInitial()
      .then(() => {
        if (!cancelled) setRidesLoaded(true)
      })
    void loadFavorites().then(() => {
      if (!cancelled) setFavoritesLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [active, loadFavorites])

  const profileFavorites = useMemo<ProfileFavorite[]>(
    () => favorites.map((favorite) => ({ favorite, session: favoriteToSession(favorite, blocks) })),
    [blocks, favorites],
  )

  const loadMoreRides = useCallback(() => void useHistoryStore.getState().loadMore(), [])

  return {
    sessions,
    ridesLoaded,
    ridesLoading,
    ridesError,
    hasMoreRides,
    loadMoreRides,
    favorites: profileFavorites,
    favoritesLoaded,
    favoritesLoading,
    favoritesError,
    loadFavorites,
  }
}

export type ProfileRidesData = ReturnType<typeof useProfileRides>
