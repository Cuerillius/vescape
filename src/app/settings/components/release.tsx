import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import IconRocket from '@tabler/icons-react-native/IconRocket'
import type { CommunityMessage, CommunityMessageType } from 'vescape-core'

import { Button } from '@/components/ui/Button'
import { NewComponentHero } from '@/components/dev/NewComponentHero'
import { NewShowcaseCard } from '@/components/dev/NewShowcaseCard'
import { NewChipRow, NewToggleRow } from '@/components/dev/NewShowcaseControls'
import { theme } from '@/constants/theme'
import { CommunityMessageModal } from '@/modules/release/components/CommunityMessageModal'
import { ReleaseActionPill } from '@/modules/release/components/ReleaseActionPill'
import {
  VersionNoticeModal,
  type VersionNoticeKind,
} from '@/modules/release/components/VersionNoticeModal'

const NOTICE_KINDS: VersionNoticeKind[] = ['update-warning', 'online-block']
const MESSAGE_TYPES: CommunityMessageType[] = ['info', 'warning', 'critical']

const NOTICE_COPY = 'This version is **out of date**. Update to keep ride sync and alerts working.'

function ReleaseActionPillShowcase() {
  const [withVersion, setWithVersion] = useState(true)
  return (
    <NewShowcaseCard
      name="ReleaseActionPill"
      controls={
        <NewToggleRow label="latest version" value={withVersion} onChange={setWithVersion} />
      }
    >
      <View style={styles.row}>
        <ReleaseActionPill latestVersion={withVersion ? '1.2.0' : undefined} onPress={() => {}} />
      </View>
    </NewShowcaseCard>
  )
}

function VersionNoticeShowcase() {
  const [kind, setKind] = useState<VersionNoticeKind>('update-warning')
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <NewShowcaseCard
      name="VersionNoticeModal"
      controls={
        <NewChipRow
          label="kind"
          options={NOTICE_KINDS}
          selected={kind}
          onSelect={(next) => setKind(next as VersionNoticeKind)}
        />
      }
    >
      <Button label="Open notice" variant="outline" onPress={() => setOpen(true)} />
      <VersionNoticeModal
        kind={kind}
        visible={open}
        message={NOTICE_COPY}
        onDismiss={close}
        onUpdate={close}
      />
    </NewShowcaseCard>
  )
}

function CommunityMessageShowcase() {
  const [type, setType] = useState<CommunityMessageType>('info')
  const [titled, setTitled] = useState(true)
  const [withAction, setWithAction] = useState(true)
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const message: CommunityMessage | null = open
    ? {
        id: 'demo',
        type,
        title: titled ? 'Group ride on Saturday' : null,
        body: 'Meet at the **river car park** at 10:00. Bring lights.',
        action: withAction
          ? { type: 'primary', label: 'See details', url: 'https://example.com' }
          : null,
      }
    : null
  return (
    <NewShowcaseCard
      name="CommunityMessageModal"
      controls={
        <>
          <NewChipRow
            label="type"
            options={MESSAGE_TYPES}
            selected={type}
            onSelect={(next) => setType(next as CommunityMessageType)}
          />
          <NewToggleRow label="own title" value={titled} onChange={setTitled} />
          <NewToggleRow label="action" value={withAction} onChange={setWithAction} />
        </>
      }
    >
      <Button label="Open message" variant="outline" onPress={() => setOpen(true)} />
      <CommunityMessageModal message={message} onDismiss={close} onAction={close} />
    </NewShowcaseCard>
  )
}

export default function NewReleasePage() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <NewComponentHero
          icon={IconRocket}
          description="Release surfaces: the update pill, version notices and community messages the server can show."
        />
        <ReleaseActionPillShowcase />
        <VersionNoticeShowcase />
        <CommunityMessageShowcase />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.ui.background },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', paddingVertical: 4 },
})
