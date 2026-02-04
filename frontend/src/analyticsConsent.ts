const CONSENT_KEY = 'analyticsConsent:v1'

type AnalyticsConsent = 'granted' | 'denied'

function isValidConsent(value: unknown): value is AnalyticsConsent {
  return value === 'granted' || value === 'denied'
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    return isValidConsent(raw) ? raw : null
  } catch {
    return null
  }
}

export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  try {
    localStorage.setItem(CONSENT_KEY, consent)
  } catch {
    // ignore
  }

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag === 'function') {
    gtag('consent', 'update', {
      analytics_storage: consent,
    })

    if (consent === 'granted') {
      gtag('event', 'page_view', {
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search + window.location.hash,
      })
    }
  }
}
