/**
 * Compile /content/<course>/<lesson>.yaml into:
 *   - /data/lessons/<course>.ts   (typed lesson content, Markdown strings)
 *   - /data/lessons/index.ts      (lazy loaders + list of available lessons)
 *   - /public/search/<locale>.json (search index used by Ctrl+K)
 *
 * Usage:
 *   tsx scripts/build-content.ts                    build everything (missing lessons = warning)
 *   tsx scripts/build-content.ts --strict           build, missing lessons = error
 *   tsx scripts/build-content.ts --check [course…]  validate only, write nothing (always strict)
 */
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { modules } from "../data/curriculum";
import { languageIds } from "../lib/languages";
import { locales } from "../lib/types";
import type { Course, Lesson, SearchEntry } from "../lib/types";

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_DIR = path.join(ROOT, "data", "lessons");
const SEARCH_DIR = path.join(ROOT, "public", "search");

const WIDGETS = ["cidr-calculator", "base-converter", "permission-calculator"];
const KINDS = ["vulnerable", "secure", "neutral"];

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
// Missing lessons are errors only with --strict. Plain --check validates the lessons that
// EXIST, so CI stays green while the curriculum is still being written out.
const strict = args.includes("--strict");
// a course filter only makes sense when validating: a build always covers the whole curriculum
const onlyCourses = checkOnly ? args.filter((a) => !a.startsWith("--")) : [];

const errors: string[] = [];
const warnings: string[] = [];

