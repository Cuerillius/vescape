import { Children, type ComponentType, type ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight'

import { Text } from '@/components/base/Text'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { interaction, theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** A captioned card of settings rows, hairline-separated. Without a title it is just the card. */
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const items = Children.toArray(children)
  return (
    <View style={styles.group}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Card>
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <Separator /> : null}
            {child}
          </View>
        ))}
      </Card>
    </View>
  )
}

interface SettingsLinkProps {
  icon: ComponentType<{ size: number; color: string }>
  label: string
  hint?: string
  /** Makes the row a link with a trailing chevron. Without it the row only reports. */
  onPress?: () => void
  /** A control on the trailing edge, in place of the chevron. */
  right?: ReactNode
  testID?: string
}

/** One settings row: monochrome icon, label over a muted hint, and a chevron or control. */
export function SettingsLink({
  icon: IconComponent,
  label,
  hint,
  onPress,
  right,
  testID,
}: SettingsLinkProps) {
  const iconColor = useResolvedColor(theme.ui.mutedForeground)
  const chevronColor = useResolvedColor(theme.ui.faintForeground)
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      android_ripple={onPress ? interaction.ripple : undefined}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
      testID={testID}
    >
      <IconComponent size={20} color={iconColor} />
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {right ?? (onPress ? <IconChevronRight size={18} color={chevronColor} /> : null)}
    </Pressable>
  )
}

/** What a settings screen is for, in one muted line above its groups. */
export function SettingsDescription({ children }: { children: string }) {
  return <Text style={styles.description}>{children}</Text>
}

interface SettingsValueProps {
  label: string
  /** Text is selectable and right-aligned; a node (e.g. a live readout) is placed as given. */
  value: ReactNode
  /** Fixed-width digits and code-like text, e.g. an identifier. */
  mono?: boolean
}

/** A read-only row: muted label on the left, its value on the right. */
export function SettingsValue({ label, value, mono }: SettingsValueProps) {
  return (
    <View style={styles.valueRow}>
      <Text style={styles.valueLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[styles.valueText, mono && styles.valueMono]} selectable>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  description: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginHorizontal: 4,
    marginBottom: -8,
  },
  valueRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  valueLabel: {
    flex: 1,
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
  },
  valueText: {
    flex: 1,
    color: theme.ui.foreground,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  valueMono: {
    fontFamily: theme.mono('600'),
    fontSize: 12,
  },
  group: {
    gap: 8,
  },
  title: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: {
    backgroundColor: theme.ui.muted,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: theme.ui.foreground,
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
})
