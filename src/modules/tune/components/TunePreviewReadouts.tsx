import { Canvas, Text as SkiaText, type SkFont } from '@shopify/react-native-skia'
import { StyleSheet, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedUiColors } from '@/hooks/useTheme'
import { TARGET_BOARD_OPACITY } from '@/modules/tune/components/tunePreviewBoard'
import {
  READOUT_BASELINE,
  READOUT_HEIGHT,
  READOUT_VALUE_WIDTH,
} from '@/modules/tune/components/tunePreviewCanvasGeometry'

function Readout({
  label,
  swatch,
  value,
  font,
  color,
}: {
  label: string
  swatch?: 'board' | 'target'
  value: SharedValue<string>
  font: SkFont | null
  color: string
}) {
  return (
    <View style={styles.item}>
      <View style={styles.caption}>
        {swatch ? (
          <View style={[styles.swatch, swatch === 'target' ? styles.targetSwatch : null]} />
        ) : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Canvas style={styles.valueCanvas}>
        {font && <SkiaText x={0} y={READOUT_BASELINE} text={value} font={font} color={color} />}
      </Canvas>
    </View>
  )
}

/**
 * The tune's response in one row under the scene: motor current, then board against target.
 */
export function TunePreviewReadouts({
  motorStr,
  boardAngleStr,
  targetAngleStr,
  errorAngleStr,
  font,
}: {
  motorStr: SharedValue<string>
  boardAngleStr: SharedValue<string>
  targetAngleStr: SharedValue<string>
  errorAngleStr: SharedValue<string>
  font: SkFont | null
}) {
  'use no memo'
  const ui = useResolvedUiColors()
  return (
    <View style={styles.row}>
      <Readout label="Motor" value={motorStr} font={font} color={ui.foreground} />
      <Readout
        label="Board"
        swatch="board"
        value={boardAngleStr}
        font={font}
        color={ui.foreground}
      />
      <Readout
        label="Target"
        swatch="target"
        value={targetAngleStr}
        font={font}
        color={ui.foreground}
      />
      <Readout label="Error" value={errorAngleStr} font={font} color={ui.foreground} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  item: { flex: 1, gap: 2 },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 8, height: 8, borderRadius: 2, backgroundColor: theme.ui.foreground },
  targetSwatch: { backgroundColor: theme.ui.mutedForeground, opacity: TARGET_BOARD_OPACITY },
  label: { color: theme.ui.mutedForeground, fontSize: 12 },
  valueCanvas: { width: READOUT_VALUE_WIDTH, height: READOUT_HEIGHT },
})
