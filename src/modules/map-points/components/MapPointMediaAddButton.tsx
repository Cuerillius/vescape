import { StyleSheet, View } from 'react-native'

import { Button } from '@/components/base/Button'
import { IconButton } from '@/components/base/IconButton'
import { theme } from '@/constants/theme'
import IconCamera from '@tabler/icons-react-native/IconCamera'
import IconPlus from '@tabler/icons-react-native/IconPlus'
import IconVideo from '@tabler/icons-react-native/IconVideo'

export function MapPointMediaActions({
  loading,
  onAdd,
  onCapturePhoto,
  onCaptureVideo,
}: {
  loading: boolean
  onAdd: () => void
  onCapturePhoto: () => void
  onCaptureVideo: () => void
}) {
  return (
    <View style={styles.row}>
      <Button
        label="Add Photos & Videos"
        icon={IconPlus}
        variant="secondary"
        loading={loading}
        onPress={onAdd}
        style={styles.addButton}
      />
      <IconButton
        icon={IconCamera}
        loading={loading}
        onPress={onCapturePhoto}
        accessibilityLabel="Take photo"
        style={styles.iconButton}
      />
      <IconButton
        icon={IconVideo}
        loading={loading}
        onPress={onCaptureVideo}
        accessibilityLabel="Record video"
        style={styles.iconButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    flex: 1,
    minWidth: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.ui.card,
    borderColor: theme.ui.border,
  },
})
