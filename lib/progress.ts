"use client";

import { useSyncExternalStore } from "react";

/**
 * Learner progress, stored in localStorage only (no account, no server).
 * Keys of `lessons` and `quizzes` are "<course-slug>/<lesson-slug>".
 */
export interface QuizResult {
  score: number;
  total: number;
  date: string;
}

export interface ProgressState {
  version: 1;
  /** lesson key -> ISO date of completion */
  lessons: Record<string, string>;
  /** lesson key -> best quiz result */
  quizzes: Record<string, QuizResult>;
  /** module slug -> best final quiz result */
  moduleQuizzes: Record<string, QuizResult>;
  /** Name printed on certificates */
  name: string;
  /** Last lesson opened, to offer "continue" */
  last?: { course: string; lesson: string };
}

const STORAGE_KEY = "devsecops-app:progress:v1";
export const MODULE_PASS_RATIO = 0.7;
export const LESSON_PASS_RATIO = 0.8;

const EMPTY: ProgressState = { version: 1, lessons: {}, quizzes: {}, moduleQuizzes: {}, name: "" };

let cache: ProgressState | null = null;
const listeners = new Set<() => void>();

const KEY_PATTERN = /^[a-z0-9-]{1,80}(\/[a-z0-9-]{1,80})?$/;

function cleanQuizMap(value: unknown): Record<string, QuizResult> {
  const out: Record<string, QuizResult> = {};
  if (typeof value !== "object" || value === null) return out;
  for (const [key, raw] of Object.entries(value).slice(0, 2000)) {
    if (!KEY_PATTERN.test(key) || typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.score !== "number" || typeof r.total !== "number" || r.total <= 0 || r.score < 0 || r.score > r.total) continue;
    out[key] = { score: r.score, total: r.total, date: typeof r.date === "string" ? r.date.slice(0, 40) : "" };
  }
  return out;
}

/** Never trust what comes out of localStorage or an imported file: rebuild a clean state. */
export function sanitizeProgress(value: unknown): ProgressState | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return null;

  const lessons: Record<string, string> = {};
  if (typeof v.lessons === "object" && v.lessons !== null) {
    for (const [key, date] of Object.entries(v.lessons).slice(0, 2000)) {
      if (KEY_PATTERN.test(key) && typeof date === "string") lessons[key] = date.slice(0, 40);
    }
  }

  const state: ProgressState = {
    version: 1,
    lessons,
    quizzes: cleanQuizMap(v.quizzes),
    moduleQuizzes: cleanQuizMap(v.moduleQuizzes),
    name: typeof v.name === "string" ? v.name.slice(0, 80) : "",
  };

  const last = v.last as Record<string, unknown> | undefined;
  if (last && typeof last.course === "string" && typeof last.lesson === "string" && KEY_PATTERN.test(`${last.course}/${last.lesson}`)) {
    state.last = { course: last.course, lesson: last.lesson };
  }
  return state;
}

function read(): ProgressState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = (raw ? sanitizeProgress(JSON.parse(raw)) : null) ?? EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: ProgressState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full or blocked (private mode): progress stays in memory for this tab
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY;

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export function setLessonCompleted(key: string, completed: boolean) {
  const state = read();
  const lessons = { ...state.lessons };
  if (completed) lessons[key] = lessons[key] ?? new Date().toISOString();
  else delete lessons[key];
  write({ ...state, lessons });
}

function best(previous: QuizResult | undefined, score: number, total: number): QuizResult {
  if (previous && previous.score / previous.total >= score / total) return previous;
  return { score, total, date: new Date().toISOString() };
}

export function saveLessonQuiz(key: string, score: number, total: number) {
  const state = read();
  write({ ...state, quizzes: { ...state.quizzes, [key]: best(state.quizzes[key], score, total) } });
}

export function saveModuleQuiz(moduleSlug: string, score: number, total: number) {
  const state = read();
  write({ ...state, moduleQuizzes: { ...state.moduleQuizzes, [moduleSlug]: best(state.moduleQuizzes[moduleSlug], score, total) } });
}

export function setLearnerName(name: string) {
  write({ ...read(), name: name.slice(0, 80) });
}

export function setLastLesson(course: string, lesson: string) {
  const state = read();
  if (state.last?.course === course && state.last.lesson === lesson) return;
  write({ ...state, last: { course, lesson } });
}

export function resetProgress() {
  write(EMPTY);
}

export function importProgress(json: string): boolean {
  try {
    const state = sanitizeProgress(JSON.parse(json));
    if (!state) return false;
    write(state);
    return true;
  } catch {
    return false;
  }
}

export function exportProgress(): string {
  return JSON.stringify(read(), null, 2);
}

/* ------------------------------------------------------------------ */
/* Derived values                                                      */
/* ------------------------------------------------------------------ */

export function countCompleted(state: ProgressState, keys: string[]): number {
  return keys.reduce((n, key) => n + (state.lessons[key] ? 1 : 0), 0);
}

export function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function isQuizPassed(result: QuizResult | undefined, ratio: number): boolean {
  return !!result && result.score / result.total >= ratio;
}
