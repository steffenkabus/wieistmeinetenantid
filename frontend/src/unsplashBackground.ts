export type UnsplashAttribution = {
  photoUrl: string
  photographerName: string
  photographerUrl: string
}

export type UnsplashBackground = {
  url: string
  attribution: UnsplashAttribution
}

type CachedValue = {
  dateKey: string
  value: UnsplashBackground
}

const CACHE_KEY = 'unsplashBackground:v1'

function getDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

function withUtm(url: string, source = 'wieistmeinetenantid'): string {
  const u = new URL(url)
  u.searchParams.set('utm_source', source)
  u.searchParams.set('utm_medium', 'referral')
  return u.toString()
}

function buildImageUrl(raw: string): string {
  const u = new URL(raw)
  u.searchParams.set('auto', 'format')
  u.searchParams.set('fit', 'max')
  u.searchParams.set('q', '80')
  u.searchParams.set('w', '2400')
  return u.toString()
}

function loadCached(): CachedValue | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null

    const obj = parsed as { dateKey?: unknown; value?: unknown }
    if (typeof obj.dateKey !== 'string') return null

    const val = obj.value as {
      url?: unknown
      attribution?: { photoUrl?: unknown; photographerName?: unknown; photographerUrl?: unknown }
    }

    if (typeof val?.url !== 'string') return null
    if (typeof val?.attribution?.photoUrl !== 'string') return null
    if (typeof val?.attribution?.photographerName !== 'string') return null
    if (typeof val?.attribution?.photographerUrl !== 'string') return null

    return {
      dateKey: obj.dateKey,
      value: {
        url: val.url,
        attribution: {
          photoUrl: val.attribution.photoUrl,
          photographerName: val.attribution.photographerName,
          photographerUrl: val.attribution.photographerUrl,
        },
      },
    }
  } catch {
    return null
  }
}

function saveCached(value: CachedValue): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

type UnsplashRandomPhotoResponse = {
  urls?: { raw?: string }
  links?: { html?: string; download_location?: string }
  user?: { name?: string; links?: { html?: string } }
}

async function hitDownloadLocation(downloadLocation: string, accessKey: string): Promise<void> {
  try {
    await fetch(downloadLocation, {
      method: 'GET',
      headers: { Authorization: `Client-ID ${accessKey}` },
    })
  } catch {
    // ignore
  }
}

export async function getDailyUnsplashBackground(): Promise<UnsplashBackground | null> {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  if (!accessKey) return null

  const todayKey = getDateKey()
  const cached = loadCached()
  if (cached?.dateKey === todayKey) return cached.value

  const endpoint = new URL('https://api.unsplash.com/photos/random')
  endpoint.searchParams.set('orientation', 'landscape')
  endpoint.searchParams.set('content_filter', 'high')
  endpoint.searchParams.set('query', 'landscape nature')

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) return null

  const data = (await response.json()) as UnsplashRandomPhotoResponse

  const rawUrl = data.urls?.raw
  const photoHtml = data.links?.html
  const downloadLocation = data.links?.download_location
  const photographerName = data.user?.name
  const photographerHtml = data.user?.links?.html

  if (!rawUrl || !photoHtml || !photographerName || !photographerHtml) return null

  const result: UnsplashBackground = {
    url: buildImageUrl(rawUrl),
    attribution: {
      photoUrl: withUtm(photoHtml),
      photographerName,
      photographerUrl: withUtm(photographerHtml),
    },
  }

  saveCached({ dateKey: todayKey, value: result })

  if (downloadLocation) {
    void hitDownloadLocation(downloadLocation, accessKey)
  }

  return result
}
