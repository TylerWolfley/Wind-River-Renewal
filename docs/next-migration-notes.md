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
