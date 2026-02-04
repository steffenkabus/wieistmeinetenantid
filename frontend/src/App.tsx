import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiCode,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiFormRow,
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
  Checkmark20Regular,
  Copy20Regular,
  Delete20Regular,
  ErrorCircle20Regular,
  Globe20Regular,
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

  const [backgroundImage, setBackgroundImage] = useState(() => getRandomBackgroundDataUrl())
  const [backgroundAttribution, setBackgroundAttribution] = useState<UnsplashAttribution | null>(null)

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

  const panelBackground = useMemo(
    () => (colorMode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.70)'),
    [colorMode],
  )

  const overlayBackground = useMemo(
    () => (colorMode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.62)'),
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
          <EuiPanel paddingSize="l" style={{ backgroundColor: panelBackground, backdropFilter: 'blur(10px)' }}>
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

            <EuiFormRow label={t('inputLabel')} fullWidth>
              <EuiFlexGroup
                gutterSize="s"
                responsive={false}
                alignItems="center"
                style={{ width: '100%' }}
              >
                <EuiFlexItem>
                  <EuiFieldText
                    fullWidth
                    value={domainInput}
                    placeholder={t('inputPlaceholder')}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void onResolve()
                    }}
                    prepend={<Globe20Regular aria-hidden="true" />}
                  />
                </EuiFlexItem>

                <EuiFlexItem grow={false}>
                  <EuiButton
                    onClick={() => void onResolve()}
                    disabled={isResolving}
                    fill
                    aria-label={t(isResolving ? 'resolving' : 'resolveButton')}
                    title={t(isResolving ? 'resolving' : 'resolveButton')}
                    style={{ minWidth: 44, paddingInline: 0, display: 'flex', justifyContent: 'center' }}
                  >
                    {isResolving ? <ArrowClockwise20Regular /> : <Search20Regular />}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>

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
              </>
            )}

            <EuiHorizontalRule margin="l" />

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
                  onClick={onClearHistory}
                  isDisabled={history.length === 0}
                >
                  <IconLabel icon={<Delete20Regular />} label={t('actionClearHistory')} />
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />

            {history.length === 0 ? (
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
          background: overlayBackground,
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.14)',
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

      {backgroundAttribution && (
        <div
          style={{
            position: 'fixed',
            right: 14,
            bottom: footerHeight + 14,
            padding: '8px 10px',
            borderRadius: 8,
            background: overlayBackground,
            backdropFilter: 'blur(8px)',
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
