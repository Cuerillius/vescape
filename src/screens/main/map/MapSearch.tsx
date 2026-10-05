import IconMapPin from '@tabler/icons-react-native/IconMapPin'
import IconSearch from '@tabler/icons-react-native/IconSearch'
import IconX from '@tabler/icons-react-native/IconX'
import { useCallback, useEffect, type RefObject } from 'react'
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { useMapSearch } from '@/modules/map/hooks/useMapSearch'
import type { MapSearchResult } from '@/modules/map/lib/search'
import { MapVignette } from '@/screens/main/map/MapVignette'

/** Place search: a bar that is always there, with its results folding out beneath it. */
export function MapSearch({
  top,
  searchProximity,
  dismissRef,
  onSelectResult,
}: {
  top: number
  searchProximity: { latitude: number; longitude: number } | null
  /** Filled with a function that clears the query and the keyboard, for taps on the map. */
  dismissRef: RefObject<(() => void) | null>
  onSelectResult: (result: MapSearchResult) => void
}) {
  const foreground = useResolvedColor(theme.ui.foreground)
  const muted = useResolvedColor(theme.ui.mutedForeground)
  const {
    searchQuery,
    searchResults,
    searchLoading,
    searchError,
    handleSearchQueryChange,
    submitSearch,
  } = useMapSearch({ searchOpen: true, proximityLocation: searchProximity })

  const dismiss = useCallback(() => {
    Keyboard.dismiss()
    handleSearchQueryChange('')
  }, [handleSearchQueryChange])

  useEffect(() => {
    dismissRef.current = dismiss
    return () => {
      dismissRef.current = null
    }
  }, [dismiss, dismissRef])

  const handleSubmit = useCallback(async () => {
    const first = searchResults[0]
    if (first) {
      onSelectResult(first)
      return
    }
    const submittedResult = await submitSearch()
    if (submittedResult) onSelectResult(submittedResult)
  }, [onSelectResult, searchResults, submitSearch])

  const showNoResults =
    !searchLoading && !searchError && searchQuery.trim().length >= 2 && searchResults.length === 0
  const showResults =
    searchLoading || searchError != null || showNoResults || searchResults.length > 0

  return (
    <>
      {showResults ? <MapVignette mode="map" idPrefix="search-map-vignette" topOnly /> : null}
      <View style={[styles.sheet, { top }]}>
        <View style={styles.bar}>
          <IconSearch size={24} color={muted} />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onSubmitEditing={() => void handleSubmit()}
            placeholder="Address or place"
            placeholderTextColor={muted}
            returnKeyType="search"
            style={[styles.input, { color: foreground }]}
          />
          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              onPress={dismiss}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            >
              <IconX size={22} color={muted} />
            </Pressable>
          ) : null}
        </View>
        {showResults ? (
          <View style={styles.results}>
            {searchLoading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={muted} />
                <Text style={styles.statusText}>Searching</Text>
              </View>
            ) : null}
            {searchError ? (
              <View style={styles.statusRow}>
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            ) : null}
            {showNoResults ? (
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>No results</Text>
              </View>
            ) : null}
            {searchResults.map((result) => (
              <Pressable
                key={result.id}
                accessibilityRole="button"
                style={({ pressed }) => [styles.result, pressed && styles.pressed]}
                onPress={() => onSelectResult(result)}
              >
                <IconMapPin size={18} color={muted} />
                <View style={styles.resultText}>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {result.title}
                  </Text>
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {result.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 44,
    overflow: 'hidden',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.card,
  },
  bar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    paddingVertical: 8,
  },
  close: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  results: {
    borderTopWidth: 1,
    borderTopColor: theme.ui.border,
  },
  statusRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  statusText: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
  },
  errorText: {
    color: theme.status.error.text,
    fontSize: 13,
  },
  result: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.ui.border,
  },
  resultText: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  resultSubtitle: {
    color: theme.ui.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
})
