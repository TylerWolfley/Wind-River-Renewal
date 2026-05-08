import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const siteUrl = "https://windriverrenewal.com";
const generatedAt = new Date().toISOString();

const topLevelOrder = [
  "index.html",
  "services.html",
  "gallery.html",
  "about.html",
  "contact.html",
  "quote.html",
  "thanks.html",
  "junk-removal-riverton.html",
  "junk-removal-lander.html",
  "junk-removal-dubois-wy.html",
  "junk-removal-casper.html"
];

const locationOrder = [
  "locations/index.html",
  "locations/bar-nunn.html",
  "locations/casper.html",
  "locations/ethete.html",
  "locations/evansville.html",
  "locations/fort-washakie.html",
  "locations/hudson.html",
  "locations/mills.html",
  "locations/pavillion.html",
  "locations/shoshoni.html"
];

const legacyFiles = [...topLevelOrder, ...locationOrder].filter((file) =>
  fs.existsSync(path.join(root, file))
);

function routeForFile(file) {
  if (file === "index.html") return "/";
  if (file === "locations/index.html") return "/locations";
  return `/${file.replace(/\.html$/, "")}`;
}

function oldPathForFile(file) {
  return `/${file.replaceAll("\\", "/")}`;
}

function mapOldPath(oldPath) {
  const normalized = normalizePath(oldPath);
  if (normalized === "/index.html") return "/";
  if (normalized === "/locations/index.html") return "/locations/";
  if (normalized === "/locations/casper.html") return "/junk-removal-casper/";
  if (normalized.endsWith(".html")) return publicPathForRoute(normalized.replace(/\.html$/, ""));
  if (normalized === "/locations/") return "/locations/";
  if (/\.[a-z0-9]+$/i.test(normalized)) return normalized;
  return publicPathForRoute(normalized);
}

function publicPathForRoute(route) {
  if (!route || route === "/") return "/";
  return `${route.replace(/\/+$/, "")}/`;
}

function normalizePath(value) {
  if (!value || value === "/") return "/";
  return value.replace(siteUrl, "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
}

const legacyRedirects = {};
for (const file of legacyFiles) {
  const oldPath = oldPathForFile(file);
  if (oldPath === "/index.html" || oldPath === "/locations/index.html") {
    legacyRedirects[oldPath] = mapOldPath(oldPath);
    continue;
  }
  legacyRedirects[oldPath] = mapOldPath(oldPath);
}
legacyRedirects["/locations/casper"] = "/junk-removal-casper/";

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ");
}

function getHead(html) {
  return html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
}

function getBody(html) {
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]?.trim() || "";
}

function getTitle(head) {
  return decodeHtml(head.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "");
}

function getMeta(head, key, attr = "(?:name|property)") {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = head.match(new RegExp(`<meta\\s+[^>]*${attr}=["']${escaped}["'][^>]*>`, "i"))?.[0];
  return tag ? decodeHtml(tag.match(/content=["']([^"']*)["']/i)?.[1] || "") : "";
}

function getCanonical(head, fallbackRoute) {
  const tag = head.match(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i)?.[0];
  const href = tag?.match(/href=["']([^"']*)["']/i)?.[1] || `${siteUrl}${publicPathForRoute(fallbackRoute) === "/" ? "" : publicPathForRoute(fallbackRoute)}`;
  return toAbsoluteUrl(mapHref(href, fallbackRoute));
}

function getStyles(head) {
  return [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) =>
    rewriteReferences(match[1].trim())
  );
}

function getJsonLd(head) {
  return [...head.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => rewriteReferences(match[1].trim())
  );
}