/* ------------------------------------------------------------------ */
/* Validation helpers                                                  */
/* ------------------------------------------------------------------ */

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function makeValidator(file: string) {
  const err = (where: string, msg: string) => errors.push(`${file} > ${where}: ${msg}`);
  const warn = (where: string, msg: string) => warnings.push(`${file} > ${where}: ${msg}`);

  const keys = (v: Obj, where: string, allowed: string[], required: string[]) => {
    for (const k of Object.keys(v)) if (!allowed.includes(k)) err(where, `unknown key "${k}" (allowed: ${allowed.join(", ")})`);
    for (const k of required) if (!(k in v)) err(where, `missing key "${k}"`);
  };

  const str = (v: unknown, where: string, min = 1): v is string => {
    if (typeof v !== "string") {
      err(where, `expected a string, got ${v === null ? "null" : typeof v} - quote the value or use a block scalar (|)`);
      return false;
    }
    if (v.trim().length < min) {
      err(where, `too short (${v.trim().length} chars, minimum ${min})`);
      return false;
    }
    return true;
  };

  /** A { fr, en } pair of strings. */
  const loc = (v: unknown, where: string, min = 1) => {
    if (!isObj(v)) return err(where, "expected { fr: ..., en: ... }");
    keys(v, where, [...locales], [...locales]);
    for (const l of locales) if (l in v) str(v[l], `${where}.${l}`, min);
  };

  const code = (v: Obj, where: string) => {
    // paths such as ".github/workflows/ci.yml" are welcome, spaces and Windows-forbidden characters are not
    if (str(v.file, `${where}.file`) && /[\\:*?"<>|\s]/.test(v.file as string)) {
      err(`${where}.file`, `invalid file name "${v.file}"`);
    }
    if (str(v.lang, `${where}.lang`) && !languageIds.includes(v.lang as string)) {
      err(`${where}.lang`, `unknown language "${v.lang}" (allowed: ${languageIds.join(", ")})`);
    }
    if (str(v.code, `${where}.code`, 10)) {
      const c = v.code as string;
      if (/\bTODO\b|\bFIXME\b|lorem ipsum/i.test(c)) err(`${where}.code`, "contains a TODO/FIXME/lorem placeholder");
      if (c.includes("\r")) err(`${where}.code`, "contains carriage returns (CRLF) - use LF line endings");
    }
  };

  return { err, warn, keys, str, loc, code };
}

function validateLesson(raw: unknown, file: string): raw is Omit<Lesson, "slug" | "title"> {
  const before = errors.length;
  const v = makeValidator(file);

  if (!isObj(raw)) {
    v.err("root", "the file must contain a YAML mapping");
    return false;
  }

  v.keys(
    raw,
    "root",
    ["description", "duration", "intro", "sections", "examples", "mistake", "bestPractice", "exercise", "quiz", "widgets"],
    ["description", "duration", "intro", "sections", "examples", "mistake", "bestPractice", "exercise", "quiz"],
  );

  v.loc(raw.description, "description", 30);
  if (typeof raw.duration !== "number" || raw.duration < 5 || raw.duration > 120) {
    v.err("duration", "expected a number of minutes between 5 and 120");
  }
  v.loc(raw.intro, "intro", 200);

  // --- sections
  if (!Array.isArray(raw.sections) || raw.sections.length < 1) {
    v.err("sections", "at least 1 section is required");
  } else {
    raw.sections.forEach((s, i) => {
      const where = `sections[${i}]`;
      if (!isObj(s)) return v.err(where, "expected a mapping");
      v.keys(s, where, ["heading", "body"], ["heading", "body"]);
      v.loc(s.heading, `${where}.heading`, 3);
      v.loc(s.body, `${where}.body`, 150);
    });
  }

  // --- examples
  if (!Array.isArray(raw.examples) || raw.examples.length < 3) {
    v.err("examples", `at least 3 code examples are required (found ${Array.isArray(raw.examples) ? raw.examples.length : 0})`);
  } else {
    raw.examples.forEach((e, i) => {
      const where = `examples[${i}]`;
      if (!isObj(e)) return v.err(where, "expected a mapping");
      v.keys(e, where, ["title", "file", "lang", "kind", "code", "output", "note"], ["title", "file", "lang", "code", "note"]);
      v.loc(e.title, `${where}.title`, 3);
      v.code(e, where);
      if ("kind" in e && !KINDS.includes(e.kind as string)) v.err(`${where}.kind`, `must be one of ${KINDS.join(", ")}`);
      if ("output" in e) v.str(e.output, `${where}.output`);
      v.loc(e.note, `${where}.note`, 30);
    });
  }

  v.loc(raw.mistake, "mistake", 100);
  v.loc(raw.bestPractice, "bestPractice", 100);

  // --- exercise
  if (!isObj(raw.exercise)) {
    v.err("exercise", "expected { statement, solution }");
  } else {
    v.keys(raw.exercise, "exercise", ["statement", "solution"], ["statement", "solution"]);
    v.loc(raw.exercise.statement, "exercise.statement", 60);
    const s = raw.exercise.solution;
    if (!isObj(s)) {
      v.err("exercise.solution", "expected { file, lang, code, note? }");
    } else {
      v.keys(s, "exercise.solution", ["file", "lang", "code", "note"], ["file", "lang", "code"]);
      v.code(s, "exercise.solution");
      if ("note" in s) v.loc(s.note, "exercise.solution.note", 10);
    }
  }

  // --- quiz
  if (!Array.isArray(raw.quiz) || raw.quiz.length !== 5) {
    v.err("quiz", `exactly 5 questions are required (found ${Array.isArray(raw.quiz) ? raw.quiz.length : 0})`);
  } else {
    const answers: number[] = [];
    raw.quiz.forEach((q, i) => {
      const where = `quiz[${i}]`;
      if (!isObj(q)) return v.err(where, "expected a mapping");
      v.keys(q, where, ["q", "options", "answer", "why"], ["q", "options", "answer", "why"]);
      v.loc(q.q, `${where}.q`, 10);
      v.loc(q.why, `${where}.why`, 20);
      let count = -1;
      if (!isObj(q.options)) {
        v.err(`${where}.options`, "expected { fr: [...], en: [...] }");
      } else {
        v.keys(q.options, `${where}.options`, [...locales], [...locales]);
        for (const l of locales) {
          const opts = q.options[l];
          if (!Array.isArray(opts) || opts.length !== 4) {
            v.err(`${where}.options.${l}`, "expected exactly 4 options");
            continue;
          }
          opts.forEach((o, j) => v.str(o, `${where}.options.${l}[${j}]`));
          if (new Set(opts).size !== opts.length) v.err(`${where}.options.${l}`, "duplicate options");
          count = opts.length;
        }
      }
      if (!Number.isInteger(q.answer) || (q.answer as number) < 0 || (count > 0 && (q.answer as number) >= count)) {
        v.err(`${where}.answer`, "must be the 0-based index of the correct option");
      } else {
        answers.push(q.answer as number);
      }
    });
    if (answers.length === 5 && new Set(answers).size < 2) {
      v.err("quiz", `correct answers are all at position ${answers[0]} - vary the position of the correct option`);
    }
  }

  // --- widgets
  if ("widgets" in raw) {
    if (!Array.isArray(raw.widgets)) v.err("widgets", "expected a list");
    else for (const w of raw.widgets) if (!WIDGETS.includes(w as string)) v.err("widgets", `unknown widget "${w}" (allowed: ${WIDGETS.join(", ")})`);
  }

  return errors.length === before;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

function loadCourse(course: Course): Lesson[] {
  const dir = path.join(CONTENT_DIR, course.slug);
  const lessons: Lesson[] = [];
  const expected = new Set(course.lessons.map((l) => `${l.slug}.yaml`));

  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".yaml") && !expected.has(f)) {
        errors.push(`content/${course.slug}/${f}: not declared in data/curriculum.ts (expected one of: ${[...expected].join(", ")})`);
      }
    }
  }

  for (const ref of course.lessons) {
    const rel = `content/${course.slug}/${ref.slug}.yaml`;
    const file = path.join(dir, `${ref.slug}.yaml`);
    if (!fs.existsSync(file)) {
      (strict ? errors : warnings).push(`${rel}: missing lesson file`);
      continue;
    }
    let raw: unknown;
    try {
      raw = parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      errors.push(`${rel}: YAML syntax error - ${(e as Error).message.split("\n")[0]}`);
      continue;
    }
    if (validateLesson(raw, rel)) lessons.push({ slug: ref.slug, title: ref.title, ...raw });
  }
  return lessons;
}

