# wieistmeinetenantid.de

Single-page web app to resolve the Azure / Microsoft 365 tenant ID for a given domain.

The app runs entirely in the browser and looks up the tenant ID by requesting the Microsoft OpenID Connect well-known configuration and extracting the GUID from the `issuer` URL.

Live site: https://wieistmeinetenantid.de/

## What it does

- Resolves a tenant ID from a domain like `contoso.com` (also accepts `user@contoso.com` and full URLs).
- Shows the last result and keeps a small lookup history (last 5) in `localStorage`.
- Supports English/German (auto-detect via browser language).
- Polished UI built with Elastic EUI.
- Static legal pages:
  - `/imprint.html`
  - `/privacy.html`

## How tenant resolution works

The resolver calls:

`https://login.microsoftonline.com/<domain>/v2.0/.well-known/openid-configuration`

and parses the returned `issuer` value:

`https://login.microsoftonline.com/<tenantId>/v2.0`

Implementation: `frontend/src/tenantResolver.ts`.

## Tech stack

- React + TypeScript + Vite (build output: `frontend/dist`)
- Elastic EUI (`@elastic/eui`)
- i18next (`react-i18next`)

## Repository structure

- `frontend/` – the actual web app
- `.github/workflows/azure-staticwebapp.yml` – GitHub Actions deploy to Azure Static Web Apps

## Local development

Prerequisites:

- Node.js (LTS recommended)
- npm

Install dependencies:

```bash
cd frontend
npm ci
```

Run dev server:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Configuration (optional)

### Unsplash daily background

The app can show a daily background image from Unsplash.

- Set `VITE_UNSPLASH_ACCESS_KEY` (see `frontend/.env.example`).
- Put it into `frontend/.env.local` for local dev.
- Do not put Unsplash secret keys into any frontend environment file.

If the key is missing or Unsplash is unavailable, the app falls back to a locally generated SVG background.

## Static assets / SEO

These files are served as-is from `frontend/public/`:

- `imprint.html` and `privacy.html` (legal pages)
- `robots.txt`
- `sitemap.xml`
- `favicon.svg`

The canonical URL in the app is set to `https://wieistmeinetenantid.de/`.

## Deployment (Azure Static Web Apps)

This repo includes a GitHub Actions workflow that builds and deploys `frontend/` to Azure Static Web Apps:

- Workflow: `.github/workflows/azure-staticwebapp.yml`
- App location: `/frontend`
- Build output: `dist`

To enable deployments:

1. Create an Azure Static Web App.
2. In GitHub repo settings, add the secret `AZURE_STATIC_WEB_APPS_API_TOKEN` containing the SWA deployment token.
3. Push to `main`.

## Troubleshooting

### "Cannot use 'in' operator to search for 'useId' in undefined" after deployment

This error indicates the deployed JS bundle is evaluating React usage incorrectly (e.g. a bad React import shape, duplicate React copies, or stale/corrupted build artifacts).

Recommended checks:

1. Make sure the SWA deployment is serving the latest build (try a hard reload, or redeploy).
2. Verify React versions are consistent:

	```bash
	cd frontend
	npm ls react react-dom
	```

3. Ensure there is only one copy of React in the dependency tree (no duplicates).
4. Rebuild from scratch:

	```bash
	cd frontend
	rm -rf node_modules dist
	npm ci
	npm run build
	```

If the issue persists, open an issue with:

- the deployed URL
- the exact stack trace
- the output of `npm ls react react-dom`

## License

No license is currently specified.