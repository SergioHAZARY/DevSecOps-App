import Link from "next/link";
import { basePath } from "@/lib/site";
import { defaultLocale } from "@/lib/types";

// The site has no un-prefixed pages: send visitors to the default language.
// Written as a client redirect + <noscript> link so it works as a static file
// (GitHub Pages / offline / Android) with no server to issue a 3xx.
const REDIRECT = `(function(){try{var l=(navigator.language||'fr').slice(0,2);location.replace('${basePath}/'+(l==='en'?'en':'${defaultLocale}')+'/');}catch(e){location.replace('${basePath}/${defaultLocale}/');}})();`;

export default function RootRedirect() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <div>
        <p className="text-lg font-semibold">DevSecOps App</p>
        <p className="mt-2 text-muted-foreground">
          <Link href={`/${defaultLocale}`} className="text-primary underline">
            Continuer / Continue →
          </Link>
        </p>
      </div>
    </main>
  );
}
