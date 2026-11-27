import Link from "next/link";
import { Home } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getDictionary } from "@/lib/i18n";
import { defaultLocale } from "@/lib/types";

// Global 404 (also the offline fallback for unknown routes). Root-level, so it
// renders its own minimal chrome rather than the locale layout.
export default function NotFound() {
  const dict = getDictionary(defaultLocale);
  return (
    <ThemeProvider>
      <main className="grid min-h-dvh place-items-center p-8 text-center">
        <div>
          <p className="text-6xl font-bold text-primary">404</p>
          <h1 className="mt-4 text-2xl font-bold">{dict.notFound.title}</h1>
          <p className="mt-2 text-muted-foreground">{dict.notFound.text}</p>
          <Link
            href={`/${defaultLocale}`}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="size-4" aria-hidden="true" />
            {dict.notFound.back}
          </Link>
        </div>
      </main>
    </ThemeProvider>
  );
}
