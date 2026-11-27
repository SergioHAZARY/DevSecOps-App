"use client";

import * as React from "react";
import { Award, Download, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { certificateId, downloadCertificate } from "@/lib/certificate";
import type { Dictionary } from "@/lib/i18n";
import { countCompleted, isQuizPassed, MODULE_PASS_RATIO, setLearnerName, useProgress } from "@/lib/progress";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CertificateCardProps {
  locale: Locale;
  moduleSlug: string;
  moduleNumber: string;
  moduleTitle: string;
  lessonKeys: string[];
  t: Dictionary["certificate"];
  slogan: string;
}

export function CertificateCard({
  locale,
  moduleSlug,
  moduleNumber,
  moduleTitle,
  lessonKeys,
  t,
  slogan,
}: CertificateCardProps) {
  const progress = useProgress();
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);

  // keep the name in sync with the stored one (first render is empty on the server)
  React.useEffect(() => setName(progress.name), [progress.name]);

  const done = countCompleted(progress, lessonKeys);
  const lessonsDone = done === lessonKeys.length && lessonKeys.length > 0;
  const quizPassed = isQuizPassed(progress.moduleQuizzes[moduleSlug], MODULE_PASS_RATIO);
  const unlocked = lessonsDone && quizPassed;

  const download = async () => {
    setError(false);
    setBusy(true);
    try {
      const trimmed = name.trim() || t.namePlaceholder;
      setLearnerName(name.trim());
      const today = new Date();
      const date = today.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
      const quiz = progress.moduleQuizzes[moduleSlug];
      const percent = quiz ? Math.round((quiz.score / quiz.total) * 100) : 100;
      const id = await certificateId(trimmed, moduleSlug, today.toISOString().slice(0, 10));

      await downloadCertificate(
        {
          name: trimmed,
          module: moduleTitle,
          moduleNumber: `${moduleNumber}`,
          slogan,
          heading: t.pdf.heading,
          awardedTo: t.pdf.awardedTo,
          forCompleting: t.pdf.forCompleting,
          details: `${lessonKeys.length} ${t.pdf.details} ${percent}%`,
          dateLabel: t.pdf.date,
          date,
          idLabel: t.pdf.id,
          id,
          footer: t.pdf.footer,
        },
        `certificat-${moduleSlug}.pdf`,
      );
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("rounded-lg border p-5", unlocked ? "border-primary/50 bg-primary/5" : "bg-card")}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {unlocked ? <Award className="size-6" aria-hidden="true" /> : <Lock className="size-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{moduleTitle}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li className={cn("flex items-center gap-2", lessonsDone ? "text-primary" : "text-muted-foreground")}>
              <span aria-hidden="true">{lessonsDone ? "✓" : "○"}</span>
              {t.lessonsRequirement}: {done}/{lessonKeys.length}
            </li>
            <li className={cn("flex items-center gap-2", quizPassed ? "text-primary" : "text-muted-foreground")}>
              <span aria-hidden="true">{quizPassed ? "✓" : "○"}</span>
              {t.quizRequirement}
            </li>
          </ul>
        </div>
      </div>

      {unlocked ? (
        <div className="mt-4">
          <label htmlFor={`cert-name-${moduleSlug}`} className="text-sm font-medium">
            {t.nameLabel}
          </label>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <Input
              id={`cert-name-${moduleSlug}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              maxLength={60}
              autoComplete="name"
            />
            <Button onClick={download} disabled={busy} className="shrink-0">
              {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
              {busy ? t.generating : t.download}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {t.error}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{t.locked}</p>
      )}
    </div>
  );
}
