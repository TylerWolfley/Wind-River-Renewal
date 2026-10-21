# Next.js Migration Notes

## Current Phase

This branch is a parity-first migration. The existing HTML pages are preserved as generated legacy content and rendered through the Next.js App Router. Business, location, gallery, FAQ, and CTA data now have CMS-friendly config files under `src/content/` for later extraction into Decap, Sanity, or component-native content.

## Local Commands

- `npm run dev` starts the Next development server.
- `npm run inventory` regenerates `src/content/generated-pages.js`, legacy redirect files, `vercel.json`, and this migration inventory from the original static HTML.
- `npm run build` creates the static export in `out/`.
- `npm run preview` serves the exported `out/` directory locally.

## Deployment

The app is configured with `output: "export"` and `trailingSlash: true` for static hosting compatibility. The existing `CNAME` is copied into `public/` so static exports keep `windriverrenewal.com`.

GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`. On every push to `main`, the workflow installs dependencies, regenerates migration content/assets, builds the static export, uploads `out/`, and deploys it to Pages.

In GitHub, confirm `Settings > Pages > Build and deployment > Source` is set to `GitHub Actions`.

Legacy `.html` URLs are covered three ways:

- Static redirect stubs in `public/` for static hosts.
- `public/_redirects` for Netlify-style 301 redirects.
- `vercel.json` for Vercel-style 301 redirects.

## Manual Review

- Confirm the production host serves trailing-slash clean URLs such as `/services/`.
- Confirm the GitHub Pages workflow completes after merge.
- Submit a real Formspree test only when ready to send a live lead email.
- Confirm GA4 events in production/debug view after deployment.
- Review the preserved copy and layout before starting a redesign pass.

## Local review refresh

The HTML files at the repository root and in `locations/` remain the page source. Do not edit `generated-pages.js` or `public/assets/` directly: inventory regenerates them. The shared form is maintained in `src/content/quote-form.html` and expanded at `WRR_QUOTE_FORM` markers. Shared interactions live in `assets/` and load through Next Script. The gallery uses a static, responsive photo layout.

Run inventory before building. `npm run preview` now uses the dependency-free local server at `127.0.0.1:4173`. It adds a review banner and blocks external form submissions and analytics using response headers; exported production files retain their Formspree integration. Set PORT to choose another local port. `--test` omits that preview guard only for browser tests which intercept all external requests.

The form requires name, phone or email, location, and job description. Qualification details are optional. Photos are sent by text: a live check confirmed the existing Formspree account rejects file uploads. Formspree endpoint `mqadaqdp`, UTM fields, contact links, and the Google Business Profile link are retained. AJAX success requires both a successful HTTP status and an explicit `ok: true` JSON response. Errors and timeouts retain entered details and permit retry. Lead events fire only after confirmed acceptance, not on submit or a direct visit to the thanks page. The thanks URL remains available for native form fallback.

Browser regression checks: run `scripts/verify-site.cjs` with Playwright available (`PLAYWRIGHT_MODULE` can supply an installed module path). It expects the guarded test server, supports `TEST_URL`, `TEST_OUTPUT`, and `BROWSER_PATH`, blocks all external traffic, and mocks Formspree. An authorized text-only live test was accepted by Formspree; inbox delivery was not confirmed. GA ingestion remains unverified.
