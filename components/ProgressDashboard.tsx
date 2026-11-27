"use client";

import * as React from "react";
import Link from "next/link";
import { Download, RotateCcw, Upload } from "lucide-react";
import { CertificateCard } from "@/components/Certificate";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { localePath, type Dictionary } from "@/lib/i18n";
import { countCompleted, exportProgress, importProgress, percent, resetProgress, useProgress } from "@/lib/progress";
import type { Locale } from "@/lib/types";

export interface DashboardModule {
  id: number;
  slug: string;
  title: string;
  lessonKeys: string[];
}

interface ProgressDashboardProps {
  locale: Locale;
  modules: DashboardModule[];
  dict: { progress: Dictionary["progress"]; certificate: Dictionary["certificate"]; course: Dictionary["course"] };
  slogan: string;
}

export function ProgressDashboard({ locale, modules, dict, slogan }: ProgressDashboardProps) {
  const progress = useProgress();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState(false);

  const allKeys = modules.flatMap((m) => m.lessonKeys);
  const totalDone = countCompleted(progress, allKeys);

  const onExport = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devsecops-app-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (file: File) => {
    setImportError(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (!importProgress(String(reader.result))) setImportError(true);
    };
    reader.onerror = () => setImportError(true);
    reader.readAsText(file);
  };

  return (
    <main id="main" className="mx-auto w-full max-w-[1000px] px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">{dict.progress.title}</h1>
        <p className="mt-2 text-muted-foreground">{dict.progress.subtitle}</p>
      </header>

      {/* overall */}
      <section className="mt-6 rounded-lg border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">{dict.progress.overall}</h2>
          <span className="text-2xl font-bold text-primary">{percent(totalDone, allKeys.length)} %</span>
        </div>
        <Progress value={percent(totalDone, allKeys.length)} className="mt-3 h-3" />
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {totalDone}/{allKeys.length}
          </span>{" "}
          {dict.progress.lessonsDone}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download aria-hidden="true" />
            {dict.progress.export}
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload aria-hidden="true" />
            {dict.progress.import}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImport(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (window.confirm(dict.progress.resetConfirm)) resetProgress();
            }}
          >
            <RotateCcw aria-hidden="true" />
            {dict.progress.reset}
          </Button>
        </div>
        {importError && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {dict.progress.importError}
          </p>
        )}
        {totalDone === 0 && <p className="mt-3 text-sm text-muted-foreground">{dict.progress.empty}</p>}
      </section>

      {/* per-module progress */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">{dict.course.module}s</h2>
        <div className="mt-4 space-y-3">
          {modules.map((module) => (
            <div key={module.slug} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <Link href={localePath(locale, `/modules/${module.slug}`)} className="font-medium hover:text-primary hover:underline">
                  {module.id}. {module.title}
                </Link>
              </div>
              <div className="mt-2">
                <ProgressBar lessonKeys={module.lessonKeys} label={dict.course.completed} compact />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* certificates */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">{dict.progress.certificates}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {modules.map((module) => (
            <CertificateCard
              key={module.slug}
              locale={locale}
              moduleSlug={module.slug}
              moduleNumber={`Module ${module.id}`}
              moduleTitle={module.title}
              lessonKeys={module.lessonKeys}
              t={dict.certificate}
              slogan={slogan}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
