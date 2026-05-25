# Wind River Renewal Migration Inventory

Generated: 2026-05-25T16:16:40.944Z

## Route Inventory

| Source file                  | Old URL                       | New route                 | Canonical                                             | Schemas | Forms | Sitemap |
| ---------------------------- | ----------------------------- | ------------------------- | ----------------------------------------------------- | ------- | ----- | ------- |
| index.html                   | /index.html                   | /                         | https://windriverrenewal.com/                         | 1       | 0     | yes     |
| services.html                | /services.html                | /services/                | https://windriverrenewal.com/services/                | 2       | 0     | yes     |
| gallery.html                 | /gallery.html                 | /gallery/                 | https://windriverrenewal.com/gallery/                 | 1       | 0     | yes     |
| about.html                   | /about.html                   | /about/                   | https://windriverrenewal.com/about/                   | 1       | 0     | yes     |
| contact.html                 | /contact.html                 | /contact/                 | https://windriverrenewal.com/contact/                 | 1       | 0     | yes     |
| quote.html                   | /quote.html                   | /quote/                   | https://windriverrenewal.com/quote/                   | 0       | 1     | yes     |
| thanks.html                  | /thanks.html                  | /thanks/                  | https://windriverrenewal.com/thanks/                  | 0       | 0     | no      |
| junk-removal-riverton.html   | /junk-removal-riverton.html   | /junk-removal-riverton/   | https://windriverrenewal.com/junk-removal-riverton/   | 2       | 1     | yes     |
| junk-removal-lander.html     | /junk-removal-lander.html     | /junk-removal-lander/     | https://windriverrenewal.com/junk-removal-lander/     | 2       | 1     | yes     |
| junk-removal-dubois-wy.html  | /junk-removal-dubois-wy.html  | /junk-removal-dubois-wy/  | https://windriverrenewal.com/junk-removal-dubois-wy/  | 2       | 1     | yes     |
| junk-removal-casper.html     | /junk-removal-casper.html     | /junk-removal-casper/     | https://windriverrenewal.com/junk-removal-casper/     | 2       | 1     | yes     |
| locations/index.html         | /locations/index.html         | /locations/               | https://windriverrenewal.com/locations/               | 1       | 0     | yes     |
| locations/bar-nunn.html      | /locations/bar-nunn.html      | /locations/bar-nunn/      | https://windriverrenewal.com/locations/bar-nunn/      | 2       | 0     | yes     |
| locations/casper.html        | /locations/casper.html        | /junk-removal-casper/     | https://windriverrenewal.com/junk-removal-casper/     | 0       | 0     | no      |
| locations/ethete.html        | /locations/ethete.html        | /locations/ethete/        | https://windriverrenewal.com/locations/ethete/        | 2       | 0     | yes     |
| locations/evansville.html    | /locations/evansville.html    | /locations/evansville/    | https://windriverrenewal.com/locations/evansville/    | 2       | 0     | yes     |
| locations/fort-washakie.html | /locations/fort-washakie.html | /locations/fort-washakie/ | https://windriverrenewal.com/locations/fort-washakie/ | 2       | 0     | yes     |
| locations/hudson.html        | /locations/hudson.html        | /locations/hudson/        | https://windriverrenewal.com/locations/hudson/        | 2       | 0     | yes     |
| locations/mills.html         | /locations/mills.html         | /locations/mills/         | https://windriverrenewal.com/locations/mills/         | 2       | 0     | yes     |
| locations/pavillion.html     | /locations/pavillion.html     | /locations/pavillion/     | https://windriverrenewal.com/locations/pavillion/     | 2       | 0     | yes     |
| locations/shoshoni.html      | /locations/shoshoni.html      | /locations/shoshoni/      | https://windriverrenewal.com/locations/shoshoni/      | 2       | 0     | yes     |

## Redirect Strategy

The project is configured for static export because the existing repository contains a root CNAME for windriverrenewal.com. Clean routes export as directory index pages such as /services/ and /locations/bar-nunn/. Legacy .html URLs are covered by generated static redirect stubs in public/, while provider-native redirect files are generated for Netlify (_redirects) and Vercel (vercel.json) to preserve true 301 behavior where supported. /index.html and /locations/index.html cannot have separate static stubs without replacing the clean page entry, so the App Router layout includes a beforeInteractive client redirect for those two paths.

| Legacy URL                    | Target                    |
| ----------------------------- | ------------------------- |
| /index.html                   | /                         |
| /services.html                | /services/                |
| /gallery.html                 | /gallery/                 |
| /about.html                   | /about/                   |
| /contact.html                 | /contact/                 |
| /quote.html                   | /quote/                   |
| /thanks.html                  | /thanks/                  |
| /junk-removal-riverton.html   | /junk-removal-riverton/   |
| /junk-removal-lander.html     | /junk-removal-lander/     |
| /junk-removal-dubois-wy.html  | /junk-removal-dubois-wy/  |
| /junk-removal-casper.html     | /junk-removal-casper/     |
| /locations/index.html         | /locations/               |
| /locations/bar-nunn.html      | /locations/bar-nunn/      |
| /locations/casper.html        | /junk-removal-casper/     |
| /locations/ethete.html        | /locations/ethete/        |
| /locations/evansville.html    | /locations/evansville/    |
| /locations/fort-washakie.html | /locations/fort-washakie/ |
| /locations/hudson.html        | /locations/hudson/        |
| /locations/mills.html         | /locations/mills/         |
| /locations/pavillion.html     | /locations/pavillion/     |
| /locations/shoshoni.html      | /locations/shoshoni/      |
| /locations/casper             | /junk-removal-casper/     |

## Verification Checklist

- Build with npm run build.
- Crawl clean routes and legacy .html URLs.
- Confirm legacy redirects preserve query strings for UTM parameters.
- Confirm Formspree action, hidden UTM fields, quote summary script, photo input UX, and thanks-page lead event are still present.
- Confirm GA4 id G-038JRWGVWW, click_to_call tracking, and generate_lead tracking hooks are present.
- Confirm JSON-LD, canonical, OpenGraph, Twitter metadata, robots, sitemap, and robots.txt output.
- Confirm real business images render from /assets/images and /assets/images/optimized.
