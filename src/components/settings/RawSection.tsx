import { useMemo } from 'react'
import { Share, StyleSheet, View } from 'react-native'
import IconShare from '@tabler/icons-react-native/IconShare'

import { Text } from '@/components/base/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { theme, type ThemeColor } from '@/constants/theme'
import { tokenizeJson, type JsonTokenType } from '@/helpers/jsonHighlight'

const TOKEN_COLORS: Record<JsonTokenType, ThemeColor> = {
  key: theme.palette.sky.text,
  string: theme.palette.green.text,
  number: theme.palette.amber.text,
  boolean: theme.palette.purple.text,
  null: theme.palette.red.text,
  punctuation: theme.ui.faintForeground,
  plain: theme.ui.mutedForeground,
}

interface RawSectionProps {
  title: string
  data: unknown
  exportName: string
  empty?: string
}

/** Captioned card that renders any record as syntax-highlighted, exportable JSON. */
export function RawSection({ title, data, exportName, empty }: RawSectionProps) {
  const entries =
    data && typeof data === 'object' ? Object.entries(data as Record<string, unknown>) : []

  const handleExport = () => {
    Share.share({ message: JSON.stringify(data, null, 2) }, { subject: `${exportName}.json` })
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {entries.length > 0 ? (
          <Button
            variant="ghost"
            icon={IconShare}
            label="Export JSON"
            accessibilityLabel={`Export ${title} as JSON`}
            onPress={handleExport}
          />
        ) : null}
      </View>
      <Card>
        {entries.length === 0 ? (
          <Text style={styles.empty}>{empty ?? 'No data'}</Text>
        ) : (
          entries.map(([key, value], index) => {
            const isObject = value !== null && typeof value === 'object'
            return (
              <View key={key}>
                {index > 0 ? <Separator /> : null}
                <View style={isObject ? styles.column : styles.row}>
                  <Text style={isObject ? styles.keyBlock : styles.key} selectable>
                    {key}
                  </Text>
                  <JsonValue value={value} block={isObject} />
                </View>
              </View>
            )
          })
        )}
      </Card>
    </View>
  )
}

function JsonValue({ value, block }: { value: unknown; block?: boolean }) {
  const tokens = useMemo(() => tokenizeJson(value), [value])
  return (
    <Text style={block ? styles.jsonBlock : styles.value} selectable>
      {tokens.map((token, i) => (
        <Text key={i} style={{ color: TOKEN_COLORS[token.type] }}>
          {token.text}
        </Text>
      ))}
    </Text>
  )
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 4,
  },
  title: {
    color: theme.ui.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  column: {
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  key: {
    flex: 1,
    color: theme.ui.mutedForeground,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  keyBlock: {
    color: theme.ui.foreground,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  value: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  jsonBlock: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 17,
  },
  empty: {
    color: theme.ui.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
    padding: 16,
  },
})
