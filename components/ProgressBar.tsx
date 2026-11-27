"use client";

import { Progress } from "@/components/ui/progress";
import { countCompleted, percent, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Lesson keys ("<course>/<lesson>") counted by this bar */
  lessonKeys: string[];
  /** e.g. "leçons terminées" */
  label: string;
  className?: string;
  compact?: boolean;
}

/** Progress of a course, a module or the whole site, read from localStorage. */
export function ProgressBar({ lessonKeys, label, className, compact }: ProgressBarProps) {
  const progress = useProgress();
  const done = countCompleted(progress, lessonKeys);
  const value = percent(done, lessonKeys.length);

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("mb-1.5 flex items-baseline justify-between gap-3", compact ? "text-xs" : "text-sm")}>
        <span className="text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {done}/{lessonKeys.length}
          </span>{" "}
          {label}
        </span>
        <span className="font-semibold tabular-nums">{value} %</span>
      </div>
      <Progress value={value} aria-label={`${label}: ${value} %`} className={compact ? "h-1.5" : undefined} />
    </div>
  );
}
