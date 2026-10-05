import { useMemo } from 'react'

import { useResolvedAlertRules } from '@/modules/alerts/hooks/useResolvedAlertRules'

/** The lowest threshold among the active Board's enabled rules for a control, or null if it has none. */
export function useLowestAlertThreshold(controlId: string): number | null {
  const rules = useResolvedAlertRules()
  return useMemo(() => {
    const thresholds = rules.filter((rule) => rule.controlId === controlId).map((r) => r.threshold)
    return thresholds.length > 0 ? Math.min(...thresholds) : null
  }, [rules, controlId])
}
