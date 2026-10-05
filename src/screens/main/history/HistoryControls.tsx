import { StyleSheet, View } from 'react-native'
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconX from '@tabler/icons-react-native/IconX'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ToggleGroup } from '@/components/ui/ToggleGroup'
import type { HistoryTab } from '@/screens/main/mainScreenStore'

interface HistoryControlsProps {
  tab: HistoryTab
  /** Trim mode swaps the tabs for a cancel/save pair around the Favorite's name. */
  trimming: boolean
  saving: boolean
  trimName: string
  trimNamePlaceholder?: string
  onTrimNameChange: (name: string) => void
  onSelectTab: (tab: HistoryTab) => void
  onBack: () => void
  onCancelTrim: () => void
  onSaveTrim: () => void
}

/**
 * The top of the History view, over the map: the Favorite trimmer's name bar, or, with no ride
 * open, back and the History/Favorites switch. An open ride has its controls above its panel.
 */
export function HistoryControls({
  tab,
  trimming,
  saving,
  trimName,
  trimNamePlaceholder = 'Favorite name',
  onTrimNameChange,
  onSelectTab,
  onBack,
  onCancelTrim,
  onSaveTrim,
}: HistoryControlsProps) {
  const insets = useSafeAreaInsets()

  if (trimming) {
    return (
      <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 8) }]} pointerEvents="box-none">
        <View style={styles.row}>
          <Button
            icon={IconX}
            variant="floating"
            size="lg"
            onPress={onCancelTrim}
            disabled={saving}
            testID="trim-cancel"
            accessibilityLabel="Cancel Favorite edit"
          />
          <View style={styles.headerTitleWrap}>
            <Input
              testID="trim-favorite-name"
              value={trimName}
              onChangeText={onTrimNameChange}
              placeholder={trimNamePlaceholder}
              editable={!saving}
              // Renaming replaces the old name far more often than it appends to it, and the
              // inline board-name field already behaves this way.
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={onSaveTrim}
              style={styles.nameInput}
            />
          </View>
          <Button
            icon={IconCheck}
            variant="primary"
            size="lg"
            onPress={onSaveTrim}
            loading={saving}
            testID="trim-save"
            accessibilityLabel="Save Favorite"
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 8) }]} pointerEvents="box-none">
      <View style={styles.row}>
        <Button
          icon={IconArrowLeft}
          variant="floating"
          testID="history-back"
          onPress={onBack}
          accessibilityLabel="Back"
        />
        <View style={styles.tabsWrap} pointerEvents="box-none">
          <ToggleGroup<HistoryTab>
            activeKey={tab}
            options={[
              { key: 'history', label: 'History', testID: 'history-tab-history' },
              { key: 'favorites', label: 'Favorites', testID: 'history-tab-favorites' },
            ]}
            onSelect={onSelectTab}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    zIndex: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tabsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  nameInput: {
    textAlign: 'center',
  },
})
