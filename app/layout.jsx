import Script from "next/script";
import { site } from "@/content/site";
import { legacyRedirects } from "@/content/generated-pages";

export const metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  icons: {
    icon: [
      { url: "/wrr-favicon.ico" },
      { url: "/assets/logo-256.png", type: "image/png", sizes: "256x256" }
    ]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="stylesheet" href="/assets/style.css" />
      </head>
      <body className="light">
        <Script
          id="legacy-path-redirects"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var redirects = ${JSON.stringify(legacyRedirects)};
                var target = redirects[window.location.pathname.replace(/\\/+$/, "")] || redirects[window.location.pathname];
                if (!target) return;
                window.location.replace(target + window.location.search + window.location.hash);
              })();
            `
          }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config','${site.gaMeasurementId}');
            `
          }}
        />
        {children}
      </body>
    </html>
  );
}
