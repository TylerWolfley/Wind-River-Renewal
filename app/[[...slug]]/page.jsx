import { notFound } from "next/navigation";
import { LegacyPage } from "@/components/LegacyPage";
import { pages } from "@/content/generated-pages";
import { routeFromSlug, getPageByRoute } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = getPageByRoute(routeFromSlug(resolvedParams?.slug));

  if (!page) return {};

  return {
    title: page.title,
    description: page.description || undefined,
    applicationName: page.applicationName || "Wind River Renewal",
    robots: page.robots || undefined,
    alternates: {
      canonical: page.canonical
    },
    openGraph: page.openGraph,
    twitter: page.twitter
  };
}

export default async function CatchAllPage({ params }) {
  const resolvedParams = await params;
  const page = getPageByRoute(routeFromSlug(resolvedParams?.slug));

  if (!page) {
    notFound();
  }

  return <LegacyPage page={page} />;
}
