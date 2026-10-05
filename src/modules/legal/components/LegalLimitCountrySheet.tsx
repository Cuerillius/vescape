import { Drawer } from '@/components/ui/Drawer'
import { LegalLimitCountryDetails } from '@/modules/legal/components/LegalLimitCountryDetails'
import type { LegalLimitCountry } from '@/modules/legal/lib/legalLimits'

interface LegalLimitCountrySheetProps {
  country: LegalLimitCountry | null
  onClose: () => void
}

/** The bottom drawer with one country's legal limits. */
export function LegalLimitCountrySheet({ country, onClose }: LegalLimitCountrySheetProps) {
  return (
    <Drawer visible={country != null} title={country?.name ?? ''} onClose={onClose}>
      {country ? <LegalLimitCountryDetails country={country} /> : null}
    </Drawer>
  )
}
