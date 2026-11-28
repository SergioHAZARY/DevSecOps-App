import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { asset, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: { default: `${site.name} - ${site.slogan.fr}`, template: `%s · ${site.name}` },
  description: site.slogan.fr,
  manifest: "manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: site.name },
  icons: {
    // Next prepends basePath to `manifest` but NOT to `icons`, so set the path explicitly.
    icon: [
      { url: asset("/icons/icon.svg"), type: "image/svg+xml" },
      { url: asset("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: asset("/icons/icon-192.png"), sizes: "192x192" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#047857" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1720" },
  ],
};

// Keeps <html lang>/<dir> in sync with the locale segment of the URL, in a static export
// where only this root layout can render the <html> element.
const LANG_SYNC = `(function(){try{var l=location.pathname.split('/')[1];if(l==='fr'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_SYNC }} />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
