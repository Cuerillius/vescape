import { Pressable, StyleSheet, View } from 'react-native'
import IconCheck from '@tabler/icons-react-native/IconCheck'

import { interaction, theme } from '@/constants/theme'

interface ColorPickerProps {
  /** Currently selected color (hex), or null when none is chosen. */
  value: string | null
  /** Selectable swatches. */
  colors: readonly string[]
  onChange: (color: string | null) => void
  /** Swatch diameter. */
  size?: number
}

/** A wrap of rounded-square swatches; the selected one shows a ring + check. Presentational. */
export function ColorPicker({ value, colors, onChange, size = 36 }: ColorPickerProps) {
  return (
    <View style={styles.grid}>
      {colors.map((color) => {
        const selected = value === color
        const dim = size - 10
        return (
          <Pressable
            key={color}
            onPress={() => onChange(selected ? null : color)}
            accessibilityLabel={`Color ${color}`}
            accessibilityState={{ selected }}
            android_ripple={interaction.rippleBorderless}
            style={({ pressed }) => [
              styles.ring,
              { width: size, height: size, borderRadius: theme.radius.md + 2 },
              selected && styles.ringSelected,
              pressed && { opacity: interaction.pressedOpacity },
            ]}
          >
            <View
              style={[
                styles.swatch,
                {
                  width: dim,
                  height: dim,
                  borderRadius: theme.radius.md - 1,
                  backgroundColor: color,
                },
              ]}
            >
              {selected ? (
                <IconCheck size={dim * 0.6} color={theme.palette.mono.white} strokeWidth={3} />
              ) : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  ringSelected: {
    borderColor: theme.ui.foreground,
  },
  swatch: {
    borderWidth: 1,
    borderColor: theme.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
