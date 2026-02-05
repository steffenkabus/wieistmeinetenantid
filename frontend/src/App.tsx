import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiCode,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowClockwise20Regular,
  ArrowDownload20Regular,
  Checkmark20Regular,
  ChevronDown20Regular,
  ChevronUp20Regular,
  Copy20Regular,
  Delete20Regular,
  ErrorCircle20Regular,
  History20Regular,
  Link20Regular,
  Search20Regular,
} from '@fluentui/react-icons'
import type { TenantLookupResult } from './tenantResolver'
import { resolveTenantIdForDomain } from './tenantResolver'
import { addToHistory, clearHistory, loadHistory } from './storage'
import { getRandomBackgroundDataUrl } from './randomBackground'
import type { UnsplashAttribution } from './unsplashBackground'
import { getDailyUnsplashBackground } from './unsplashBackground'
import { getAnalyticsConsent, setAnalyticsConsent } from './analyticsConsent'

function IconLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  )
}

export default function App({ colorMode }: { colorMode: 'light' | 'dark' }) {
  const { t } = useTranslation()

  const footerHeight = 56

  const [domainInput, setDomainInput] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [lastResult, setLastResult] = useState<TenantLookupResult | null>(null)
  const [history, setHistory] = useState<TenantLookupResult[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [historyVisible, setHistoryVisible] = useState(true)
  const [metadataExpanded, setMetadataExpanded] = useState(false)

  const [backgroundImage, setBackgroundImage] = useState(() => getRandomBackgroundDataUrl())
  const [backgroundAttribution, setBackgroundAttribution] = useState<UnsplashAttribution | null>(null)

  const [analyticsConsent, setAnalyticsConsentState] = useState(() => getAnalyticsConsent())

  const inputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      // Focus on mount if there's a URL parameter
      const params = new URLSearchParams(window.location.search)
      if (params.has('domain')) {
        window.setTimeout(() => node.focus(), 100)
      }
    }
  }, [])

  useEffect(() => {
    if (analyticsConsent === null) return
    setAnalyticsConsent(analyticsConsent)
  }, [analyticsConsent])

  useEffect(() => {
    let isCancelled = false

    async function loadBackground() {
      const unsplash = await getDailyUnsplashBackground()
      if (isCancelled) return

      if (unsplash) {
        setBackgroundImage(unsplash.url)
        setBackgroundAttribution(unsplash.attribution)
      } else {
        setBackgroundImage(getRandomBackgroundDataUrl())
        setBackgroundAttribution(null)
      }
    }

    void loadBackground()
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // Handle URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const domain = params.get('domain')
    if (domain) {
      setDomainInput(domain)
      // Auto-resolve after a brief delay
      window.setTimeout(() => {
        void resolveTenantIdForDomain(domain).then(result => {
          setLastResult(result)
          setHistory(addToHistory(result))
        }).catch(() => {
          // Silently fail if URL param domain is invalid
        })
      }, 300)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl/Cmd + K: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()
      }
      // Escape: Clear input
      if (e.key === 'Escape') {
        const input = document.querySelector<HTMLInputElement>('input[type="text"]')
        if (input && document.activeElement === input && input.value) {
          e.preventDefault()
          setDomainInput('')
        }
      }
      // Ctrl/Cmd + H: Toggle history
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setHistoryVisible(v => !v)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const panelBackground = useMemo(
    () => (colorMode === 'dark' ? 'rgba(0, 0, 0, 0.52)' : 'rgba(255, 255, 255, 0.48)'),
    [colorMode],
  )

  const overlayBackground = useMemo(
    () => (colorMode === 'dark' ? 'rgba(0, 0, 0, 0.52)' : 'rgba(255, 255, 255, 0.38)'),
    [colorMode],
  )

  const glassBackdropFilter = useMemo(() => 'blur(18px) saturate(1.4)', [])

  const footerBackground = useMemo(
    () => (colorMode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.62)'),
    [colorMode],
  )

  const footerBackdropFilter = useMemo(() => 'blur(12px) saturate(1.25)', [])

  const glassBorder = useMemo(
    () => (colorMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.66)'),
    [colorMode],
  )

  const glassShadow = useMemo(
    () => (colorMode === 'dark' ? '0 18px 48px rgba(0, 0, 0, 0.58)' : '0 18px 48px rgba(0, 0, 0, 0.20)'),
    [colorMode],
  )

  const separatorColor = useMemo(
    () => (colorMode === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.14)'),
    [colorMode],
  )

  const footerTopBorder = useMemo(
    () => (colorMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.12)'),
    [colorMode],
  )

  const onCopy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(value)
      window.setTimeout(() => setCopiedValue((current) => (current === value ? null : current)), 1200)
    } catch {
      // ignore
    }
  }, [])

  const onResolve = useCallback(async () => {
    const input = domainInput
    if (!input.trim()) {
      setErrorMessage(t('errorEmpty'))
      return
    }

    setErrorMessage(null)
    setIsResolving(true)
    try {
      const result = await resolveTenantIdForDomain(input)
      setLastResult(result)
      setHistory(addToHistory(result))
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'empty_domain'
          ? t('errorEmpty')
          : t('errorGeneric')
      setErrorMessage(message)
      setLastResult(null)
    } finally {
      setIsResolving(false)
    }
  }, [domainInput, t])

  const onClearHistory = useCallback(() => {
    clearHistory()
    setHistory([])
  }, [])

  const onExportHistory = useCallback(() => {
    if (history.length === 0) return
    
    // CSV header
    const header = 'Domain,Tenant ID,Resolved At\n'
    
    // CSV rows
    const rows = history.map(item => {
      const domain = item.domain.replace(/"/g, '""') // Escape quotes
      const tenantId = item.tenantId
      const resolvedAt = item.resolvedAt
      return `"${domain}","${tenantId}","${resolvedAt}"`
    }).join('\n')
    
    const csvContent = header + rows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tenant-history-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [history])

  const onExampleClick = useCallback((domain: string) => {
    setDomainInput(domain)
    setErrorMessage(null)
    void resolveTenantIdForDomain(domain).then(result => {
      setLastResult(result)
      setHistory(addToHistory(result))
    }).catch(err => {
      const message =
        err instanceof Error && err.message === 'empty_domain'
          ? t('errorEmpty')
          : t('errorGeneric')
      setErrorMessage(message)
      setLastResult(null)
    })
  }, [t])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 24 + footerHeight,
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <EuiFlexGroup justifyContent="center" style={{ width: '100%' }}>
        <EuiFlexItem grow={false} style={{ width: 'min(860px, 92vw)' }}>
          <EuiPanel
            paddingSize="l"
            style={{
              backgroundColor: panelBackground,
              backdropFilter: glassBackdropFilter,
              WebkitBackdropFilter: glassBackdropFilter,
              borderRadius: 15,
              border: glassBorder,
              boxShadow: glassShadow,
            }}
          >
            <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" responsive={false}>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h1 style={{ margin: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span>{t('appTitle')}</span>                      
                    </span>
                  </h1>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="l" />

            <div style={{ marginBottom: 16, width: '100%' }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                {t('inputLabel')}
              </label>
              <div style={{ display: 'flex', width: '100%', gap: 0, flexWrap: 'nowrap', alignItems: 'stretch' }}>
                <EuiFieldText
                  inputRef={inputRef}
                  value={domainInput}
                  placeholder={t('inputPlaceholder')}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void onResolve()
                  }}
                  compressed={false}
                  fullWidth
                  style={{
                    height: 50,
                    borderTopLeftRadius: 10,
                    borderBottomLeftRadius: 10,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    flex: '1 1 auto',
                    minWidth: 0,
                    width: '100%',
                  }}
                />
                <EuiButton
                  onClick={() => void onResolve()}
                  disabled={isResolving}
                  fill
                  aria-label={t(isResolving ? 'resolving' : 'resolveButton')}
                  title={t(isResolving ? 'resolving' : 'resolveButton')}
                  style={{
                    minWidth: 50,
                    width: 50,
                    height: 50,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 10,
                    borderBottomRightRadius: 10,
                    paddingInline: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: -1,
                  }}
                >
                  {isResolving ? <ArrowClockwise20Regular /> : <Search20Regular />}
                </EuiButton>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <EuiText size="s" color="subdued" style={{ marginBottom: 6 }}>
                {t('examplesLabel')}
              </EuiText>
              <EuiFlexGroup gutterSize="s" wrap responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiBadge
                    color="hollow"
                    onClick={() => onExampleClick('microsoft.com')}
                    onClickAriaLabel="Try microsoft.com"
                    style={{ cursor: 'pointer' }}
                  >
                    microsoft.com
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiBadge
                    color="hollow"
                    onClick={() => onExampleClick('contoso.com')}
                    onClickAriaLabel="Try contoso.com"
                    style={{ cursor: 'pointer' }}
                  >
                    contoso.com
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiBadge
                    color="hollow"
                    onClick={() => onExampleClick('github.com')}
                    onClickAriaLabel="Try github.com"
                    style={{ cursor: 'pointer' }}
                  >
                    github.com
                  </EuiBadge>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>

            {errorMessage && (
              <>
                <EuiSpacer size="m" />
                <EuiPanel color="subdued" paddingSize="m" hasBorder>
                  <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                    <EuiFlexItem grow={false}>
                      <ErrorCircle20Regular aria-hidden="true" />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiText size="s" style={{ color: 'var(--euiColorDangerText)' }}>
                        <strong>{t('errorTitle')}</strong>
                        <div>{errorMessage}</div>
                      </EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPanel>
              </>
            )}

            {lastResult && (
              <>
                <EuiSpacer size="l" />
                <EuiTitle size="xs">
                  <h2 style={{ margin: 0 }}>{t('lastResultTitle')}</h2>
                </EuiTitle>
                <EuiSpacer size="s" />

                <EuiPanel paddingSize="m">
                  <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                    <EuiFlexItem grow={false}>
                      <Checkmark20Regular aria-hidden="true" />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiText size="s">
                        <div>
                          <EuiBadge>{lastResult.domain}</EuiBadge>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          {t('tenantId')}: <EuiCode>{lastResult.tenantId}</EuiCode>
                        </div>
                      </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty size="s" onClick={() => void onCopy(lastResult.tenantId)}>
                        <IconLabel
                          icon={<Copy20Regular />}
                          label={copiedValue === lastResult.tenantId ? t('copied') : t('actionCopy')}
                        />
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPanel>

                {lastResult.metadata?.tenantRegion && (
                  <>
                    <EuiSpacer size="m" />
                    <div>
                      <EuiButtonEmpty
                        size="s"
                        onClick={() => setMetadataExpanded(!metadataExpanded)}
                        iconType={() => metadataExpanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}
                        iconSide="left"
                      >
                        {t('metadataTitle')}
                      </EuiButtonEmpty>
                      {metadataExpanded && (
                        <>
                          <EuiSpacer size="s" />
                          <EuiPanel paddingSize="m" color="subdued">
                            <EuiDescriptionList
                              type="column"
                              compressed
                              listItems={[
                                ...(lastResult.metadata.tenantRegion ? [{
                                  title: <span style={{ fontSize: '0.875rem' }}>{t('metadataTenantRegion')}</span>,
                                  description: <EuiBadge color="primary" style={{ fontSize: '0.875rem' }}>{lastResult.metadata.tenantRegion}</EuiBadge>,
                                }] : []),
                                ...(lastResult.metadata.cloudInstance ? [{
                                  title: <span style={{ fontSize: '0.875rem' }}>{t('metadataCloudType')}</span>,
                                  description: <EuiBadge color="hollow" style={{ fontSize: '0.875rem' }}>{lastResult.metadata.cloudInstance}</EuiBadge>,
                                }] : []),
                              ]}
                            />
                          </EuiPanel>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            <EuiHorizontalRule margin="l" style={{ borderColor: separatorColor, opacity: 1 }} />

            <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
              <EuiFlexItem grow={false}>
                <History20Regular aria-hidden="true" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiTitle size="xs">
                  <h2 style={{ margin: 0 }}>{t('recentTitle')}</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  size="s"
                  onClick={onExportHistory}
                  isDisabled={history.length === 0}
                >
                  <IconLabel icon={<ArrowDownload20Regular />} label={t('actionExportHistory')} />
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  size="s"
                  onClick={onClearHistory}
                  isDisabled={history.length === 0}
                >
                  <IconLabel icon={<Delete20Regular />} label={t('actionClearHistory')} />
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />

            {historyVisible && (
              history.length === 0 ? (
                <EuiText size="s" color="subdued">
                  {t('emptyRecent')}
                </EuiText>
              ) : (
                <EuiFlexGroup direction="column" gutterSize="s">
                  {history.map((item) => (
                    <EuiFlexItem key={`${item.domain}:${item.tenantId}`}>
                      <EuiPanel paddingSize="m">
                        <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                          <EuiFlexItem>
                            <EuiText size="s">
                              <div style={{ fontWeight: 600 }}>{item.domain}</div>
                              <div style={{ marginTop: 4 }}>
                                {t('tenantId')}: <EuiCode>{item.tenantId}</EuiCode>
                              </div>
                            </EuiText>
                          </EuiFlexItem>

                          <EuiFlexItem grow={false}>
                            <EuiButtonEmpty size="s" onClick={() => void onCopy(item.tenantId)}>
                              <IconLabel
                                icon={<Copy20Regular />}
                                label={copiedValue === item.tenantId ? t('copied') : t('actionCopy')}
                              />
                            </EuiButtonEmpty>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiPanel>
                    </EuiFlexItem>
                  ))}
                </EuiFlexGroup>
              )
            )}
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '10px 14px',
          background: footerBackground,
          backdropFilter: footerBackdropFilter,
          WebkitBackdropFilter: footerBackdropFilter,
          borderTop: footerTopBorder,
        }}
      >
        <div style={{ width: 'min(860px, 92vw)', margin: '0 auto' }}>
          <EuiFlexGroup
            gutterSize="m"
            responsive={false}
            alignItems="center"
            justifyContent="spaceBetween"
          >
            <EuiFlexItem grow={false}>
              <EuiText size="xs" color="subdued">
                <span>
                  <a href="/imprint.html" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {t('footerImprint')}
                  </a>
                  <span style={{ opacity: 0.6, margin: '0 10px' }}>|</span>
                  <a href="/privacy.html" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {t('footerPrivacy')}
                  </a>
                </span>
              </EuiText>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiText size="xs" color="subdued">
                <span style={{ opacity: 0.8 }}>© {new Date().getFullYear()} wieistmeinetenantid.de</span>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </div>

      {analyticsConsent === null && (
        <div
          style={{
            position: 'fixed',
            left: 14,
            right: 14,
            bottom: footerHeight + 14,
            zIndex: 10,
          }}
        >
          <div style={{ width: 'min(860px, 92vw)', margin: '0 auto' }}>
            <EuiPanel
              paddingSize="m"
              style={{
                backgroundColor: overlayBackground,
                backdropFilter: glassBackdropFilter,
                WebkitBackdropFilter: glassBackdropFilter,
                border: glassBorder,
                boxShadow: glassShadow,
              }}
            >
              <EuiFlexGroup gutterSize="m" alignItems="center" justifyContent="spaceBetween" responsive={false} wrap>
                <EuiFlexItem>
                  <EuiText size="s">
                    <div>
                      {t('consentText')}{' '}
                      <a href="/privacy.html" style={{ textDecoration: 'underline' }}>
                        {t('footerPrivacy')}
                      </a>
                      .
                    </div>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup gutterSize="s" responsive={false}>
                    <EuiFlexItem grow={false}>
                      <EuiButton size="s" fill onClick={() => setAnalyticsConsentState('granted')}>
                        {t('consentAccept')}
                      </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty size="s" onClick={() => setAnalyticsConsentState('denied')}>
                        {t('consentDecline')}
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
          </div>
        </div>
      )}

      {backgroundAttribution && (
        <div
          style={{
            position: 'fixed',
            right: 14,
            bottom: footerHeight + 14,
            padding: '8px 10px',
            borderRadius: 8,
            background: overlayBackground,
            backdropFilter: glassBackdropFilter,
            WebkitBackdropFilter: glassBackdropFilter,
            maxWidth: 'min(520px, 92vw)',
          }}
        >
          <EuiText size="xs">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Link20Regular aria-hidden="true" />
              <a href={backgroundAttribution.photoUrl} target="_blank" rel="noreferrer">
                {t('photoAttribution', { name: backgroundAttribution.photographerName })}
              </a>
              <span style={{ opacity: 0.85 }}>
                (
                <a href={backgroundAttribution.photographerUrl} target="_blank" rel="noreferrer">
                  {backgroundAttribution.photographerName}
                </a>
                )
              </span>
            </span>
          </EuiText>
        </div>
      )}
    </div>
  )
}
