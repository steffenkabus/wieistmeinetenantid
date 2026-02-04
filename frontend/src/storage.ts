import type { TenantLookupResult } from './tenantResolver'

const HISTORY_KEY = 'tenantLookupHistory:v1'

export function loadHistory(): TenantLookupResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x): x is TenantLookupResult => {
        return (
          typeof x === 'object' &&
          x !== null &&
          'domain' in x &&
          'tenantId' in x &&
          'resolvedAt' in x
        )
      })
      .slice(0, 5)
  } catch {
    return []
  }
}

export function saveHistory(history: TenantLookupResult[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)))
}

export function addToHistory(entry: TenantLookupResult): TenantLookupResult[] {
  const current = loadHistory()
  const withoutDomain = current.filter((x) => x.domain !== entry.domain)
  const next = [entry, ...withoutDomain].slice(0, 5)
  saveHistory(next)
  return next
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
