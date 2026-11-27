import type { Metadata } from "next";
import { CourseCard } from "@/components/Cards";
import { ModuleIcon } from "@/components/ModuleIcon";
import { ProgressBar } from "@/components/ProgressBar";
import { allCourses, modules, totalLessons } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { courseHasAnyContent, isValidLocale, localeParams } from "@/lib/lessons";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(isValidLocale(locale) ? locale : "fr");
  return {
    title: dict.meta.coursesTitle,
    description: dict.meta.coursesDescription,
    alternates: { canonical: localePath(locale as Locale, "/courses") },
  };
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isValidLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);

  const allKeys = allCourses.flatMap((c) => c.lessons.map((l) => `${c.slug}/${l.slug}`));

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-8">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-bold">{dict.nav.allCourses}</h1>
        <p className="mt-2 text-muted-foreground">{dict.meta.coursesDescription}</p>
        <div className="mt-4 max-w-md">
          <ProgressBar lessonKeys={allKeys} label={dict.progress.lessonsDone} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {modules.length} {dict.course.module.toLowerCase()}s · {totalLessons} {dict.course.lessons}
        </p>
      </header>

      <div className="mt-8 space-y-12">
        {modules.map((module) => (
          <section key={module.slug} aria-labelledby={`module-${module.slug}`}>
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ModuleIcon name={module.icon} className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {dict.course.module} {module.id}
                </p>
                <h2 id={`module-${module.slug}`} className="text-xl font-bold">
                  {module.title[locale]}
                </h2>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {module.courses.map((course) => (
                <CourseCard key={course.slug} locale={locale} course={course} available={courseHasAnyContent(course.slug)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
