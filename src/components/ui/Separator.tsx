import { StyleSheet, View } from 'react-native'

import { theme } from '@/constants/theme'

/** 1px rule between sibling blocks. */
export function Separator({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical'
}) {
  return <View style={orientation === 'horizontal' ? styles.horizontal : styles.vertical} />
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth * 2,
    alignSelf: 'stretch',
    backgroundColor: theme.ui.border,
  },
  vertical: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: 'stretch',
    backgroundColor: theme.ui.border,
  },
})
