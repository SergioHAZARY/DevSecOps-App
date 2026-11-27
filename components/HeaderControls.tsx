"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronDown, Languages, Menu, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogTitle, DialogTrigger, SheetContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModuleIcon } from "@/components/ModuleIcon";
import { localePath, switchLocalePath, type Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** Curriculum reduced to what the navigation needs, in the reader's language. */
export interface NavModule {
  id: number;
  slug: string;
  icon: string;
  title: string;
  courses: { slug: string; number: string; title: string }[];
}

/* ------------------------------------------------------------------ */

export function ThemeToggle({ t }: { t: Dictionary["nav"] }) {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t.toggleTheme}>
          {/* both icons are rendered and CSS picks one: no hydration mismatch */}
          <Sun className="dark:hidden" aria-hidden="true" />
          <Moon className="hidden dark:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun aria-hidden="true" /> {t.themeLight}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon aria-hidden="true" /> {t.themeDark}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>
          <Monitor aria-hidden="true" /> {t.themeSystem}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const target: Locale = locale === "fr" ? "en" : "fr";
  return (
    <Button variant="ghost" size="sm" asChild className="h-10 px-2.5 font-semibold">
      <Link href={switchLocalePath(pathname, target)} hrefLang={target} lang={target} aria-label={`${label}: ${target === "fr" ? "Français" : "English"}`}>
        <Languages aria-hidden="true" />
        {target.toUpperCase()}
      </Link>
    </Button>
  );
}

/* ------------------------------------------------------------------ */

/** Desktop "Courses" mega-menu. */
export function CoursesMenu({ locale, modules, t }: { locale: Locale; modules: NavModule[]; t: Dictionary["nav"] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hidden px-3 lg:inline-flex">
          {t.courses}
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="grid w-[min(72rem,calc(100vw-2rem))] grid-cols-4 gap-x-2 gap-y-3 p-3">
        {modules.map((module) => (
          <div key={module.slug} className="min-w-0">
            <DropdownMenuLabel className="flex items-center gap-1.5 normal-case tracking-normal">
              <ModuleIcon name={module.icon} className="size-4 shrink-0 text-primary" />
              <Link href={localePath(locale, `/modules/${module.slug}`)} className="truncate text-sm text-foreground hover:underline">
                {module.id}. {module.title}
              </Link>
            </DropdownMenuLabel>
            {module.courses.map((course) => (
              <DropdownMenuItem key={course.slug} asChild className="py-1.5">
                <Link href={localePath(locale, `/courses/${course.slug}`)}>
                  <span className="w-7 shrink-0 font-mono text-xs text-muted-foreground">{course.number}</span>
                  <span className="truncate">{course.title}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */

/** Mobile / tablet navigation drawer. */
export function MobileNav({ locale, modules, t }: { locale: Locale; modules: NavModule[]; t: Dictionary["nav"] }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // close the drawer after a navigation
  React.useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: localePath(locale), label: t.home },
    { href: localePath(locale, "/courses"), label: t.allCourses },
    { href: localePath(locale, "/playground"), label: t.playground },
    { href: localePath(locale, "/progress"), label: t.progress },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t.menu}>
          <Menu aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <SheetContent closeLabel={t.close} side="left">
        <div className="border-b px-4 py-3.5">
          <DialogTitle className="font-semibold">{t.menu}</DialogTitle>
          <DialogDescription className="sr-only">{t.courses}</DialogDescription>
        </div>
        <nav className="flex-1 overflow-y-auto p-2" aria-label={t.menu}>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="flex min-h-11 items-center rounded-md px-3 font-medium hover:bg-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.courses}</p>
          {modules.map((module) => (
            <details key={module.slug} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md px-3 font-medium hover:bg-accent [&::-webkit-details-marker]:hidden">
                <ModuleIcon name={module.icon} className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  {module.id}. {module.title}
                </span>
                <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <ul className="mb-1 ml-5 border-l pl-2">
                {module.courses.map((course) => (
                  <li key={course.slug}>
                    <Link
                      href={localePath(locale, `/courses/${course.slug}`)}
                      className="flex min-h-10 items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      {course.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </SheetContent>
    </Dialog>
  );
}
