import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle'
import IconBulb from '@tabler/icons-react-native/IconBulb'
import IconMapPin from '@tabler/icons-react-native/IconMapPin'
import IconNotes from '@tabler/icons-react-native/IconNotes'
import IconRoad from '@tabler/icons-react-native/IconRoad'
import IconUmbrella from '@tabler/icons-react-native/IconUmbrella'
import type { ComponentType } from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/base/Text'
import { theme } from '@/constants/theme'
import { useResolvedColor } from '@/hooks/useTheme'
import { useLegalReferenceSpeedFormat } from '@/modules/legal/hooks/useLegalLimitsFormat'
import {
  getLegalLimitCountryDetail,
  LEGAL_ROAD_STATUS_COLORS,
  LEGAL_ROAD_STATUS_LABELS,
  type LegalLimitCountry,
} from '@/modules/legal/lib/legalLimits'

type DetailIcon = ComponentType<{ size: number; color: string; strokeWidth?: number }>

interface LegalLimitCountryDetailsProps {
  country: LegalLimitCountry
}

function Tile({ icon: Glyph, color }: { icon: DetailIcon; color?: string }) {
  const muted = useResolvedColor(theme.ui.mutedForeground)
  return (
    <View style={styles.tile}>
      <Glyph size={18} color={color ?? muted} strokeWidth={1.75} />
    </View>
  )
}

/** A headline figure. With a `color` the whole card takes it, so the status reads at a glance. */
function Stat({
  label,
  value,
  caption,
  color,
}: {
  label: string
  value: string
  caption?: string
  color?: string
}) {
  return (
    <View
      style={[
        styles.stat,
        color ? { borderColor: color, backgroundColor: theme.alpha(color, 0.12) } : null,
      ]}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      {caption ? (
        <Text style={styles.statCaption} numberOfLines={3}>
          {caption}
        </Text>
      ) : null}
    </View>
  )
}

function DetailRow({ icon, title, body }: { icon: DetailIcon; title: string; body: string }) {
  return (
    <View style={styles.row}>
      <Tile icon={icon} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
    </View>
  )
}

/** One country's legal limits on the zinc tokens: status and speed up top, then the details. */
export function LegalLimitCountryDetails({ country }: LegalLimitCountryDetailsProps) {
  const formatReferenceSpeed = useLegalReferenceSpeedFormat()
  const detail = getLegalLimitCountryDetail(country)
  const statusColor = useResolvedColor(LEGAL_ROAD_STATUS_COLORS[country.status])

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <Stat
          color={statusColor}
          label="Road status"
          value={LEGAL_ROAD_STATUS_LABELS[country.status]}
        />
        <Stat
          label="Top speed"
          value={formatReferenceSpeed(country.referenceSpeedKmh)}
          caption={country.speedLimitBasis}
        />
      </View>

      {country.warningText ? (
        <View style={[styles.warning, { borderColor: statusColor }]}>
          <IconAlertTriangle size={18} color={statusColor} strokeWidth={1.75} />
          <Text style={styles.warningText}>{country.warningText}</Text>
        </View>
      ) : null}

      {detail ? (
        <View style={styles.rows}>
          <DetailRow icon={IconRoad} title="Vehicle scope" body={detail.vehicleScope} />
          <DetailRow icon={IconMapPin} title="Where you can ride" body={detail.where} />
          <DetailRow icon={IconBulb} title="Requirements" body={detail.equipment} />
          <DetailRow icon={IconUmbrella} title="Insurance" body={detail.insurance} />
          <DetailRow icon={IconNotes} title="Notes" body={detail.notes} />
        </View>
      ) : null}

      <View style={styles.source}>
        <Text style={styles.sourceLabel}>Checked</Text>
        <Text style={styles.sourceValue}>{country.checkedAt}</Text>
        <Text style={[styles.sourceLabel, styles.sourceGap]}>Source</Text>
        <Text style={styles.sourceUrl} numberOfLines={2}>
          {country.sourceUrl}
        </Text>
      </View>
    </View>
  )
}

const card = {
  backgroundColor: theme.ui.card,
  borderRadius: theme.radius.lg,
  borderWidth: 1,
  borderColor: theme.ui.border,
} as const

const styles = StyleSheet.create({
  container: { gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { ...card, flex: 1, padding: 12, gap: 4 },
  statLabel: { color: theme.ui.mutedForeground, fontSize: 12 },
  statValue: { color: theme.ui.foreground, fontSize: 16, fontWeight: '600' },
  statCaption: { color: theme.ui.mutedForeground, fontSize: 12, lineHeight: 16 },
  tile: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.ui.muted,
  },
  warning: {
    ...card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  warningText: { flex: 1, color: theme.ui.foreground, fontSize: 13, lineHeight: 18 },
  rows: { ...card, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.ui.border,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { color: theme.ui.foreground, fontSize: 14, fontWeight: '600' },
  rowBody: { color: theme.ui.mutedForeground, fontSize: 13, lineHeight: 18 },
  source: { ...card, padding: 12 },
  sourceLabel: { color: theme.ui.mutedForeground, fontSize: 12 },
  sourceGap: { marginTop: 8 },
  sourceValue: { color: theme.ui.foreground, fontSize: 13, fontWeight: '600' },
  sourceUrl: { color: theme.ui.mutedForeground, fontSize: 12, lineHeight: 16 },
})
