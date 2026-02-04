type BackgroundSpec = {
  seed: number
  dateKey: string
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let [r1, g1, b1] = [0, 0, 0]

  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0]
  else if (hp < 2) [r1, g1, b1] = [x, c, 0]
  else if (hp < 3) [r1, g1, b1] = [0, c, x]
  else if (hp < 4) [r1, g1, b1] = [0, x, c]
  else if (hp < 5) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]

  const m = l - c / 2
  return {
    r: clampByte((r1 + m) * 255),
    g: clampByte((g1 + m) * 255),
    b: clampByte((b1 + m) * 255),
  }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`
}

function getDailySpec(storageKey = 'randomBackground:v1'): BackgroundSpec {
  const today = new Date()
  const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`

  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw) as { dateKey?: string; seed?: number }
      if (parsed?.dateKey === dateKey && typeof parsed.seed === 'number') {
        return { dateKey, seed: parsed.seed }
      }
    }
  } catch {
    // ignore
  }

  const seed = Math.floor(Math.random() * 1_000_000_000)
  try {
    localStorage.setItem(storageKey, JSON.stringify({ dateKey, seed }))
  } catch {
    // ignore
  }

  return { dateKey, seed }
}

export function getRandomBackgroundDataUrl(): string {
  const { seed } = getDailySpec()
  const rand = mulberry32(seed)

  const width = 1600
  const height = 900

  const hueA = Math.floor(rand() * 360)
  const hueB = (hueA + 40 + Math.floor(rand() * 90)) % 360

  const colorA = rgbToHex(hslToRgb(hueA, 0.55, 0.92))
  const colorB = rgbToHex(hslToRgb(hueB, 0.55, 0.86))
  const accent = rgbToHex(hslToRgb((hueA + 200) % 360, 0.75, 0.55))

  const circles: string[] = []
  const count = 14
  for (let i = 0; i < count; i++) {
    const cx = Math.floor(rand() * width)
    const cy = Math.floor(rand() * height)
    const r = Math.floor(80 + rand() * 260)
    const opacity = (0.06 + rand() * 0.08).toFixed(3)
    circles.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" opacity="${opacity}" />`,
    )
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <g filter="url(#blur)">
    ${circles.join('\n    ')}
  </g>
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
