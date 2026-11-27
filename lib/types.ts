export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

/** A value available in every supported language. */
export type L<T = string> = Record<Locale, T>;

export type Level = "beginner" | "intermediate" | "advanced";

/* ------------------------------------------------------------------ */
/* Curriculum structure (data/curriculum.ts)                           */
/* ------------------------------------------------------------------ */

export interface LessonRef {
  slug: string;
  title: L;
}

export interface Course {
  /** URL slug, also the folder name in /content and the file name in /data/lessons */
  slug: string;
  /** Display number, e.g. "1.3" */
  number: string;
  title: L;
  description: L;
  level: Level;
  /** Short technology tags shown on cards and used by the search */
  tags: string[];
  lessons: LessonRef[];
}

export interface Module {
  id: number;
  slug: string;
  title: L;
  description: L;
  level: Level;
  /** Key of an icon in components/ModuleIcon.tsx */
  icon: string;
  courses: Course[];
}

/* ------------------------------------------------------------------ */
/* Lesson content (content/<course>/<lesson>.yaml -> data/lessons/*.ts) */
/* ------------------------------------------------------------------ */

export type ExampleKind = "vulnerable" | "secure" | "neutral";

export interface CodeExample {
  title: L;
  /** File name displayed in the code block header (main.tf, Dockerfile, app.py...) */
  file: string;
  /** Language id, see lib/languages.ts */
  lang: string;
  kind?: ExampleKind;
  code: string;
  /** Expected result (terminal output, HTTP response...) */
  output?: string;
  /** Short Markdown explanation shown under the code */
  note: L;
}

export interface LessonSection {
  heading: L;
  /** Markdown */
  body: L;
}

export interface QuizQuestion {
  q: L;
  options: L<string[]>;
  /** Index of the correct option */
  answer: number;
  /** Explanation displayed after answering */
  why: L;
}

export interface Exercise {
  /** Markdown */
  statement: L;
  solution: {
    file: string;
    lang: string;
    code: string;
    note?: L;
  };
}

export interface LessonContent {
  /** One sentence used for SEO and search results */
  description: L;
  /** Estimated reading + practice time, in minutes */
  duration: number;
  /** Markdown, beginner friendly */
  intro: L;
  sections: LessonSection[];
  examples: CodeExample[];
  /** Markdown: "Erreur courante à éviter" */
  mistake: L;
  /** Markdown: "Best Practice DevSecOps" */
  bestPractice: L;
  exercise: Exercise;
  quiz: QuizQuestion[];
  /** Interactive widgets rendered after the intro, see components/widgets */
  widgets?: string[];
}

export interface Lesson extends LessonContent {
  slug: string;
  title: L;
}

/* ------------------------------------------------------------------ */
/* Search index (public/search/<locale>.json)                          */
/* ------------------------------------------------------------------ */

export interface SearchEntry {
  /** Path without locale prefix, e.g. /courses/python/port-scanner */
  url: string;
  title: string;
  course: string;
  module: string;
  /** Headings, tags and example file names */
  keywords: string;
  /** Plain text body */
  text: string;
}
