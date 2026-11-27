import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { LevelBadge } from "@/components/Cards";
import { CourseCta, LessonCheck } from "@/components/LessonStatus";
import { ProgressBar } from "@/components/ProgressBar";
import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { getCourse, getModuleOfCourse } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { availableFor, buildSidebar, courseParams, hasContent, isValidLocale } from "@/lib/lessons";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return courseParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; course: string }> }): Promise<Metadata> {
  const { locale, course: slug } = await params;
  const course = getCourse(slug);
  const dict = getDictionary(isValidLocale(locale) ? locale : "fr");
  if (!course) return { title: dict.notFound.title };
  const l = isValidLocale(locale) ? locale : "fr";
  return {
    title: course.title[l],
    description: course.description[l],
    alternates: { canonical: localePath(l, `/courses/${slug}`) },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ locale: string; course: string }> }) {
  const { locale: raw, course: slug } = await params;
  if (!isValidLocale(raw)) notFound();
  const locale: Locale = raw;
  const course = getCourse(slug);
  const module = getModuleOfCourse(slug);
  if (!course || !module) notFound();
  const dict = getDictionary(locale);

  const sidebar = buildSidebar(module.slug, locale)!;
  const available = availableFor(slug);
  const basePath = localePath(locale, `/courses/${slug}`);
  const keys = course.lessons.map((l) => `${slug}/${l.slug}`);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1">
      <Sidebar locale={locale} module={sidebar.module} courses={sidebar.courses} t={{ nav: dict.nav, course: dict.course }} />

      <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <nav aria-label={dict.nav.breadcrumb} className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={localePath(locale, "/courses")} className="hover:text-foreground">
              {dict.nav.courses}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={localePath(locale, `/modules/${module.slug}`)} className="hover:text-foreground">
              {module.title[locale]}
            </Link>
          </nav>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-primary">{course.number}</span>
            <LevelBadge level={course.level} locale={locale} />
          </div>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{course.title[locale]}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{course.description[locale]}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <span key={tag} className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <CourseCta course={slug} lessons={available} basePath={basePath} t={dict.course} />
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpen className="size-4" aria-hidden="true" />
              {course.lessons.length} {dict.course.lessons}
            </span>
          </div>

          {available.length > 0 && (
            <div className="mt-6 max-w-md">
              <ProgressBar lessonKeys={keys} label={dict.course.completed} />
            </div>
          )}

          <h2 className="mt-10 text-xl font-bold">{dict.course.lessonsOfCourse}</h2>
          <ol className="mt-4 divide-y rounded-lg border">
            {course.lessons.map((lesson, i) => {
              const has = hasContent(slug, lesson.slug);
              const key = `${slug}/${lesson.slug}`;
              const content = (
                <>
                  <span className="w-6 text-center font-mono text-sm text-muted-foreground">{i + 1}</span>
                  {has ? (
                    <LessonCheck lessonKey={key} label={dict.course.completed} />
                  ) : (
                    <span className="flex size-6 items-center justify-center text-muted-foreground/50">
                      <Lock className="size-3.5" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">{lesson.title[locale]}</span>
                  {has ? (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Badge variant="outline" className="shrink-0">
                      {dict.course.comingSoon}
                    </Badge>
                  )}
                </>
              );
              return (
                <li key={lesson.slug}>
                  {has ? (
                    <Link href={`${basePath}/${lesson.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent">
                      {content}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 opacity-60">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-6 rounded-lg border bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              <Link href={localePath(locale, `/modules/${module.slug}`)} className="font-medium text-primary hover:underline">
                {dict.quiz.moduleQuizTitle} →
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
