"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n";
import { setLastLesson, setLessonCompleted, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface CompleteButtonProps {
  course: string;
  lesson: string;
  t: Dictionary["lesson"];
}

/** "Lesson completed" check box. Also remembers the lesson as the last one opened. */
export function CompleteButton({ course, lesson, t }: CompleteButtonProps) {
  const progress = useProgress();
  const key = `${course}/${lesson}`;
  const completed = !!progress.lessons[key];

  React.useEffect(() => setLastLesson(course, lesson), [course, lesson]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border p-4",
        completed ? "border-primary/50 bg-primary/5" : "bg-card",
      )}
    >
      <Button
        variant={completed ? "outline" : "default"}
        size="lg"
        role="switch"
        aria-checked={completed}
        onClick={() => setLessonCompleted(key, !completed)}
        className="max-w-full whitespace-normal text-left"
      >
        {completed ? <CheckCircle2 className="text-primary" aria-hidden="true" /> : <Circle aria-hidden="true" />}
        {completed ? t.completed : t.markComplete}
      </Button>
      {completed && (
        <button
          type="button"
          onClick={() => setLessonCompleted(key, false)}
          className="rounded text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {t.markIncomplete}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface CourseCtaProps {
  course: string;
  lessons: string[];
  /** Locale-prefixed base path of the course, e.g. /fr/courses/python */
  basePath: string;
  t: Dictionary["course"];
}

/** Start / continue / review button of a course page: jumps to the first lesson not completed yet. */
export function CourseCta({ course, lessons, basePath, t }: CourseCtaProps) {
  const progress = useProgress();
  if (lessons.length === 0) return null;
  const done = lessons.filter((lesson) => progress.lessons[`${course}/${lesson}`]).length;
  const next = lessons.find((lesson) => !progress.lessons[`${course}/${lesson}`]) ?? lessons[0];
  const label = done === 0 ? t.startCourse : done === lessons.length ? t.restartCourse : t.continueCourse;

  return (
    <Button size="lg" asChild>
      <Link href={`${basePath}/${next}`}>
        {label}
        <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  );
}

/** Small completion mark shown next to a lesson in lists. */
export function LessonCheck({ lessonKey, label }: { lessonKey: string; label: string }) {
  const progress = useProgress();
  const completed = !!progress.lessons[lessonKey];
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border",
        completed ? "border-primary bg-primary text-primary-foreground" : "border-input text-transparent",
      )}
    >
      <CheckCircle2 className="size-4" aria-hidden="true" />
      {completed && <span className="sr-only">{label}</span>}
    </span>
  );
}
