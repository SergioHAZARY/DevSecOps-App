import "server-only";
import { allCourses, modules } from "@/data/curriculum";
import { availableLessons, contentStats, getLesson, getLessons } from "@/data/lessons";
import { locales, type Locale } from "@/lib/types";

export { getLesson, getLessons, contentStats };

/** Lesson slugs that actually have content, for a course. */
export function availableFor(courseSlug: string): string[] {
  return availableLessons[courseSlug] ?? [];
}

export function hasContent(courseSlug: string, lessonSlug: string): boolean {
  return availableFor(courseSlug).includes(lessonSlug);
}

export function courseHasAnyContent(courseSlug: string): boolean {
  return availableFor(courseSlug).length > 0;
}

/** Number of lessons with content across the whole site. */
export function writtenLessonsCount(): number {
  return Object.values(availableLessons).reduce((n, list) => n + list.length, 0);
}

/* ------------------------------------------------------------------ */
/* generateStaticParams helpers (static export)                        */
/* ------------------------------------------------------------------ */

export function localeParams() {
  return locales.map((locale) => ({ locale }));
}

export function moduleParams() {
  return locales.flatMap((locale) => modules.map((m) => ({ locale, module: m.slug })));
}

export function courseParams() {
  return locales.flatMap((locale) => allCourses.map((c) => ({ locale, course: c.slug })));
}

/** One page per (locale, course, lesson) that has content. */
export function lessonParams() {
  return locales.flatMap((locale) =>
    allCourses.flatMap((course) =>
      availableFor(course.slug).map((lesson) => ({ locale, course: course.slug, lesson })),
    ),
  );
}

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ */
/* Sidebar data for a module (plain, serialisable for a client component) */
/* ------------------------------------------------------------------ */

export function buildSidebar(moduleSlug: string, locale: Locale) {
  const module = modules.find((m) => m.slug === moduleSlug);
  if (!module) return null;
  return {
    module: { id: module.id, slug: module.slug, icon: module.icon, title: module.title[locale] },
    courses: module.courses.map((course) => ({
      slug: course.slug,
      number: course.number,
      title: course.title[locale],
      lessons: course.lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title[locale],
        available: hasContent(course.slug, lesson.slug),
      })),
    })),
  };
}
