import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Code2, GraduationCap, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { CourseCard, LevelBadge, ModuleCard } from "@/components/Cards";
import { ContinueLearning } from "@/components/ContinueLearning";
import { ModuleIcon } from "@/components/ModuleIcon";
import { Button } from "@/components/ui/button";
import { allCourses, modules, totalLessons } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { availableFor, contentStats, courseHasAnyContent, isValidLocale, localeParams } from "@/lib/lessons";
import { languages } from "@/lib/languages";
import { site } from "@/lib/site";
import type { Level, Locale } from "@/lib/types";

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isValidLocale(locale) ? locale : "fr");
  return {
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    alternates: {
      canonical: localePath(locale as Locale),
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
    openGraph: { title: dict.meta.homeTitle, description: dict.meta.homeDescription, type: "website" },
  };
}

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

const FEATURE_ICONS = [Code2, ShieldCheck, BookOpenCheck, GraduationCap];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isValidLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const home = dict.home;

  const runnableLangs = Object.values(languages).filter((l) => l.runner).length;
  const projects = modules.find((m) => m.slug === "projects")?.courses.length ?? 0;

  const stats = [
    { value: `${totalLessons}`, label: home.statLessons },
    { value: `${contentStats.examples}+`, label: home.statExamples },
    { value: `${Object.keys(languages).length}`, label: home.statLanguages },
    { value: `${projects}`, label: home.statProjects },
  ];

  // labels so the client "continue" card can show readable titles
  const labels: Record<string, { course: string; lesson: string }> = {};
  for (const course of allCourses) {
    for (const lesson of course.lessons) {
      labels[`${course.slug}/${lesson.slug}`] = { course: course.title[locale], lesson: lesson.title[locale] };
    }
  }

  const coursesByLevel = (level: Level) => allCourses.filter((c) => c.level === level);

  return (
    <main id="main">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-[1100px] px-4 py-14 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            {home.badge}
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {home.title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">{home.subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={localePath(locale, `/courses/${modules[0].courses[0].slug}/${modules[0].courses[0].lessons[0].slug}`)}>
                {home.start}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={localePath(locale, "/courses")}>{home.browse}</Link>
            </Button>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-card p-4 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-3xl font-extrabold text-primary">{stat.value}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ContinueLearning locale={locale} title={home.continueTitle} cta={home.continueCta} labels={labels} />

      {/* Roadmap */}
      <section className="border-b">
        <div className="mx-auto max-w-[1100px] px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">{home.roadmapTitle}</h2>
          <p className="mt-2 text-muted-foreground">{home.roadmapSubtitle}</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <li key={module.slug}>
                <Link
                  href={localePath(locale, `/modules/${module.slug}`)}
                  className="group flex h-full flex-col rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ModuleIcon name={module.icon} className="size-5" />
                    </span>
                    <span className="text-3xl font-extrabold text-muted-foreground/30">{module.id}</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {home.step} {module.id}
                  </p>
                  <h3 className="font-semibold leading-snug group-hover:text-primary">{module.title[locale]}</h3>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* By level */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-[1100px] px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">{home.byLevelTitle}</h2>
          <p className="mt-2 text-muted-foreground">{home.byLevelSubtitle}</p>
          <div className="mt-8 space-y-8">
            {LEVELS.map((level) => {
              const courses = coursesByLevel(level).slice(0, 4);
              return (
                <div key={level}>
                  <div className="flex flex-wrap items-center gap-3">
                    <LevelBadge level={level} locale={locale} />
                    <p className="text-sm text-muted-foreground">{home.levelIntro[level]}</p>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {courses.map((course) => (
                      <CourseCard key={course.slug} locale={locale} course={course} available={courseHasAnyContent(course.slug)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b">
        <div className="mx-auto max-w-[1100px] px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">{home.featuresTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.features.map((feature, i) => {
              const Icon = FEATURE_ICONS[i] ?? Rocket;
              return (
                <div key={feature.title} className="rounded-lg border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All modules */}
      <section>
        <div className="mx-auto max-w-[1100px] px-4 py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">{home.modulesTitle}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {modules.map((module) => (
              <ModuleCard key={module.slug} locale={locale} module={module} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
