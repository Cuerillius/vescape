import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal'
import IconCheck from '@tabler/icons-react-native/IconCheck'
import IconDeviceFloppy from '@tabler/icons-react-native/IconDeviceFloppy'
import IconPlus from '@tabler/icons-react-native/IconPlus'

import { Text } from '@/components/base/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { TuneCardArt } from '@/modules/tune/components/TuneCardArt'
import {
  statusCardShader,
  tuneCardShader,
  type TuneCardFactors,
  type TuneCardShader,
} from '@/modules/tune/lib/tuneCardArt'

const MIN_HEIGHT = 120
const EDGE = 16
/** The default `Button` height, which the Not saved tag centers on. */
const BUTTON_HEIGHT = 36
/** A button's inset, so its box sits level with the title's text rather than its line box. */
const BUTTON_INSET = EDGE - 4
/** Centers the dots on the action button's row. */
const DOTS_BOTTOM = BUTTON_INSET + (BUTTON_HEIGHT - 6) / 2
/** Lifts the count to sit level with the action button's label. */
const COUNT_BOTTOM = EDGE + 6
/** Room the Edit button or the Not saved tag takes at the top right, so a long name never runs under it. */
const TITLE_RIGHT_RESERVE = 112
const MAX_DOTS = 6

export interface TuningCardPage {
  id: string
  title: string
  art: TuningCardArt
  /** Shows Edit and Apply on the page. A page without it is a plain label. */
  apply?: TuningApplyState
  /**
   * Saves the board's current values as a new tune, in place of Edit and Apply. Nothing is applied:
   * the values come from the board.
   */
  create?: TuningCreateState
  /**
   * The page shows the board's own values, which no saved tune matches: a Not saved tag, and the
   * create button reads Save as tune.
   */
  unsaved?: boolean
}

/** What is drawn behind the title: a tune's terrain, or a plain glow in a state's color. */
export type TuningCardArt =
  | { kind: 'tune'; factors: TuneCardFactors }
  | { kind: 'status'; color: ThemeColor }

/** The look of a page's art; its `ink` is the text color that reads on it. */
function useArtShader(art: TuningCardArt): TuneCardShader {
  const statusColor = useResolvedColor(art.kind === 'status' ? art.color : theme.tune.color)
  return useMemo(
    () => (art.kind === 'tune' ? tuneCardShader(art.factors) : statusCardShader(statusColor)),
    [art, statusColor],
  )
}

export type TuningApplyState = 'ready' | 'applying' | 'applied'

export type TuningCreateState = 'ready' | 'saving'

/**
 * Full-bleed card. Its pages are the board's tunes, swiped through,
 * each carrying its own Edit and Apply. The buttons act on the tune in view once the swipe settles.
 * When the board runs values no saved tune matches, its own page leads the others; a last page
 * creates a new tune from the board.
 */
export function TuningCard({
  pages,
  activeId,
  actionsDisabled = false,
  swipeLocked = false,
  onSelect,
  onApply,
  onEdit,
  onCreate,
}: {
  pages: TuningCardPage[]
  activeId: string | null
  /** Holds every page's buttons, e.g. while the board cannot take commands. */
  actionsDisabled?: boolean
  /** Holds the carousel in place, e.g. while the active tune has unsaved edits. */
  swipeLocked?: boolean
  onSelect: (id: string) => void
  onApply: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
}) {
  // Pages fill the card, not the window: the card may sit in something narrower than the screen.
  // The width is kept exact: paging snaps to the list's real, possibly fractional width, so a
  // rounded page width drifts further off with every page and shows a sliver of the next card.
  const [width, setWidth] = useState(useWindowDimensions().width)
  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width
    if (next > 0) setWidth(next)
  }
  const listRef = useRef<FlatList<TuningCardPage>>(null)
  const activeIndex = Math.max(
    0,
    pages.findIndex((page) => page.id === activeId),
  )
  // The page the list is showing, so an external selection scrolls and our own swipe does not.
  const settledIndex = useRef(activeIndex)

  useEffect(() => {
    if (settledIndex.current === activeIndex) return
    settledIndex.current = activeIndex
    listRef.current?.scrollToIndex({ index: activeIndex, animated: false })
  }, [activeIndex])

  const onSettle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width)
    const page = pages[index]
    if (!page || index === settledIndex.current) return
    settledIndex.current = index
    onSelect(page.id)
  }

  return (
    <View style={styles.card} onLayout={onLayout} testID="dashboard-tuning">
      <FlatList
        // A new width means new page offsets, so remount at the active page.
        key={width}
        ref={listRef}
        style={styles.list}
        data={pages}
        keyExtractor={(page) => page.id}
        horizontal
        pagingEnabled
        scrollEnabled={pages.length > 1 && !swipeLocked}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={activeIndex}
        // Every page owns a Skia canvas and a full-resolution shader pass, so mount only the page in
        // view and its neighbors instead of the FlatList default of ten pages at once.
        initialNumToRender={1}
        windowSize={3}
        maxToRenderPerBatch={1}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={onSettle}
        renderItem={({ item }) => (
          <TuningPage
            page={item}
            width={width}
            actionsDisabled={actionsDisabled}
            onApply={onApply}
            onEdit={onEdit}
            onCreate={onCreate}
          />
        )}
      />
      {pages.length > 1 && pages[activeIndex] ? (
        <PageIndicator count={pages.length} index={activeIndex} art={pages[activeIndex].art} />
      ) : null}
    </View>
  )
}

