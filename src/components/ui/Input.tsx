import { forwardRef, useState } from 'react'
import { StyleSheet, TextInput, type TextInputProps } from 'react-native'

import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'

/** shadcn-style text field on the zinc tokens: a hairline border that firms up while focused. */
export const Input = forwardRef<TextInput, TextInputProps>(function Input(
  { style, onFocus, onBlur, editable = true, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const placeholderColor = useResolvedColor(theme.ui.faintForeground)
  const selectionColor = useResolvedColor(theme.ui.mutedForeground)
  return (
    <TextInput
      ref={ref}
      editable={editable}
      placeholderTextColor={placeholderColor}
      selectionColor={selectionColor}
      cursorColor={selectionColor}
      onFocus={(event) => {
        setFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setFocused(false)
        onBlur?.(event)
      }}
      style={[
        styles.input,
        focused ? styles.focused : null,
        !editable ? styles.disabled : null,
        style,
      ]}
      {...props}
    />
  )
})

const styles = StyleSheet.create({
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.ui.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.ui.card,
    color: theme.ui.foreground,
    fontFamily: theme.font('600'),
    fontSize: 15,
  },
  focused: { borderColor: theme.ui.mutedForeground },
  disabled: { opacity: 0.5 },
})