function mapHref(value, currentRoute = "/") {
  if (!value) return value;
  if (value.startsWith("#")) return value;
  if (/^(tel|mailto|sms):/i.test(value)) return value;

  if (value.startsWith(siteUrl)) {
    const url = new URL(value);
    const mappedPath = legacyRedirects[normalizePath(url.pathname)] || mapOldPath(url.pathname);
    url.pathname = mappedPath === "/" ? "/" : mappedPath;
    return url.toString();
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("//")) return value;

  const withoutDot = value.replace(/^\.\//, "");
  const assetPath = withoutDot.replace(/^(\.\.\/)+/, "");
  if (assetPath.startsWith("assets/")) return `/${assetPath}`;
  if (assetPath === "wrr-favicon.ico") return "/wrr-favicon.ico";

  const hash = value.includes("#") ? `#${value.split("#").slice(1).join("#")}` : "";
  const query = value.includes("?") ? `?${value.split("?")[1].split("#")[0]}` : "";
  const bare = value.split("?")[0].split("#")[0].replace(/^(\.\/)+/, "");

  if (!bare) return value;

  let candidate;
  if (bare.startsWith("/")) {
    candidate = bare;
  } else if (bare.startsWith("../")) {
    candidate = `/${bare.replace(/^(\.\.\/)+/, "")}`;
  } else if (currentRoute.startsWith("/locations/") && !bare.includes("/")) {
    candidate = `/locations/${bare}`;
  } else {
    candidate = `/${bare}`;
  }

  const target = legacyRedirects[normalizePath(candidate)] || mapOldPath(candidate);
  return `${target}${query}${hash}`;
}

function toAbsoluteUrl(value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value === "/" ? "" : value}`;
}

function rewriteSrcSet(value) {
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      const [url, ...rest] = trimmed.split(/\s+/);
      return [mapHref(url), ...rest].join(" ");
    })
    .join(", ");
}

function rewriteAttributes(html, currentRoute) {
  return html.replace(/\b(href|src|srcset|poster)=["']([^"']*)["']/gi, (full, attr, value) => {
    const rewritten = attr.toLowerCase() === "srcset" ? rewriteSrcSet(value) : mapHref(value, currentRoute);
    return `${attr}="${rewritten}"`;
  });
}

function rewriteSpecialFormValues(html) {
  return html.replace(/<input\b(?=[^>]*\bname=["']_redirect["'])[^>]*>/gi, (input) => {
    if (/\bvalue=["'][^"']*["']/i.test(input)) {
      return input.replace(/\bvalue=["'][^"']*["']/i, 'value="https://windriverrenewal.com/thanks/"');
    }
    return input.replace(/>$/, ' value="https://windriverrenewal.com/thanks/">');
  });
}

function rewriteReferences(value) {
  let next = value;
  for (const [oldPath, target] of Object.entries(legacyRedirects)) {
    next = next.replaceAll(`${siteUrl}${oldPath}`, toAbsoluteUrl(target));
    next = next.replaceAll(oldPath, target);
  }
  next = next.replaceAll("assets/", "/assets/");
  next = next.replaceAll('"wrr-favicon.ico"', '"/wrr-favicon.ico"');
  return next;
}

function pagePriority(route, sitemapEntries) {
  return sitemapEntries.get(route)?.priority || (route === "/" ? 1.0 : 0.7);
}

function pageChangeFrequency(route, sitemapEntries) {
  return sitemapEntries.get(route)?.changefreq || "monthly";
}

function readSitemapEntries() {
  const sitemapPath = path.join(root, "sitemap.xml");
  const entries = new Map();
  if (!fs.existsSync(sitemapPath)) return entries;
  const xml = fs.readFileSync(sitemapPath, "utf8");
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const block = match[1];
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim();
    if (!loc) continue;
    const route = legacyRedirects[normalizePath(new URL(loc).pathname)] || mapOldPath(new URL(loc).pathname);
    entries.set(route, {
      changefreq: block.match(/<changefreq>([\s\S]*?)<\/changefreq>/)?.[1]?.trim() || "monthly",
      priority: Number(block.match(/<priority>([\s\S]*?)<\/priority>/)?.[1]?.trim() || "0.7")
    });
  }
  return entries;
}

function buildPage(file, sitemapEntries) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const head = getHead(html);
  const sourceRoute = routeForFile(file);
  const route = file === "locations/casper.html" ? "/locations/casper" : sourceRoute;
  const publicPath = publicPathForRoute(route);
  const title = getTitle(head);
  const description = getMeta(head, "description");
  const canonical = getCanonical(head, route);
  const ogImage = getMeta(head, "og:image", "property");
  const twitterImage = getMeta(head, "twitter:image", "name");
  const robotsContent = getMeta(head, "robots", "name");
  const includeInSitemap =
    (sitemapEntries.has(route) || sitemapEntries.has(publicPath)) && route !== "/locations/casper";

  return {
    sourceFile: file,
    oldPath: oldPathForFile(file),
    route,
    publicPath,
    slug: route === "/" ? [] : route.slice(1).split("/"),
    redirectTo: file === "locations/casper.html" ? "/junk-removal-casper/" : null,
    title,
    description,
    applicationName: getMeta(head, "application-name"),
    canonical,
    robots: robotsContent ? { index: !robotsContent.includes("noindex") } : null,
    openGraph: {
      title: getMeta(head, "og:title", "property") || title,
      description: getMeta(head, "og:description", "property") || description,
      url: getMeta(head, "og:url", "property")
        ? toAbsoluteUrl(mapHref(getMeta(head, "og:url", "property"), route))
        : canonical,
      siteName: getMeta(head, "og:site_name", "property") || undefined,
      locale: getMeta(head, "og:locale", "property") || undefined,
      type: getMeta(head, "og:type", "property") || undefined,
      images: ogImage ? [{ url: rewriteReferences(ogImage) }] : undefined
    },
    twitter: {
      card: getMeta(head, "twitter:card", "name") || undefined,
      title: getMeta(head, "twitter:title", "name") || title,
      description: getMeta(head, "twitter:description", "name") || description,
      images: twitterImage ? [rewriteReferences(twitterImage)] : undefined
    },
    headStyles: getStyles(head),
    jsonLd: getJsonLd(head),
    thanksLeadEvent: file === "thanks.html",
    bodyHtml: rewriteSpecialFormValues(rewriteAttributes(getBody(html), route)),
    includeInSitemap,
    changeFrequency: pageChangeFrequency(publicPath, sitemapEntries),
    priority: pagePriority(publicPath, sitemapEntries)
  };
}

function compactObject(value) {
  if (Array.isArray(value)) return value.map(compactObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined && entry !== null && entry !== "")
      .map(([key, entry]) => [key, compactObject(entry)])
  );
}

function writeGeneratedPages(pages) {
  const normalized = pages.map((page) => compactObject(page));
  const file = `// Generated by scripts/extract-legacy-content.mjs on ${generatedAt}.
// Edit the source HTML or extraction script, then run npm run inventory.

export const pages = ${JSON.stringify(normalized, null, 2)};

export const legacyRedirects = ${JSON.stringify(legacyRedirects, null, 2)};
`;
  fs.writeFileSync(path.join(root, "src/content/generated-pages.js"), file);
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}

function copyStaticAssets() {
  const publicDir = path.join(root, "public");
  fs.mkdirSync(publicDir, { recursive: true });

  copyDirectory(path.join(root, "assets"), path.join(publicDir, "assets"));

  for (const file of ["CNAME", "wrr-favicon.ico"]) {
    const source = path.join(root, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(publicDir, file));
    }
  }

  fs.writeFileSync(path.join(publicDir, ".nojekyll"), "");
}

function redirectHtml(from, to) {
  const absolute = toAbsoluteUrl(to);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="${absolute}" />
  <meta http-equiv="refresh" content="0;url=${to}" />
  <title>Redirecting | Wind River Renewal</title>
  <script>
    window.location.replace(${JSON.stringify(to)} + window.location.search + window.location.hash);
  </script>
</head>
<body>
  <p>This page has moved. <a href="${to}">Continue to Wind River Renewal</a>.</p>
</body>
</html>
`;
}

