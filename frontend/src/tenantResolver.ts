export type TenantLookupResult = {
  domain: string
  tenantId: string
  resolvedAt: string
  metadata?: {
    tenantRegion?: string
    cloudInstance?: string
  }
}

function getCloudTypeName(cloudInstance: string | undefined): string {
  if (!cloudInstance) return 'Global'
  
  const instance = cloudInstance.toLowerCase()
  
  if (instance.includes('microsoftonline.us')) {
    return 'US Government'
  }
  if (instance.includes('microsoftonline.cn') || instance.includes('partner.microsoftonline.cn')) {
    return 'China (21Vianet)'
  }
  if (instance.includes('microsoftonline.de')) {
    return 'Germany'
  }
  if (instance === 'microsoftonline.com') {
    return 'Global'
  }
  
  return cloudInstance
}

export function normalizeDomain(input: string): string {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return ''

  if (trimmed.includes('@')) {
    const afterAt = trimmed.split('@').pop() ?? ''
    return afterAt.trim()
  }

  if (trimmed.includes('://')) {
    try {
      const url = new URL(trimmed)
      return url.hostname.toLowerCase()
    } catch {
      // fall through
    }
  }

  return trimmed.replace(/^\.+/, '').replace(/\/$/, '')
}

export async function resolveTenantIdForDomain(domainInput: string): Promise<TenantLookupResult> {
  const domain = normalizeDomain(domainInput)
  if (!domain) {
    throw new Error('empty_domain')
  }

  const wellKnownUrl = `https://login.microsoftonline.com/${encodeURIComponent(
    domain,
  )}/v2.0/.well-known/openid-configuration`

  const response = await fetch(wellKnownUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`http_${response.status}`)
  }

  const data = (await response.json()) as {
    issuer?: string
    tenant_region_scope?: string
    cloud_instance_name?: string
  }
  const issuer = data.issuer ?? ''

  // Example issuer: https://login.microsoftonline.com/<tenantId>/v2.0
  const match = issuer.match(
    /https:\/\/login\.microsoftonline\.com\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i,
  )

  if (!match?.[1]) {
    throw new Error('tenant_not_found')
  }

  return {
    domain,
    tenantId: match[1],
    resolvedAt: new Date().toISOString(),
    metadata: {
      tenantRegion: data.tenant_region_scope,
      cloudInstance: getCloudTypeName(data.cloud_instance_name),
    },
  }
}
