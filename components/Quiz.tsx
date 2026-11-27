"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Dictionary } from "@/lib/i18n";
import {
  LESSON_PASS_RATIO,
  MODULE_PASS_RATIO,
  saveLessonQuiz,
  saveModuleQuiz,
  setLessonCompleted,
  useProgress,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

/** A question already resolved to the reader's language. */
export interface QuizItem {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

interface QuizProps {
  /** Lesson quiz: every question is asked. Module quiz: `pick` questions are drawn at random from the pool. */
  questions: QuizItem[];
  pick?: number;
  mode: "lesson" | "module";
  /** "<course>/<lesson>" for a lesson quiz, module slug for a module quiz */
  storageKey: string;
  t: Dictionary["quiz"];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Very small inline renderer: `code` and **bold** inside questions and explanations. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        ) : part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

export function Quiz({ questions, pick, mode, storageKey, t }: QuizProps) {
  const progress = useProgress();
  const passRatio = mode === "module" ? MODULE_PASS_RATIO : LESSON_PASS_RATIO;
  const previous = mode === "module" ? progress.moduleQuizzes[storageKey] : progress.quizzes[storageKey];

  // a module quiz only starts on demand (and draws its questions at that moment, on the client)
  const [items, setItems] = React.useState<QuizItem[] | null>(mode === "lesson" ? questions : null);
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);
  const [finished, setFinished] = React.useState(false);
  const headingRef = React.useRef<HTMLParagraphElement>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  const start = () => {
    setItems(pick ? shuffle(questions).slice(0, pick) : questions);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (!items) {
    return (
      <div className="rounded-lg border bg-card p-5">
        <p className="text-muted-foreground">
          {pick ?? questions.length} {t.moduleQuizIntro}
        </p>
        {previous && (
          <p className="mt-2 text-sm font-medium">
            {t.bestScore} : {previous.score}/{previous.total}
          </p>
        )}
        <Button className="mt-4" onClick={start}>
          {t.startQuiz}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const total = items.length;
  const current = items[index];
  const answered = selected !== null;

  const choose = (option: number) => {
    if (answered) return;
    setSelected(option);
    if (option === current.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
      requestAnimationFrame(() => headingRef.current?.focus());
      return;
    }
    setFinished(true);
    if (mode === "module") {
      saveModuleQuiz(storageKey, score, total);
    } else {
      saveLessonQuiz(storageKey, score, total);
      if (score / total >= passRatio) setLessonCompleted(storageKey, true);
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  if (finished) {
    const passed = score / total >= passRatio;
    return (
      <div ref={resultRef} tabIndex={-1} className="rounded-lg border bg-card p-6 text-center outline-none">
        <Trophy className={cn("mx-auto size-10", passed ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">{t.score}</p>
        <p className="text-4xl font-bold tabular-nums">
          {score}/{total}
        </p>
        <p className={cn("mt-2 font-medium", passed ? "text-primary" : "text-foreground")}>{passed ? t.passed : t.failed}</p>
        {passed && mode === "lesson" && <p className="mt-1 text-sm text-muted-foreground">{t.lessonMarked}</p>}
        <p className="mt-1 text-sm text-muted-foreground">
          {t.passMark} : {Math.round(passRatio * 100)} %
        </p>
        <Button variant="outline" className="mt-4" onClick={start}>
          <RotateCcw aria-hidden="true" />
          {t.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p ref={headingRef} tabIndex={-1} className="font-medium outline-none">
          {t.question} {index + 1} {t.of} {total}
        </p>
        {previous && (
          <p className="tabular-nums">
            {t.bestScore} : {previous.score}/{previous.total}
          </p>
        )}
      </div>
      <Progress value={((index + (answered ? 1 : 0)) / total) * 100} className="mt-2 h-1.5" aria-hidden="true" />

      <fieldset className="mt-5">
        <legend className="text-lg font-semibold leading-snug">
          <Inline text={current.q} />
        </legend>
        <div className="mt-4 grid gap-2.5">
          {current.options.map((option, i) => {
            const isCorrect = i === current.answer;
            const isChosen = i === selected;
            return (
              <button
                key={`${index}-${i}`}
                type="button"
                onClick={() => choose(i)}
                aria-disabled={answered}
                aria-pressed={isChosen}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left transition-colors",
                  !answered && "hover:border-primary hover:bg-accent",
                  answered && isCorrect && "border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-100",
                  answered && isChosen && !isCorrect && "border-red-600 bg-red-50 text-red-950 dark:bg-red-950/60 dark:text-red-100",
                  answered && !isCorrect && !isChosen && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    answered && isCorrect && "border-emerald-600 bg-emerald-600 text-white",
                    answered && isChosen && !isCorrect && "border-red-600 bg-red-600 text-white",
                  )}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="min-w-0 flex-1 break-words">
                  <Inline text={option} />
                </span>
                {answered && isCorrect && <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />}
                {answered && isChosen && !isCorrect && <XCircle className="size-5 shrink-0 text-red-600" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">
        {answered && (
          <div
            className={cn(
              "mt-4 rounded-md border-l-4 bg-muted p-4",
              selected === current.answer ? "border-emerald-600" : "border-red-600",
            )}
          >
            <p className="font-semibold">{selected === current.answer ? t.correct : t.incorrect}</p>
            <p className="mt-1 text-muted-foreground">
              <Inline text={current.why} />
            </p>
          </div>
        )}
      </div>

      {answered && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>
            {index + 1 < total ? t.nextQuestion : t.seeResult}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
