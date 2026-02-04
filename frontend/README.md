# Frontend

Vite + React + TypeScript SPA for https://wieistmeinetenantid.de/.

It resolves an Azure / Microsoft 365 tenant ID by querying the Microsoft OIDC well-known configuration for a domain and extracting the GUID from the `issuer`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Configuration

### Unsplash backgrounds (optional)

This app can show a daily "wallpaper" background using the Unsplash API.

- Configure `VITE_UNSPLASH_ACCESS_KEY` in `.env.local` (see `.env.example`).
- Do **not** put the Unsplash *Secret Key* into any frontend env file.
- If Unsplash is unavailable (or the key is missing), the app automatically falls back to a locally generated SVG background.

## Static files

Served from `public/`:

- `imprint.html`, `privacy.html`
- `robots.txt`, `sitemap.xml`
- `favicon.svg`
