import Link from "next/link";
import { ChartNoAxesColumn, ShieldCheck } from "lucide-react";
import { CoursesMenu, LocaleSwitcher, MobileNav, ThemeToggle, type NavModule } from "@/components/HeaderControls";
import { Search } from "@/components/Search";
import { Button } from "@/components/ui/button";
import { modules } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { Locale } from "@/lib/types";

export function Logo({ locale }: { locale: Locale }) {
  return (
    <Link href={localePath(locale)} className="flex shrink-0 items-center gap-2 rounded-md font-bold" aria-label={`${site.name} - ${getDictionary(locale).nav.home}`}>
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg tracking-tight max-[380px]:sr-only">
        DevSecOps<span className="text-primary"> App</span>
      </span>
    </Link>
  );
}

/** Fixed header: logo, courses menu, search, language, dark mode. */
export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const navModules: NavModule[] = modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    icon: m.icon,
    title: m.title[locale],
    courses: m.courses.map((c) => ({ slug: c.slug, number: c.number, title: c.title[locale] })),
  }));

  // first course of every module: a sensible list to show in an empty search box
  const suggestions = modules.map((m) => ({
    title: m.courses[0].title[locale],
    url: `/courses/${m.courses[0].slug}`,
    hint: m.title[locale],
  }));

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[var(--header-height)] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-1 px-2 sm:gap-2 sm:px-4">
        <MobileNav locale={locale} modules={navModules} t={dict.nav} />
        <Logo locale={locale} />

        <nav className="ml-2 hidden items-center lg:flex" aria-label={dict.nav.menu}>
          <CoursesMenu locale={locale} modules={navModules} t={dict.nav} />
          <Button variant="ghost" asChild className="px-3">
            <Link href={localePath(locale, "/playground")}>{dict.nav.playground}</Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Search locale={locale} t={dict.search} nav={dict.nav} suggestions={suggestions} />
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href={localePath(locale, "/progress")} aria-label={dict.nav.progress} title={dict.nav.progress}>
              <ChartNoAxesColumn aria-hidden="true" />
            </Link>
          </Button>
          <LocaleSwitcher locale={locale} label={dict.nav.language} />
          <ThemeToggle t={dict.nav} />
        </div>
      </div>
    </header>
  );
}
