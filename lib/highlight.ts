import "server-only";
import { createHighlighter, type Highlighter, type LanguageRegistration } from "shiki";
import { languages } from "@/lib/languages";

const THEME = "github-dark-default";

/** Shiki has no Rego grammar: a small TextMate grammar covers the language well enough. */
const rego: LanguageRegistration = {
  name: "rego",
  scopeName: "source.rego",
  repository: {},
  patterns: [
    { name: "comment.line.number-sign.rego", match: "#.*$" },
    { name: "string.quoted.double.rego", begin: '"', end: '"', patterns: [{ name: "constant.character.escape.rego", match: "\\\\." }] },
    { name: "string.quoted.other.raw.rego", begin: "`", end: "`" },
    { name: "keyword.control.rego", match: "\\b(package|import|default|if|else|contains|in|every|some|not|with|as|rego\\.v1)\\b" },
    { name: "constant.language.rego", match: "\\b(true|false|null)\\b" },
    { name: "constant.numeric.rego", match: "\\b\\d+(\\.\\d+)?\\b" },
    { name: "variable.language.rego", match: "\\b(input|data)\\b" },
    { name: "keyword.operator.rego", match: ":=|==|!=|<=|>=|=|<|>|\\||&" },
    { name: "entity.name.function.rego", match: "\\b[a-zA-Z_][a-zA-Z0-9_.]*(?=\\()" },
  ],
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [THEME],
    langs: [
      ...new Set(
        Object.values(languages)
          .map((l) => l.shiki)
          .filter((id) => id !== "text" && id !== "rego"),
      ),
      rego,
    ],
  });
  return highlighterPromise;
}

/** Returns `<pre class="shiki"><code>…</code></pre>` for a snippet. */
export async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  const shikiLang = languages[lang]?.shiki ?? "text";
  try {
    return highlighter.codeToHtml(code, { lang: shikiLang, theme: THEME });
  } catch {
    return highlighter.codeToHtml(code, { lang: "text", theme: THEME });
  }
}
