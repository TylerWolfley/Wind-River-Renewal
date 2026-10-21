import Script from "next/script";

export function LegacyPage({ page }) {
  return (
    <>
      {page.redirectTo ? (
        <>
          <meta httpEquiv="refresh" content={`0;url=${page.redirectTo}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.location.replace(${JSON.stringify(page.redirectTo)} + window.location.search + window.location.hash);`
            }}
          />
        </>
      ) : null}
      {page.headStyles.map((css, index) => (
        <style key={`style-${index}`} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      {page.jsonLd.map((json, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
        />
      ))}
      <div className="legacy-page" dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />
      {(page.scripts || []).map(src => <Script key={src} src={src} strategy="afterInteractive" />)}
    </>
  );
}
