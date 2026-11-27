import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, Lightbulb, PencilLine, ShieldCheck } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { CompleteButton } from "@/components/LessonStatus";
import { Markdown } from "@/components/Markdown";
import { Quiz, type QuizItem } from "@/components/Quiz";
import { Sidebar } from "@/components/Sidebar";
import { ExerciseSolution } from "@/components/ExerciseSolution";
import { TableOfContents, type TocItem } from "@/components/TableOfContents";
import { WidgetRenderer } from "@/components/WidgetRenderer";
import { getAdjacentLessons, getCourse, getModuleOfCourse } from "@/data/curriculum";
import { getDictionary, localePath } from "@/lib/i18n";
import { buildSidebar, getLesson, isValidLocale, lessonParams } from "@/lib/lessons";
import { site } from "@/lib/site";
import { slugify } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function generateStaticParams() {
  return lessonParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; course: string; lesson: string }>;
}): Promise<Metadata> {
  const { locale, course: courseSlug, lesson: lessonSlug } = await params;
  const l = isValidLocale(locale) ? locale : "fr";
  const course = getCourse(courseSlug);
  const lesson = await getLesson(courseSlug, lessonSlug);
  if (!course || !lesson) return { title: getDictionary(l).notFound.title };
  return {
    title: `${lesson.title[l]} - ${course.title[l]}`,
    description: lesson.description[l],
    alternates: { canonical: localePath(l, `/courses/${courseSlug}/${lessonSlug}`) },
    openGraph: { title: lesson.title[l], description: lesson.description[l], type: "article" },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; course: string; lesson: string }>;
}) {
  const { locale: raw, course: courseSlug, lesson: lessonSlug } = await params;
  if (!isValidLocale(raw)) notFound();
  const locale: Locale = raw;
  const course = getCourse(courseSlug);
  const module = getModuleOfCourse(courseSlug);
  const lesson = await getLesson(courseSlug, lessonSlug);
  if (!course || !module || !lesson) notFound();

  const dict = getDictionary(locale);
  const sidebar = buildSidebar(module.slug, locale)!;
  const { previous, next } = getAdjacentLessons(courseSlug, lessonSlug);

  // anchor ids for the right-hand table of contents
  const sectionIds = lesson.sections.map((s, i) => `s-${i}-${slugify(s.heading[locale]).slice(0, 40)}`);
  const toc: TocItem[] = [
    { id: "intro", label: dict.lesson.intro, depth: 1 },
    ...lesson.sections.map((s, i) => ({ id: sectionIds[i], label: s.heading[locale], depth: 1 as const })),
    { id: "examples", label: dict.lesson.examples, depth: 1 },
    { id: "mistake", label: dict.lesson.mistake, depth: 2 },
    { id: "best-practice", label: dict.lesson.bestPractice, depth: 2 },
    { id: "exercise", label: dict.lesson.exercise, depth: 1 },
    { id: "quiz", label: dict.lesson.quiz, depth: 1 },
  ];

  const quizItems: QuizItem[] = lesson.quiz.map((q) => ({
    q: q.q[locale],
    options: q.options[locale],
    answer: q.answer,
    why: q.why[locale],
  }));

  const lessonPath = (slug: string, lessonSlug: string) => localePath(locale, `/courses/${slug}/${lessonSlug}`);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1">
      <Sidebar locale={locale} module={sidebar.module} courses={sidebar.courses} t={{ nav: dict.nav, course: dict.course }} />

      <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 xl:border-r">
        <article className="mx-auto max-w-3xl">
          {/* breadcrumb */}
          <nav aria-label={dict.nav.breadcrumb} className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={localePath(locale, `/modules/${module.slug}`)} className="hover:text-foreground">
              {module.title[locale]}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={localePath(locale, `/courses/${courseSlug}`)} className="hover:text-foreground">
              {course.title[locale]}
            </Link>
          </nav>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{lesson.title[locale]}</h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" aria-hidden="true" />
            {lesson.duration} {dict.lesson.readingTime}
          </p>

          {/* intro */}
          <section id="intro" className="mt-6 scroll-mt-20">
            <Markdown locale={locale}>{lesson.intro[locale]}</Markdown>
          </section>

          {/* interactive widgets */}
          {lesson.widgets?.map((name) => (
            <WidgetRenderer key={name} name={name} widgets={dict.widgets} locale={locale} />
          ))}

          {/* theory sections */}
          {lesson.sections.map((section, i) => (
            <section key={sectionIds[i]} id={sectionIds[i]} className="mt-8 scroll-mt-20">
              <h2 className="text-2xl font-bold">{section.heading[locale]}</h2>
              <div className="mt-3">
                <Markdown locale={locale}>{section.body[locale]}</Markdown>
              </div>
            </section>
          ))}

          {/* examples */}
          <section id="examples" className="mt-10 scroll-mt-20">
            <h2 className="text-2xl font-bold">{dict.lesson.examples}</h2>
            {lesson.examples.map((example, i) => (
              <div key={i} className="mt-5">
                <h3 className="text-lg font-semibold">
                  {dict.lesson.example} {i + 1} — {example.title[locale]}
                </h3>
                <CodeBlock
                  code={example.code}
                  lang={example.lang}
                  locale={locale}
                  file={example.file}
                  kind={example.kind}
                  output={example.output}
                />
                <div className="rounded-md border-l-4 border-muted-foreground/30 bg-muted/40 px-4 py-2 text-sm">
                  <Markdown locale={locale}>{example.note[locale]}</Markdown>
                </div>
              </div>
            ))}
          </section>

          {/* common mistake */}
          <section id="mistake" className="mt-10 scroll-mt-20 rounded-lg border-l-4 border-destructive bg-destructive/5 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
              {dict.lesson.mistake}
            </h2>
            <div className="mt-2">
              <Markdown locale={locale}>{lesson.mistake[locale]}</Markdown>
            </div>
          </section>

          {/* best practice */}
          <section id="best-practice" className="mt-6 scroll-mt-20 rounded-lg border-l-4 border-primary bg-primary/5 p-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
              {dict.lesson.bestPractice}
            </h2>
            <div className="mt-2">
              <Markdown locale={locale}>{lesson.bestPractice[locale]}</Markdown>
            </div>
          </section>

          {/* exercise */}
          <section id="exercise" className="mt-10 scroll-mt-20">
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <PencilLine className="size-6 text-primary" aria-hidden="true" />
              {dict.lesson.exercise}
            </h2>
            <div className="mt-3 rounded-lg border bg-card p-5">
              <Markdown locale={locale}>{lesson.exercise.statement[locale]}</Markdown>
              <ExerciseSolution show={dict.lesson.showSolution} hide={dict.lesson.hideSolution}>
                <p className="mb-2 flex items-center gap-1.5 font-semibold text-primary">
                  <Lightbulb className="size-4" aria-hidden="true" />
                  {dict.lesson.solution}
                </p>
                <CodeBlock
                  code={lesson.exercise.solution.code}
                  lang={lesson.exercise.solution.lang}
                  locale={locale}
                  file={lesson.exercise.solution.file}
                  kind="secure"
                />
                {lesson.exercise.solution.note && (
                  <div className="text-sm text-muted-foreground">
                    <Markdown locale={locale}>{lesson.exercise.solution.note[locale]}</Markdown>
                  </div>
                )}
              </ExerciseSolution>
            </div>
          </section>

          {/* quiz */}
          <section id="quiz" className="mt-10 scroll-mt-20">
            <h2 className="text-2xl font-bold">{dict.lesson.quiz}</h2>
            <div className="mt-3">
              <Quiz questions={quizItems} mode="lesson" storageKey={`${courseSlug}/${lessonSlug}`} t={dict.quiz} />
            </div>
          </section>

          {/* mark complete */}
          <div className="mt-10">
            <CompleteButton course={courseSlug} lesson={lessonSlug} t={dict.lesson} />
          </div>

          {/* prev / next */}
          <nav className="mt-8 grid gap-3 border-t pt-6 sm:grid-cols-2" aria-label={dict.nav.breadcrumb}>
            {previous ? (
              <Link
                href={lessonPath(previous.course.slug, previous.lesson.slug)}
                className="group flex items-center gap-3 rounded-lg border p-4 hover:border-primary hover:bg-accent"
              >
                <ArrowLeft className="size-5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{dict.lesson.previous}</span>
                  <span className="block truncate font-medium">{previous.lesson.title[locale]}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={lessonPath(next.course.slug, next.lesson.slug)}
                className="group flex items-center gap-3 rounded-lg border p-4 text-right hover:border-primary hover:bg-accent sm:justify-end"
              >
                <span className="min-w-0 sm:order-1">
                  <span className="block text-xs text-muted-foreground">{dict.lesson.next}</span>
                  <span className="block truncate font-medium">{next.lesson.title[locale]}</span>
                </span>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground group-hover:text-primary sm:order-2" aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </main>

      {/* right-hand table of contents */}
      <aside className="sticky top-[var(--header-height)] hidden h-[calc(100dvh-var(--header-height))] w-56 shrink-0 overflow-y-auto p-5 xl:block">
        <TableOfContents items={toc} title={dict.nav.onThisPage} />
      </aside>
    </div>
  );
}
