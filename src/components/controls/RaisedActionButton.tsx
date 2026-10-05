import { useEffect, type ReactNode } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import IconLoader from '@tabler/icons-react-native/IconLoader'
import type { Icon as TablerIcon } from '@tabler/icons-react-native'

import { Text } from '@/components/base/Text'
import { interaction, theme, type ThemeColor } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

const SIZE = 64
/** How far the button rises above the bar it sits on. */
const LIFT = 26
const RING_BOX_SIZE = SIZE + 8

const SPINNER_SIZE = 26
const SPINNER_SPIN_MS = 900
const PULSE_MS = 800
const PULSE_MIN_OPACITY = 0.35

interface RaisedActionButtonProps {
  icon: TablerIcon
  label: string
  accessibilityLabel: string
  /** Fills the disc solid, e.g. a live or recording state. */
  active?: boolean
  /** Tints the disc border while a transient state is in progress, e.g. connecting. */
  accentColor?: ThemeColor
  /** Replaces the icon with a spinner, e.g. while a connection attempt is in flight. */
  loading?: boolean
  /** Fades the icon in and out, e.g. to show a recording is live. */
  pulse?: boolean
  onPress: () => void
  /** A secondary control pinned to the disc's top-right corner. A sibling of the disc's press
   * target, not a child, so its own touches never reach the disc. */
  badge?: ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
}

/** Tabler's `IconLoader` glyph, spun continuously — the icon set's own loader mark rather than a
 * hand-built one. */
function Spinner({ color }: { color: string }) {
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: SPINNER_SPIN_MS, easing: Easing.linear }),
      -1,
      false,
    )
    return () => cancelAnimation(rotation)
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <IconLoader size={SPINNER_SIZE} color={color} strokeWidth={2} />
    </Animated.View>
  )
}

/** Fades its child down and back up on a loop, without changing its size. */
export function Pulse({ children }: { children: ReactNode }) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(PULSE_MIN_OPACITY, { duration: PULSE_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
    return () => cancelAnimation(opacity)
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={animatedStyle}>{children}</Animated.View>
}

/**
 * The raised disc-and-label shell behind the main tab bar's centre button: a ring of page
 * background, a bordered disc that can fill solid for an active state, and a label underneath.
 * `ConnectButton` composes this with board-connection logic and pins a recording badge to it.
 */
export function RaisedActionButton({
  icon: IconComponent,
  label,
  accessibilityLabel,
  active = false,
  accentColor,
  loading = false,
  pulse = false,
  onPress,
  badge,
  style,
  testID,
}: RaisedActionButtonProps) {
  const iconColor = useResolvedColor(
    active ? theme.ui.primaryForeground : (accentColor ?? theme.ui.foreground),
  )
  const resolvedAccent = useResolvedColor(accentColor ?? theme.ui.border)

  return (
    <View style={[styles.slot, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.press, pressed && styles.pressed]}
        testID={testID}
      >
        <View style={styles.ringWrapper}>
          <View style={styles.ring}>
            <View
              style={[
                styles.disc,
                active ? styles.discActive : null,
                accentColor && !active ? { borderColor: resolvedAccent } : null,
              ]}
            >
              {loading ? (
                <Spinner color={iconColor} />
              ) : pulse ? (
                <Pulse>
                  <IconComponent size={28} color={iconColor} strokeWidth={active ? 2.5 : 2} />
                </Pulse>
              ) : (
                <IconComponent size={28} color={iconColor} strokeWidth={active ? 2.5 : 2} />
              )}
            </View>
          </View>
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
      {badge ? <View style={styles.badge}>{badge}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  slot: {
    flex: 1.2,
    // The disc rises over the bar's top edge; the label stays on the tab labels' baseline.
    marginTop: -14 - LIFT,
  },
  press: {
    alignItems: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  ringWrapper: {
    width: RING_BOX_SIZE,
    height: RING_BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    // A ring of page background cuts the bar's top border around the disc.
    padding: 4,
    borderRadius: RING_BOX_SIZE / 2,
    backgroundColor: theme.ui.background,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.card,
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
  discActive: {
    backgroundColor: theme.ui.primary,
    borderColor: theme.ui.primary,
  },
  label: {
    maxWidth: 108,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '800',
    color: theme.ui.foreground,
    textAlign: 'center',
  },
})
