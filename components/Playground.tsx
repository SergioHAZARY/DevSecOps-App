"use client";

import * as React from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Check, Copy, Info, Play, RotateCcw, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLanguage } from "@/lib/languages";
import { runCode, type OutputLine, type RunHandle } from "@/lib/runners";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PlaygroundProps {
  code: string;
  lang: string;
  file?: string;
  /** Expected result written by the lesson author, shown when the code cannot run in the browser */
  expectedOutput?: string;
  t: Dictionary["code"];
  expectedLabel: string;
  className?: string;
  editorHeight?: string;
}

type MonacoEditor = Parameters<OnMount>[0];
type Monaco = Parameters<OnMount>[1];

interface TsWorkerClient {
  getEmitOutput(uri: string): Promise<{ outputFiles: { text: string }[] }>;
  getSyntacticDiagnostics(uri: string): Promise<{ messageText: string | { messageText: string } }[]>;
}
interface TsApi {
  getTypeScriptWorker(): Promise<(...uris: unknown[]) => Promise<TsWorkerClient>>;
}

export function Playground({ code, lang, file, expectedOutput, t, expectedLabel, className, editorHeight = "38vh" }: PlaygroundProps) {
  const info = getLanguage(lang);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const { resolvedTheme } = useTheme();

  const [value, setValue] = React.useState(code);
  const [lines, setLines] = React.useState<OutputLine[]>([]);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const editorRef = React.useRef<MonacoEditor | null>(null);
  const monacoRef = React.useRef<Monaco | null>(null);
  const handleRef = React.useRef<RunHandle | null>(null);
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // a new snippet (playground page: language switch) replaces the editor content
  React.useEffect(() => {
    setValue(code);
    setLines([]);
    setPreview(null);
  }, [code, lang]);

  // stop whatever is running when the playground closes
  React.useEffect(() => () => handleRef.current?.cancel(), []);

  const transpile = React.useCallback(async (source: string): Promise<string> => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) throw new Error(t.editorLoading);
    model.setValue(source);
    // the TypeScript API moved from `monaco.languages.typescript` to `monaco.typescript` in recent releases
    const api = ((monaco as unknown as { typescript?: TsApi }).typescript ??
      (monaco.languages as unknown as { typescript: TsApi }).typescript) as TsApi;
    const getWorker = await api.getTypeScriptWorker();
    const client = await getWorker(model.uri);
    const uri = model.uri.toString();
    const diagnostics = await client.getSyntacticDiagnostics(uri);
    if (diagnostics.length > 0) {
      const first = diagnostics[0].messageText;
      throw new Error(`SyntaxError: ${typeof first === "string" ? first : first.messageText}`);
    }
    const output = await client.getEmitOutput(uri);
    return output.outputFiles[0]?.text ?? "";
  }, [t.editorLoading]);

  const run = React.useCallback(() => {
    if (!info.runner) return;
    handleRef.current?.cancel();
    setLines([]);
    setPreview(null);
    setRunning(true);

    const handle = runCode(info.runner, valueRef.current, {
      emit: (line) => setLines((previous) => (previous.length > 2000 ? previous : [...previous, line])),
      preview: setPreview,
      messages: t,
      transpile,
    });
    handleRef.current = handle;
    void handle.done.finally(() => {
      if (handleRef.current === handle) {
        handleRef.current = null;
        setRunning(false);
      }
    });
  }, [info.runner, t, transpile]);

  const runRef = React.useRef(run);
  runRef.current = run;

  const stop = () => handleRef.current?.cancel();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(valueRef.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked by the browser: the code stays selectable in the editor
    }
  };

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
  };

  const localCommand = info.run?.replace("{file}", file?.split("/").pop() ?? "file");

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/60 px-3 py-2">
        <span className="mr-auto min-w-0 truncate font-mono text-sm">
          {file ?? info.label}
          <span className="ml-2 text-xs text-muted-foreground">{info.label}</span>
        </span>
        <Button size="sm" variant="ghost" onClick={() => setValue(code)} title={t.reset}>
          <RotateCcw aria-hidden="true" />
          <span className="hidden sm:inline">{t.reset}</span>
          <span className="sr-only sm:hidden">{t.reset}</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={copy} title={t.copyCode}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          <span className="hidden sm:inline" aria-live="polite">{copied ? t.copied : t.copy}</span>
          <span className="sr-only sm:hidden">{t.copyCode}</span>
        </Button>
        {info.runner &&
          (running ? (
            <Button size="sm" variant="destructive" onClick={stop}>
              <Square aria-hidden="true" />
              {t.stop}
            </Button>
          ) : (
            <Button size="sm" onClick={run} title="Ctrl + Enter">
              <Play aria-hidden="true" />
              {t.run}
            </Button>
          ))}
      </div>

      {/* editor */}
      <div style={{ height: editorHeight }} className="min-h-[220px] shrink-0 border-b">
        <Editor
          height="100%"
          path={`file:///${id}/${lang === "typescript" ? "main.ts" : `main.${lang}`}`}
          language={info.monaco}
          value={value}
          onChange={(next) => setValue(next ?? "")}
          onMount={onMount}
          theme={resolvedTheme === "light" ? "light" : "vs-dark"}
          loading={<p className="p-4 text-sm text-muted-foreground">{t.editorLoading}</p>}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "line",
            ariaLabel: `${t.tryItYourself} - ${info.label}`,
          }}
        />
      </div>

      {/* output */}
      <div className="flex min-h-[140px] flex-1 flex-col overflow-hidden bg-code text-code-foreground">
        <div className="flex items-center justify-between border-b border-code-border px-3 py-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {info.runner === "html" ? t.preview : info.runner ? t.output : expectedLabel}
          </span>
          {info.runner && (lines.length > 0 || preview !== null) && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => {
                setLines([]);
                setPreview(null);
              }}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {t.clear}
            </button>
          )}
        </div>

        {info.runner ? (
          preview !== null ? (
            <iframe
              title={t.preview}
              // no allow-same-origin: the previewed page cannot read this site's storage
              sandbox="allow-scripts"
              srcDoc={preview}
              className="min-h-[200px] w-full flex-1 bg-white"
            />
          ) : (
            <div className="scrollbar-thin flex-1 overflow-auto p-3 font-mono text-[0.84rem] leading-6" role="log" aria-live="polite">
              {lines.length === 0 ? (
                <p className="text-white/50">{running ? t.running : t.emptyOutput}</p>
              ) : (
                lines.map((line, index) => (
                  <pre
                    key={index}
                    className={cn(
                      "whitespace-pre-wrap break-words font-mono",
                      line.stream === "err" && "text-red-400",
                      line.stream === "info" && "text-emerald-300/80",
                    )}
                  >
                    {line.text || " "}
                  </pre>
                ))
              )}
            </div>
          )
        ) : (
          <div className="scrollbar-thin flex-1 overflow-auto p-3 text-sm">
            <p className="flex items-start gap-2 text-white/80">
              <Info className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-white">{t.notRunnableTitle}.</strong> {t.notRunnableText}
              </span>
            </p>
            {localCommand && (
              <pre className="mt-2 overflow-x-auto rounded border border-code-border bg-black/40 px-3 py-2 font-mono text-[0.84rem] text-emerald-300">
                $ {localCommand}
              </pre>
            )}
            {expectedOutput && (
              <pre className="mt-3 overflow-x-auto whitespace-pre font-mono text-[0.84rem] leading-6 text-white/85">{expectedOutput}</pre>
            )}
          </div>
        )}
      </div>

      {info.runner && (
        <p className="border-t bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground">
          {t.browserOnly} {(info.runner === "python" || info.runner === "javascript" || info.runner === "typescript") && t.runtimeNote}
        </p>
      )}
    </div>
  );
}
