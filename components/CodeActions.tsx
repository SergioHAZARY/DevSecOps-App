"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Check, Copy, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Dictionary } from "@/lib/i18n";

// Monaco is only downloaded when a learner opens the playground
const Playground = dynamic(() => import("@/components/Playground").then((m) => m.Playground), {
  ssr: false,
  loading: () => <p className="p-6 text-sm text-muted-foreground">…</p>,
});

interface CodeActionsProps {
  lang: string;
  file?: string;
  t: Dictionary["code"];
  closeLabel: string;
  expectedLabel: string;
}

/** "Try it Yourself" and "Copy" buttons of a code block. The code is read from the rendered block. */
export function CodeActions({ lang, file, t, closeLabel, expectedLabel }: CodeActionsProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [snippet, setSnippet] = React.useState<{ code: string; output?: string }>({ code: "" });

  const read = () => {
    const figure = ref.current?.closest("[data-code-block]");
    return {
      code: figure?.querySelector("[data-code] code")?.textContent ?? "",
      output: figure?.querySelector("[data-output]")?.textContent ?? undefined,
    };
  };

  const copy = async () => {
    const { code } = read();
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback for browsers / contexts without the async clipboard API
      const area = document.createElement("textarea");
      area.value = code;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const tryIt = () => {
    setSnippet(read());
    setOpen(true);
  };

  return (
    <div ref={ref} className="ml-auto flex shrink-0 items-center gap-1.5">
      <Button variant="code" size="sm" onClick={tryIt} aria-label={t.tryItYourself} className="h-9 sm:h-8">
        <Play aria-hidden="true" />
        <span className="hidden sm:inline">{t.tryItYourself}</span>
        <span className="sm:hidden" aria-hidden="true">{t.tryIt}</span>
      </Button>
      <Button variant="code" size="sm" onClick={copy} aria-label={t.copyCode} className="h-9 sm:h-8">
        {copied ? <Check className="text-emerald-400" aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span className="max-[380px]:sr-only" aria-live="polite">{copied ? t.copied : t.copy}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={closeLabel} className="h-[calc(100dvh-2rem)] max-w-5xl text-foreground">
          <div className="border-b px-4 py-3 pr-12">
            <DialogTitle className="text-base font-semibold">{t.tryItYourself}</DialogTitle>
            <DialogDescription className="sr-only">{t.browserOnly}</DialogDescription>
          </div>
          {open && (
            <Playground
              code={snippet.code}
              lang={lang}
              file={file}
              expectedOutput={snippet.output}
              t={t}
              expectedLabel={expectedLabel}
              className="flex-1"
              editorHeight="46%"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