function writeRedirectStubs() {
  const legacyStubCandidates = Object.keys(legacyRedirects)
    .filter((from) => from.endsWith(".html") && from !== "/index.html")
    .map((from) => path.join(root, "public", from.slice(1)));

  for (const targetPath of legacyStubCandidates) {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true });
    }
  }

  for (const [from, to] of Object.entries(legacyRedirects)) {
    if (from === "/index.html" || from === "/locations/index.html" || from === "/locations/casper") continue;
    const targetPath = path.join(root, "public", from.slice(1));
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, redirectHtml(from, to));
  }

  const redirectLines = Object.entries(legacyRedirects)
    .map(([from, to]) => `${from} ${to} 301!`)
    .join("\n");
  fs.writeFileSync(path.join(root, "public/_redirects"), `${redirectLines}\n`);

  const vercel = {
    redirects: Object.entries(legacyRedirects)
      .map(([source, destination]) => ({ source, destination, permanent: true }))
  };
  fs.writeFileSync(path.join(root, "vercel.json"), `${JSON.stringify(vercel, null, 2)}\n`);
}

function markdownTable(rows) {
  const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => String(row[col]).length)));
  return rows
    .map((row, index) => {
      const line = `| ${row.map((cell, col) => String(cell).padEnd(widths[col])).join(" | ")} |`;
      if (index === 0) {
        return `${line}\n| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;
      }
      return line;
    })
    .join("\n");
}

function writeInventory(pages) {
  const rows = [
    ["Source file", "Old URL", "New route", "Canonical", "Schemas", "Forms", "Sitemap"],
    ...pages.map((page) => [
      page.sourceFile,
      page.oldPath,
      page.redirectTo || page.publicPath,
      page.canonical,
      page.jsonLd.length,
      (page.bodyHtml.match(/<form\b/gi) || []).length,
      page.includeInSitemap ? "yes" : "no"
    ])
  ];

  const redirectRows = [
    ["Legacy URL", "Target"],
    ...Object.entries(legacyRedirects).map(([from, to]) => [from, to])
  ];

  const markdown = `# Wind River Renewal Migration Inventory

Generated: ${generatedAt}

## Route Inventory

${markdownTable(rows)}

## Redirect Strategy

The project is configured for static export because the existing repository contains a root CNAME for windriverrenewal.com. Clean routes export as directory index pages such as /services/ and /locations/bar-nunn/. Legacy .html URLs are covered by generated static redirect stubs in public/, while provider-native redirect files are generated for Netlify (_redirects) and Vercel (vercel.json) to preserve true 301 behavior where supported. /index.html and /locations/index.html cannot have separate static stubs without replacing the clean page entry, so the App Router layout includes a beforeInteractive client redirect for those two paths.

${markdownTable(redirectRows)}

## Verification Checklist

- Build with npm run build.
- Crawl clean routes and legacy .html URLs.
- Confirm legacy redirects preserve query strings for UTM parameters.
- Confirm Formspree action, hidden UTM fields, quote summary script, photo input UX, and thanks-page lead event are still present.
- Confirm GA4 id G-038JRWGVWW, click_to_call tracking, and generate_lead tracking hooks are present.
- Confirm JSON-LD, canonical, OpenGraph, Twitter metadata, robots, sitemap, and robots.txt output.
- Confirm real business images render from /assets/images and /assets/images/optimized.
`;

  fs.writeFileSync(path.join(root, "docs/migration-route-inventory.md"), markdown);
}

const sitemapEntries = readSitemapEntries();
const pages = legacyFiles.map((file) => buildPage(file, sitemapEntries));
copyStaticAssets();
writeGeneratedPages(pages);
writeRedirectStubs();
writeInventory(pages);

console.log(`Generated ${pages.length} page entries, ${Object.keys(legacyRedirects).length} redirects, and migration inventory.`);
