import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appTitle: 'What is the Azure / Microsoft 365 tenant ID?',
      inputLabel: 'Domain',
      inputPlaceholder: 'e.g. contoso.com',
      resolveButton: 'Resolve',
      resolving: 'Resolving…',
      lastResultTitle: 'Result',
      tenantId: 'Tenant ID',
      recentTitle: 'Recent lookups',
      emptyRecent: 'No lookups yet.',
      actionCopy: 'Copy',
      actionUse: 'Use',
      actionResolve: 'Resolve',
      actionClearHistory: 'Clear history',
      copied: 'Copied',
      errorTitle: 'Could not resolve tenant ID',
      errorEmpty: 'Please enter a domain.',
      errorGeneric:
        'Request failed. If this persists, your network may be blocking calls to login.microsoftonline.com from the browser.',
      language: 'Language',
      langEnglish: 'English',
      langGerman: 'Deutsch',
      photoAttribution: 'Photo by {{name}} on Unsplash',
      footerImprint: 'Imprint',
      footerPrivacy: 'Data privacy',
      consentText:
        'We use Google Analytics to understand usage and improve this site. You can accept or decline analytics tracking.',
      consentAccept: 'Accept',
      consentDecline: 'Decline',
    },
  },
  de: {
    translation: {
      appTitle: 'Wie lautet die Azure / Microsoft 365 Tenant-ID?',
      inputLabel: 'Domain',
      inputPlaceholder: 'z.B. contoso.com',
      resolveButton: 'Auflösen',
      resolving: 'Wird aufgelöst…',
      lastResultTitle: 'Ergebnis',
      tenantId: 'Tenant-ID',
      recentTitle: 'Letzte Abfragen',
      emptyRecent: 'Noch keine Abfragen.',
      actionCopy: 'Kopieren',
      actionUse: 'Übernehmen',
      actionResolve: 'Auflösen',
      actionClearHistory: 'Verlauf löschen',
      copied: 'Kopiert',
      errorTitle: 'Tenant-ID konnte nicht aufgelöst werden',
      errorEmpty: 'Bitte eine Domain eingeben.',
      errorGeneric:
        'Anfrage fehlgeschlagen. Falls das wiederholt passiert, blockiert dein Netzwerk möglicherweise Aufrufe zu login.microsoftonline.com aus dem Browser.',
      language: 'Sprache',
      langEnglish: 'English',
      langGerman: 'Deutsch',
      photoAttribution: 'Foto von {{name}} auf Unsplash',
      footerImprint: 'Impressum',
      footerPrivacy: 'Datenschutz',
      consentText:
        'Wir verwenden Google Analytics, um die Nutzung zu verstehen und diese Seite zu verbessern. Du kannst dem zustimmen oder es ablehnen.',
      consentAccept: 'Akzeptieren',
      consentDecline: 'Ablehnen',
    },
  },
} as const

function detectInitialLanguage(): 'en' | 'de' {
  const nav = navigator.language?.toLowerCase() ?? ''
  if (nav.startsWith('de')) return 'de'
  return 'en'
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })


export default i18n
