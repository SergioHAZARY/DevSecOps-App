import type { SearchEntry } from "@/lib/types";

/** Lower-case and strip accents so that "securite" finds "Sécurité". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

interface Prepared {
  entry: SearchEntry;
  title: string;
  course: string;
  keywords: string;
  text: string;
}

const preparedCache = new WeakMap<SearchEntry[], Prepared[]>();

function prepare(entries: SearchEntry[]): Prepared[] {
  let prepared = preparedCache.get(entries);
  if (!prepared) {
    prepared = entries.map((entry) => ({
      entry,
      title: normalize(entry.title),
      course: normalize(`${entry.course} ${entry.module}`),
      keywords: normalize(entry.keywords),
      text: normalize(entry.text),
    }));
    preparedCache.set(entries, prepared);
  }
  return prepared;
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  /** Extract of the body around the first match */
  excerpt: string;
}

function excerpt(entry: SearchEntry, normalizedText: string, token: string): string {
  const at = normalizedText.indexOf(token);
  if (at === -1) return entry.text.slice(0, 140);
  const start = Math.max(0, at - 50);
  const end = Math.min(entry.text.length, at + 110);
  return `${start > 0 ? "…" : ""}${entry.text.slice(start, end).trim()}${end < entry.text.length ? "…" : ""}`;
}

/**
 * Every word of the query must appear somewhere in the entry (AND search).
 * Matches in the title weigh more than matches in keywords, then in the body.
 */
export function searchEntries(entries: SearchEntry[], query: string, limit = 20): SearchHit[] {
  const tokens = normalize(query).split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0 || tokens.join("").length < 2) return [];

  const hits: SearchHit[] = [];
  for (const p of prepare(entries)) {
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      let s = 0;
      const inTitle = p.title.indexOf(token);
      if (inTitle !== -1) {
        s += 10;
        if (inTitle === 0 || /[\s\-/:(.]/.test(p.title[inTitle - 1])) s += 6;
        if (p.title === token) s += 10;
      }
      if (p.keywords.includes(token)) s += 5;
      if (p.course.includes(token)) s += 3;
      if (p.text.includes(token)) s += 1;
      if (s === 0) {
        matchedAll = false;
        break;
      }
      score += s;
    }
    if (!matchedAll) continue;
    // a course page is a better landing point than one of its lessons at equal score
    if (p.entry.url.split("/").length === 3) score += 2;
    hits.push({ entry: p.entry, score, excerpt: excerpt(p.entry, p.text, tokens[0]) });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
