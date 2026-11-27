import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { ModuleIcon } from "@/components/ModuleIcon";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { getDictionary, localePath } from "@/lib/i18n";
import type { Course, Level, Module } from "@/lib/types";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const levelVariant: Record<Level, "beginner" | "intermediate" | "advanced"> = {
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

export function LevelBadge({ level, locale }: { level: Level; locale: Locale }) {
  const dict = getDictionary(locale);
  return <Badge variant={levelVariant[level]}>{dict.levels[level]}</Badge>;
}

interface CourseCardProps {
  locale: Locale;
  course: Course;
  available: boolean;
  className?: string;
}

export function CourseCard({ locale, course, available, className }: CourseCardProps) {
  const dict = getDictionary(locale);
  const href = localePath(locale, `/courses/${course.slug}`);
  const lessonKeys = course.lessons.map((l) => `${course.slug}/${l.slug}`);

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card p-4 transition-shadow hover:shadow-md",
        !available && "opacity-70",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-primary">{course.number}</span>
        <LevelBadge level={course.level} locale={locale} />
        {!available && (
          <Badge variant="outline" className="ml-auto">
            {dict.course.comingSoon}
          </Badge>
        )}
      </div>

      <h3 className="mt-2 text-lg font-semibold leading-snug">
        <Link href={href} className="after:absolute after:inset-0">
          {course.title[locale]}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{course.description[locale]}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {course.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="size-3.5" aria-hidden="true" />
        {course.lessons.length} {dict.course.lessons}
      </div>

      {available && <ProgressBar lessonKeys={lessonKeys} label={dict.course.completed} compact className="relative z-10 mt-3" />}
    </div>
  );
}

interface ModuleCardProps {
  locale: Locale;
  module: Module;
}

export function ModuleCard({ locale, module }: ModuleCardProps) {
  const dict = getDictionary(locale);
  const lessons = module.courses.reduce((n, c) => n + c.lessons.length, 0);

  return (
    <div className="flex flex-col rounded-lg border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ModuleIcon name={module.icon} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.course.module} {module.id}
          </p>
          <h3 className="text-lg font-semibold leading-snug">
            <Link href={localePath(locale, `/modules/${module.slug}`)} className="hover:text-primary hover:underline">
              {module.title[locale]}
            </Link>
          </h3>
        </div>
        <LevelBadge level={module.level} locale={locale} />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{module.description[locale]}</p>

      <ul className="mt-3 flex-1 space-y-1">
        {module.courses.map((course) => (
          <li key={course.slug}>
            <Link
              href={localePath(locale, `/courses/${course.slug}`)}
              className="flex items-baseline gap-2 rounded px-1 py-0.5 text-sm hover:bg-accent"
            >
              <span className="font-mono text-xs text-muted-foreground">{course.number}</span>
              <span className="min-w-0 flex-1 truncate">{course.title[locale]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={localePath(locale, `/modules/${module.slug}`)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        {module.courses.length} {dict.course.lessons === "lessons" ? "courses" : "cours"} · {lessons} {dict.course.lessons}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function Duration({ minutes, label }: { minutes: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Clock className="size-4" aria-hidden="true" />
      {minutes} {label}
    </span>
  );
}
