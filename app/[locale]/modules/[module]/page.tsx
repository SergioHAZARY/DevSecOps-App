import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseCard, LevelBadge } from "@/components/Cards";
import { ModuleIcon } from "@/components/ModuleIcon";
import { ProgressBar } from "@/components/ProgressBar";
import { getModule, modules } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { courseHasAnyContent, isValidLocale, moduleParams } from "@/lib/lessons";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return moduleParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; module: string }> }): Promise<Metadata> {
  const { locale, module: slug } = await params;
  const module = getModule(slug);
  const dict = getDictionary(isValidLocale(locale) ? locale : "fr");
  if (!module) return { title: dict.notFound.title };
  const l = isValidLocale(locale) ? locale : "fr";
  return {
    title: `${module.title[l]} - ${dict.course.module} ${module.id}`,
    description: module.description[l],
    alternates: { canonical: localePath(l, `/modules/${slug}`) },
  };
}

export default async function ModulePage({ params }: { params: Promise<{ locale: string; module: string }> }) {
  const { locale: raw, module: slug } = await params;
  if (!isValidLocale(raw)) notFound();
  const locale: Locale = raw;
  const module = getModule(slug);
  if (!module) notFound();
  const dict = getDictionary(locale);

  const keys = module.courses.flatMap((c) => c.lessons.map((l) => `${c.slug}/${l.slug}`));
  const index = modules.findIndex((m) => m.slug === slug);
  const prev = modules[index - 1];
  const next = modules[index + 1];

  return (
    <main id="main" className="mx-auto w-full max-w-[1000px] px-4 py-8">
      <Link
        href={localePath(locale, "/courses")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {dict.nav.allCourses}
      </Link>

      <header className="mt-4 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ModuleIcon name={module.icon} className="size-7" />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {dict.course.module} {module.id}
            </p>
            <LevelBadge level={module.level} locale={locale} />
          </div>
          <h1 className="mt-1 text-3xl font-bold">{module.title[locale]}</h1>
          <p className="mt-2 text-muted-foreground">{module.description[locale]}</p>
          <div className="mt-4 max-w-md">
            <ProgressBar lessonKeys={keys} label={dict.progress.lessonsDone} compact />
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {module.courses.map((course) => (
          <CourseCard key={course.slug} locale={locale} course={course} available={courseHasAnyContent(course.slug)} />
        ))}
      </div>

      <nav className="mt-10 flex items-center justify-between gap-4 border-t pt-6" aria-label={dict.nav.breadcrumb}>
        {prev ? (
          <Link href={localePath(locale, `/modules/${prev.slug}`)} className="group flex flex-col text-left">
            <span className="text-xs text-muted-foreground">{dict.lesson.previous}</span>
            <span className="font-medium group-hover:text-primary">
              {prev.id}. {prev.title[locale]}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={localePath(locale, `/modules/${next.slug}`)} className="group flex flex-col text-right">
            <span className="text-xs text-muted-foreground">{dict.lesson.next}</span>
            <span className="font-medium group-hover:text-primary">
              {next.id}. {next.title[locale]}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
