import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { modules } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/types";

export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            {site.name}
          </p>
          <p className="mt-1 font-medium text-primary">{site.slogan[locale]}</p>
          <p className="mt-2 text-sm text-muted-foreground">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.footer.learn} className="lg:col-span-2">
          <p className="font-semibold">{dict.footer.learn}</p>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {modules.map((module) => (
              <li key={module.slug}>
                <Link href={localePath(locale, `/modules/${module.slug}`)} className="text-muted-foreground hover:text-foreground hover:underline">
                  {module.id}. {module.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.practice}>
          <p className="font-semibold">{dict.footer.practice}</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {[
              { href: "/courses", label: dict.nav.allCourses },
              { href: "/playground", label: dict.nav.playground },
              { href: "/progress", label: dict.nav.progress },
            ].map((link) => (
              <li key={link.href}>
                <Link href={localePath(locale, link.href)} className="text-muted-foreground hover:text-foreground hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-[1440px] space-y-1 px-4 py-4 text-xs text-muted-foreground">
          <p>{dict.footer.disclaimer}</p>
          <p>
            © {new Date().getFullYear()} {site.name}. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