/* ------------------------------------------------------------------ */
/* Output                                                              */
/* ------------------------------------------------------------------ */

/** Markdown -> plain text for the search index. */
function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, " ")
    .replace(/[#>*_|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function writeIfChanged(file: string, content: string) {
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function main() {
  const selected = modules.flatMap((m) => m.courses).filter((c) => onlyCourses.length === 0 || onlyCourses.includes(c.slug));
  for (const slug of onlyCourses) {
    if (!selected.some((c) => c.slug === slug)) errors.push(`unknown course "${slug}"`);
  }

  const byCourse = new Map<string, Lesson[]>();
  for (const course of selected) byCourse.set(course.slug, loadCourse(course));

  const count = [...byCourse.values()].reduce((n, l) => n + l.length, 0);
  const examples = [...byCourse.values()].flat().reduce((n, l) => n + l.examples.length + 1, 0);

  for (const w of warnings) console.warn(`  warn  ${w}`);
  for (const e of errors) console.error(`  error ${e}`);

  if (errors.length > 0) {
    console.error(`\n✖ ${errors.length} error(s), ${warnings.length} warning(s) - ${count} valid lesson(s)`);
    process.exit(1);
  }

  if (checkOnly) {
    console.log(`✔ ${count} lesson(s) valid, ${examples} code examples (${selected.length} course(s) checked)`);
    return;
  }

  // --- data/lessons/<course>.ts
  const header = "// AUTO-GENERATED by scripts/build-content.ts from /content - do not edit by hand.\n";
  for (const [slug, lessons] of byCourse) {
    writeIfChanged(
      path.join(OUT_DIR, `${slug}.ts`),
      `${header}import type { Lesson } from "@/lib/types";\n\nexport const lessons: Lesson[] = ${JSON.stringify(lessons, null, 2)};\n`,
    );
  }

  // --- data/lessons/index.ts
  const loaders = [...byCourse.keys()].map((slug) => `  ${JSON.stringify(slug)}: () => import(${JSON.stringify(`./${slug}`)}),`).join("\n");
  const available = [...byCourse].map(([slug, lessons]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(lessons.map((l) => l.slug))},`).join("\n");
  writeIfChanged(
    path.join(OUT_DIR, "index.ts"),
    `${header}import type { Lesson } from "@/lib/types";

const loaders: Record<string, () => Promise<{ lessons: Lesson[] }>> = {
${loaders}
};

/** Lessons that have content, per course (in curriculum order). */
export const availableLessons: Record<string, string[]> = {
${available}
};

export const contentStats = { lessons: ${count}, examples: ${examples} };

export async function getLessons(courseSlug: string): Promise<Lesson[]> {
  const load = loaders[courseSlug];
  return load ? (await load()).lessons : [];
}

export async function getLesson(courseSlug: string, lessonSlug: string): Promise<Lesson | undefined> {
  return (await getLessons(courseSlug)).find((l) => l.slug === lessonSlug);
}
`,
  );

  // --- public/search/<locale>.json
  for (const locale of locales) {
    const entries: SearchEntry[] = [];
    for (const module of modules) {
      for (const course of module.courses) {
        entries.push({
          url: `/courses/${course.slug}`,
          title: course.title[locale],
          course: course.title[locale],
          module: module.title[locale],
          keywords: course.tags.join(" "),
          text: course.description[locale],
        });
        for (const lesson of byCourse.get(course.slug) ?? []) {
          entries.push({
            url: `/courses/${course.slug}/${lesson.slug}`,
            title: lesson.title[locale],
            course: course.title[locale],
            module: module.title[locale],
            keywords: [
              ...course.tags,
              ...lesson.sections.map((s) => s.heading[locale]),
              ...lesson.examples.map((e) => `${e.title[locale]} ${e.file}`),
            ].join(" "),
            text: plain(
              [
                lesson.description[locale],
                lesson.intro[locale],
                ...lesson.sections.map((s) => s.body[locale]),
                lesson.mistake[locale],
                lesson.bestPractice[locale],
              ].join(" "),
            ).slice(0, 1800),
          });
        }
      }
    }
    writeIfChanged(path.join(SEARCH_DIR, `${locale}.json`), JSON.stringify(entries));
  }

  console.log(`✔ content built: ${count} lesson(s), ${examples} code examples, ${warnings.length} warning(s)`);
}

main();
