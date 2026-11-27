"use client";

import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { localePath } from "@/lib/i18n";
import { useProgress } from "@/lib/progress";
import type { Locale } from "@/lib/types";

interface ContinueLearningProps {
  locale: Locale;
  title: string;
  cta: string;
  /** Resolved titles for every (course/lesson) so the card can label the link */
  labels: Record<string, { course: string; lesson: string }>;
}

/** "Pick up where you left off" card, shown only once the learner has opened a lesson. */
export function ContinueLearning({ locale, title, cta, labels }: ContinueLearningProps) {
  const progress = useProgress();
  const last = progress.last;
  if (!last) return null;
  const key = `${last.course}/${last.lesson}`;
  const label = labels[key];
  if (!label) return null;

  return (
    <section className="border-b bg-primary/5">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-4 px-4 py-4">
        <History className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="truncate font-medium">
            {label.course} — {label.lesson}
          </p>
        </div>
        <Link
          href={localePath(locale, `/courses/${last.course}/${last.lesson}`)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
