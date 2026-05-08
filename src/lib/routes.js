import { pages, legacyRedirects } from "@/content/generated-pages";

export function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  const withoutQuery = pathname.split("?")[0].split("#")[0];
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : "/";
}

export function routeFromSlug(slug) {
  const segments = Array.isArray(slug) ? slug : [];
  return segments.length ? `/${segments.join("/")}` : "/";
}

export function getPageByRoute(route) {
  const normalized = normalizePath(route);
  return pages.find((page) => page.route === normalized);
}

export function getLegacyRedirectTarget(pathname) {
  return legacyRedirects[normalizePath(pathname)] || null;
}
