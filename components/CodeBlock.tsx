import { ShieldAlert, ShieldCheck, Terminal } from "lucide-react";
import { CodeActions } from "@/components/CodeActions";
import { Badge } from "@/components/ui/badge";
import { highlight } from "@/lib/highlight";
import { getDictionary } from "@/lib/i18n";
import { getLanguage } from "@/lib/languages";
import type { ExampleKind, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  lang: string;
  locale: Locale;
  /** File name shown in the header (main.tf, Dockerfile, app.py…) */
  file?: string;
  kind?: ExampleKind;
  /** Expected result, displayed under the code */
  output?: string;
  className?: string;
}

/**
 * Code block: always dark, file name in the header, "Try it Yourself" and "Copy" buttons.
 * Highlighting is done on the server with Shiki: no highlighter is shipped to the browser.
 */
export async function CodeBlock({ code, lang, locale, file, kind = "neutral", output, className }: CodeBlockProps) {
  const dict = getDictionary(locale);
  const info = getLanguage(lang);
  const source = code.replace(/\s+$/, "");
  const html = await highlight(source, lang);

  return (
    <figure
      data-code-block
      className={cn(
        "my-5 overflow-hidden rounded-lg border bg-code text-code-foreground",
        kind === "vulnerable" ? "border-red-500/70" : kind === "secure" ? "border-emerald-500/70" : "border-code-border",
        className,
      )}
    >
      <figcaption className="flex min-h-12 items-center gap-2 border-b border-code-border bg-white/[0.04] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {kind === "vulnerable" && (
            <Badge variant="danger">
              <ShieldAlert className="size-3.5" aria-hidden="true" />
              {dict.lesson.vulnerable}
            </Badge>
          )}
          {kind === "secure" && (
            <Badge variant="safe">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              {dict.lesson.secure}
            </Badge>
          )}
          <span className="min-w-0 truncate font-mono text-[0.82rem] text-white/90" title={file}>
            {file ?? info.label}
          </span>
          {file && <span className="hidden shrink-0 text-xs text-white/50 md:inline">{info.label}</span>}
        </div>
        <CodeActions
          lang={lang}
          file={file}
          t={dict.code}
          closeLabel={dict.nav.close}
          expectedLabel={dict.lesson.expectedOutput}
        />
      </figcaption>

      <div data-code className="code-scroll" dangerouslySetInnerHTML={{ __html: html }} />

      {output && (
        <div className="border-t border-code-border bg-black/30">
          <p className="flex items-center gap-1.5 px-4 pt-2.5 text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
            <Terminal className="size-3.5" aria-hidden="true" />
            {dict.lesson.expectedOutput}
          </p>
          <pre
            data-output
            tabIndex={0}
            className="overflow-x-auto px-4 pb-3 pt-1.5 font-mono text-[0.84rem] leading-6 text-white/85"
          >
            {output.replace(/\s+$/, "")}
          </pre>
        </div>
      )}
    </figure>
  );
}
