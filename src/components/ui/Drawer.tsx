import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useKeyboardLift } from '@/hooks/useKeyboardLift'

const OPEN_DURATION = 220
const CLOSE_DURATION = 180
/** Drag distance or release speed past which a swipe down dismisses the drawer. */
const DISMISS_DISTANCE = 80
const DISMISS_VELOCITY = 800

interface DrawerProps {
  visible: boolean
  title: string
  description?: string
  /** Sits beside the title block, for a control that belongs to the drawer as a whole. */
  headerRight?: ReactNode
  onClose: () => void
  /** Called once the close animation has finished and the drawer is gone, e.g. to open the next modal. */
  onDismissed?: () => void
  /** Ids the sheet; the scrim behind it is `${testID}-backdrop`. */
  testID?: string
  children: ReactNode
}

// Reanimated shared values are mutable handles by design. React's immutability
// lint cannot distinguish their UI-thread writes from React-owned state.
/* eslint-disable react-hooks/immutability */
/**
 * shadcn-style bottom drawer on the zinc tokens: a bordered sheet with a grabber and a title block,
 * over a flat scrim. Tap the scrim or swipe the header down to close.
 */
export function Drawer({
  visible,
  title,
  description,
  headerRight,
  onClose,
  onDismissed,
  testID,
  children,
}: DrawerProps) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const keyboardHeight = useKeyboardLift(visible)
  const [mounted, setMounted] = useState(visible)
  const translateY = useSharedValue(height)
  const onDismissedRef = useRef(onDismissed)
  onDismissedRef.current = onDismissed
  const handleClosed = useCallback(() => {
    setMounted(false)
    onDismissedRef.current?.()
  }, [])
  // Mount on the render that opens it; unmounting waits for the close animation.
  if (visible && !mounted) setMounted(true)

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
      })
      return
    }
    translateY.value = withTiming(
      height,
      { duration: CLOSE_DURATION, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) scheduleOnRN(handleClosed)
      },
    )
  }, [handleClosed, height, translateY, visible])

  const swipe = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY)
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(onClose)
        return
      }
      translateY.value = withTiming(0, { duration: OPEN_DURATION })
    })

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, height], [1, 0], 'clamp'),
  }))

  if (!mounted) return null

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable
            accessibilityLabel={`Close ${title}`}
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            testID={testID ? `${testID}-backdrop` : undefined}
          />
        </Animated.View>
        <Animated.View
          testID={testID}
          style={[
            styles.sheet,
            {
              maxHeight: height * 0.8,
              paddingBottom: insets.bottom + 8,
              marginBottom: keyboardHeight,
            },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={swipe}>
            <View style={styles.header}>
              <View style={styles.grabber} />
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{title}</Text>
                  {description ? <Text style={styles.description}>{description}</Text> : null}
                </View>
                {headerRight}
              </View>
            </View>
          </GestureDetector>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { backgroundColor: theme.alpha(theme.palette.mono.black, 0.6) },
  sheet: {
    borderTopLeftRadius: theme.radius.lg + 4,
    borderTopRightRadius: theme.radius.lg + 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.ui.border,
    backgroundColor: theme.ui.background,
  },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleBlock: { flex: 1, gap: 2 },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginVertical: 10,
    backgroundColor: theme.ui.border,
  },
  title: { color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  description: { color: theme.ui.mutedForeground, fontSize: 13 },
})
