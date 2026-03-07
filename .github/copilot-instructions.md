# Copilot Instructions for Wind River Renewal

## Project Overview

Wind River Renewal is a **static HTML website** for a junk removal, cleanout, and light demolition business based in Riverton, Wyoming, serving Fremont County and Natrona County (Riverton, Lander, Casper). Owner-operated by Tyler Wolfley.

- **Phone/text:** 307-349-4694
- **Live site:** https://windriverrenewal.com
- **Google Analytics ID:** G-038JRWGVWW

## Tech Stack

- **Pure static HTML/CSS/JS** — no build system, no package manager, no framework.
- Each page is a standalone `.html` file.
- Shared styles live in `assets/style.css` (single source of truth for all styling).
- Shared JavaScript lives in `assets/script.js` (vanilla JS, IIFE pattern, no transpilation).
- The homepage (`index.html`) uses **Swiper@11** (loaded from CDN) for the photo slider.
- No Node.js, no npm, no bundler — do not introduce them.

## File Structure

```
index.html               # Homepage
about.html
contact.html
gallery.html
services.html
quote.html
thanks.html              # Post-form-submit confirmation page
junk-removal-lander.html
junk-removal-riverton.html
locations/               # Per-city landing pages
assets/
  style.css              # All CSS
  script.js              # All JS
  images/                # Photos and logo
  logo-256.png
  og-cover.jpg.jpg
CNAME                    # windriverrenewal.com
robots.txt
sitemap.xml
```

## CSS Conventions

- CSS custom properties (variables) are defined in `:root` in `style.css`.
- Key brand colors:
  - `--primary: #2563eb` (blue)
  - `--primary-ink: #ffffff`
  - `--bg: #f7f7f8`
  - `--text: #0f172a`
  - `--muted: #64748b`
- Spacing scale: `--s-1` (8px) through `--s-7` (64px).
- Container widths: `--container: 1100px`, `--container-hero: 1240px`.
- Border radius: `--radius: 16px` (and `--radius-sm`, `--radius-md`, `--radius-lg` variants).
- Do **not** add new CSS frameworks or utility libraries.
- Keep selectors minimal and avoid adding new class hierarchies unnecessarily.

## JavaScript Conventions

- All JS is in `assets/script.js`, wrapped in a single IIFE with `"use strict"`.
- Vanilla DOM APIs only — no jQuery or other libraries.
- The script handles:
  - UTM parameter preservation on `.js-keep-utm` links
  - Filling hidden UTM fields in forms
  - GA4 event tracking for click-to-call and form submissions
  - Mobile nav toggle (`.nav-toggle` button + `#site-nav` element, toggling `nav-open` on `<body>`)

## HTML Conventions

- Every page includes: `<!doctype html>`, `<html lang="en">`, charset, viewport meta, canonical link, favicon links, Open Graph/Twitter card meta, GA4 snippet, and `<script src="assets/script.js" defer>`.
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, etc.).
- Phone links use `tel:` and text links use `sms:` scheme: `<a href="tel:3073494694">`.
- CTAs that should preserve UTMs must include the `js-keep-utm` class.
- Form hidden inputs for UTMs use `name="utm_source"` etc.

## Photos & Media

- Homepage uses a **Swiper slider** (CDN swiper@11) with real job photos.
- Non-homepage pages use `.job-photo-wrap` (styled in `style.css`) to display one trust photo.
- Gallery is a secondary archive page; avoid adding more gallery entries unless explicitly asked.
- Image files live in `assets/images/`.

## Mobile / Responsive

- The `.sticky-bar` Call/Text bottom bar is **mobile-only**; it is hidden via `@media (min-width: 960px) { .sticky-bar { display: none } }`.
- Do **not** re-add the sticky bar as fixed/visible on desktop.
- Breakpoint for desktop layout changes is generally `960px`.

## SEO

- Each page must have a unique `<title>` and `<meta name="description">`.
- `<link rel="canonical">` must point to the correct absolute URL.
- `sitemap.xml` should be updated when pages are added or removed.
- Schema.org structured data (`application/ld+json`) is present on the homepage.

## What to Avoid

- Do not introduce a build system, bundler, or package manager.
- Do not add CSS frameworks (Bootstrap, Tailwind, etc.).
- Do not add JS frameworks or libraries (React, Vue, jQuery, etc.).
- Do not change the Google Analytics tracking ID.
- Do not modify the `.sticky-bar` to be visible on desktop.
- Do not add tracking pixels or third-party scripts without explicit approval.