const APPLY_LABEL: Record<TuningApplyState, string> = {
  ready: 'Apply',
  applying: 'Applying…',
  applied: 'Applied',
}

function createLabel(state: TuningCreateState, unsaved: boolean): string {
  if (state === 'saving') return 'Saving…'
  return unsaved ? 'Save as tune' : 'Create tune'
}

function TuningPage({
  page,
  width,
  actionsDisabled,
  onApply,
  onEdit,
  onCreate,
}: {
  page: TuningCardPage
  width: number
  actionsDisabled: boolean
  onApply: (id: string) => void
  onEdit: (id: string) => void
  onCreate: () => void
}) {
  const shader = useArtShader(page.art)
  return (
    <View style={[styles.page, { width }]}>
      <TuneCardArt shader={shader} />
      <Text style={[styles.title, { color: shader.ink }]} numberOfLines={1}>
        {page.title}
      </Text>
      {page.apply ? (
        <>
          <Button
            variant="ghost"
            accessibilityLabel="Edit tune"
            icon={IconAdjustmentsHorizontal}
            onPress={() => onEdit(page.id)}
            style={styles.edit}
            testID="dashboard-tuning-edit"
          />
          <Button
            variant={page.apply === 'ready' ? 'primary' : 'secondary'}
            label={APPLY_LABEL[page.apply]}
            icon={page.apply === 'applied' ? IconCheck : undefined}
            disabled={actionsDisabled || page.apply !== 'ready'}
            onPress={() => onApply(page.id)}
            style={styles.action}
            testID="dashboard-tuning-apply"
          />
        </>
      ) : null}
      {page.unsaved ? (
        <View style={styles.tag}>
          <Badge label="Not saved" variant="outline" />
        </View>
      ) : null}
      {page.create ? (
        <Button
          variant="primary"
          label={createLabel(page.create, page.unsaved === true)}
          icon={page.unsaved ? IconDeviceFloppy : IconPlus}
          disabled={actionsDisabled || page.create !== 'ready'}
          onPress={onCreate}
          style={styles.action}
          testID="dashboard-tuning-create"
        />
      ) : null}
    </View>
  )
}

/** Dots while they fit, a count once they would crowd the card. */
function PageIndicator({
  count,
  index,
  art,
}: {
  count: number
  index: number
  art: TuningCardArt
}) {
  const { ink } = useArtShader(art)
  if (count > MAX_DOTS) {
    return (
      <Text style={[styles.count, { color: ink }]}>
        {index + 1} / {count}
      </Text>
    )
  }
  return (
    <View pointerEvents="none" style={styles.dots}>
      {Array.from({ length: count }, (_, dot) => (
        <View
          key={dot}
          style={[
            styles.dot,
            dot === index ? styles.dotActive : null,
            { backgroundColor: ink, opacity: dot === index ? 1 : 0.4 },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: MIN_HEIGHT,
    backgroundColor: theme.ui.card,
    overflow: 'hidden',
  },
  list: {
    flex: 1,
  },
  page: {
    paddingTop: EDGE,
    paddingLeft: EDGE,
    paddingRight: TITLE_RIGHT_RESERVE,
  },
  title: {
    color: theme.ui.foreground,
    fontSize: 22,
    fontWeight: '700',
  },
  edit: {
    position: 'absolute',
    top: BUTTON_INSET,
    right: EDGE,
  },
  /** Apply, or the create button of a page that saves the board's values. */
  action: {
    position: 'absolute',
    bottom: BUTTON_INSET,
    right: EDGE,
  },
  /** Centers the tag on the top button row, where Edit sits on a saved tune. */
  tag: {
    position: 'absolute',
    top: BUTTON_INSET,
    right: EDGE,
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: DOTS_BOTTOM,
    left: EDGE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.ui.mutedForeground,
  },
  dotActive: {
    width: 16,
    backgroundColor: theme.ui.foreground,
  },
  count: {
    position: 'absolute',
    bottom: COUNT_BOTTOM,
    left: EDGE,
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
})
