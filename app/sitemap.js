import { pages } from "@/content/generated-pages";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap() {
  return pages
    .filter((page) => page.includeInSitemap)
    .map((page) => ({
      url: `${site.url}${page.publicPath === "/" ? "" : page.publicPath}`,
      changeFrequency: page.changeFrequency || "monthly",
      priority: page.priority || 0.7
    }));
}
