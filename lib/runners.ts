"use client";

import type { Runner } from "@/lib/languages";

/**
 * In-browser execution for the "Try it Yourself" playground.
 * Nothing is sent to a server: JavaScript/TypeScript and Python run inside Web Workers
 * (so an infinite loop can be killed), SQL runs on SQLite compiled to WebAssembly.
 */

export interface OutputLine {
  stream: "out" | "err" | "info";
  text: string;
}

export interface RunMessages {
  loadingRuntime: string;
  timeout: string;
  stopped: string;
  noOutput: string;
  valid: string;
  document: string;
  rowsAffected: string;
  noRows: string;
}

export interface RunContext {
  emit: (line: OutputLine) => void;
  /** Called with an HTML document to preview (HTML runner). */
  preview: (html: string) => void;
  messages: RunMessages;
  /** TypeScript -> JavaScript, provided by the Monaco editor. */
  transpile?: (code: string) => Promise<string>;
}

export interface RunHandle {
  done: Promise<void>;
  cancel: () => void;
}

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/";
const SQLJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/";
const SQLJS_INTEGRITY = "sha384-DJiKBv+LC78e5InEB+MvFIAH079ynMK/ERTtFUCpDzXhH1Bht7aVfpg3yOVsuYl9";

const JS_TIMEOUT_MS = 10_000;
const PYTHON_TIMEOUT_MS = 60_000;

/* ------------------------------------------------------------------ */
/* JavaScript / TypeScript                                             */
/* ------------------------------------------------------------------ */

// Runs inside the worker. Network APIs are removed so that lesson code cannot call out.
const JS_WORKER_SOURCE = [
  "for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'indexedDB', 'caches']) {",
  "  try { Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false }); } catch (e) {}",
  "}",
  "const format = (value) => {",
  "  if (typeof value === 'string') return value;",
  "  if (value instanceof Error) return value.name + ': ' + value.message;",
  "  if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']';",
  "  if (typeof value === 'bigint') return value.toString() + 'n';",
  "  if (typeof value === 'symbol' || value === undefined) return String(value);",
  "  try {",
  "    const seen = new WeakSet();",
  "    const text = JSON.stringify(value, (key, v) => {",
  "      if (typeof v === 'bigint') return v.toString() + 'n';",
  "      if (typeof v === 'function') return '[Function ' + (v.name || 'anonymous') + ']';",
  "      if (v instanceof Map) return { '[Map]': Array.from(v.entries()) };",
  "      if (v instanceof Set) return { '[Set]': Array.from(v.values()) };",
  "      if (typeof v === 'object' && v !== null) { if (seen.has(v)) return '[Circular]'; seen.add(v); }",
  "      return v;",
  "    }, 2);",
  "    return text === undefined ? String(value) : text;",
  "  } catch (e) { return String(value); }",
  "};",
  "const send = (stream) => (...args) => self.postMessage({ type: 'line', stream, text: args.map(format).join(' ') });",
  "self.console = { log: send('out'), info: send('out'), debug: send('out'), table: send('out'), dir: send('out'), warn: send('err'), error: send('err'), assert: (ok, ...rest) => { if (!ok) send('err')('Assertion failed:', ...rest); } };",
  "self.onmessage = async (event) => {",
  "  try {",
  "    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;",
  "    await new AsyncFunction(event.data.code)();",
  "  } catch (error) {",
  "    send('err')(error instanceof Error ? error.name + ': ' + error.message : String(error));",
  "  }",
  "  self.postMessage({ type: 'done' });",
  "};",
].join("\n");

function workerFromSource(source: string): Worker {
  const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  const worker = new Worker(url);
  // the worker keeps its own reference to the script once started
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return worker;
}

function runJavaScript(code: string, ctx: RunContext): RunHandle {
  let finish: () => void = () => {};
  const worker = workerFromSource(JS_WORKER_SOURCE);
  let printed = 0;

  const done = new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      ctx.emit({ stream: "err", text: ctx.messages.timeout });
      finish();
    }, JS_TIMEOUT_MS);

    finish = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve();
    };

    worker.onmessage = (event: MessageEvent<{ type: string; stream?: OutputLine["stream"]; text?: string }>) => {
      if (event.data.type === "line") {
        printed += 1;
        ctx.emit({ stream: event.data.stream ?? "out", text: event.data.text ?? "" });
      } else if (event.data.type === "done") {
        if (printed === 0) ctx.emit({ stream: "info", text: ctx.messages.noOutput });
        finish();
      }
    };
    worker.onerror = (event) => {
      // syntax errors are reported here, before the code starts
      ctx.emit({ stream: "err", text: event.message || "Error" });
      event.preventDefault();
      finish();
    };
    worker.postMessage({ code });
  });

  return {
    done,
    cancel: () => {
      ctx.emit({ stream: "info", text: ctx.messages.stopped });
      finish();
    },
  };
}

function runTypeScript(code: string, ctx: RunContext): RunHandle {
  let inner: RunHandle | null = null;
  let cancelled = false;

  const done = (async () => {
    if (!ctx.transpile) {
      ctx.emit({ stream: "err", text: "TypeScript compiler not available." });
      return;
    }
    let js: string;
    try {
      js = await ctx.transpile(code);
    } catch (error) {
      ctx.emit({ stream: "err", text: error instanceof Error ? error.message : String(error) });
      return;
    }
    if (cancelled) return;
    inner = runJavaScript(js, ctx);
    await inner.done;
  })();

  return {
    done,
    cancel: () => {
      cancelled = true;
      inner?.cancel();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Python (Pyodide)                                                    */
/* ------------------------------------------------------------------ */

const PY_WORKER_SOURCE = [
  `const BASE = ${JSON.stringify(PYODIDE_URL)};`,
  "importScripts(BASE + 'pyodide.js');",
  "let runtime = null;",
  "const line = (stream) => (text) => self.postMessage({ type: 'line', stream, text });",
  "self.onmessage = async (event) => {",
  "  try {",
  "    if (!runtime) runtime = loadPyodide({ indexURL: BASE });",
  "    const py = await runtime;",
  "    py.setStdout({ batched: line('out') });",
  "    py.setStderr({ batched: line('err') });",
  "    self.postMessage({ type: 'ready' });",
  "    await py.loadPackagesFromImports(event.data.code, { messageCallback: () => {}, errorCallback: () => {} });",
  "    // fresh namespace for every run, like a new `python file.py`",
  "    const scope = py.globals.get('dict')();",
  "    scope.set('__name__', '__main__');",
  "    try {",
  "      await py.runPythonAsync(event.data.code, { globals: scope, filename: 'main.py' });",
  "    } finally {",
  "      py.runPython('import sys; sys.stdout.flush(); sys.stderr.flush()');",
  "      scope.destroy();",
  "    }",
  "  } catch (error) {",
  "    let message = String((error && error.message) || error);",
  "    // hide Pyodide's internal frames: keep the part of the traceback that concerns the learner's file",
  "    const at = message.indexOf('  File \"main.py\"');",
  "    if (at > 0) message = 'Traceback (most recent call last):\\n' + message.slice(at);",
  "    line('err')(message.trimEnd());",
  "  }",
  "  self.postMessage({ type: 'done' });",
  "};",
].join("\n");

let pythonWorker: Worker | null = null;

function runPython(code: string, ctx: RunContext): RunHandle {
  let finish: (kill: boolean) => void = () => {};
  let printed = 0;

  if (!pythonWorker) {
    ctx.emit({ stream: "info", text: ctx.messages.loadingRuntime });
    pythonWorker = workerFromSource(PY_WORKER_SOURCE);
  }
  const worker = pythonWorker;

  const done = new Promise<void>((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    finish = (kill) => {
      clearTimeout(timer);
      worker.onmessage = null;
      worker.onerror = null;
      if (kill) {
        // the only way to stop running Python code is to drop the whole interpreter
        worker.terminate();
        if (pythonWorker === worker) pythonWorker = null;
      }
      resolve();
    };

    worker.onmessage = (event: MessageEvent<{ type: string; stream?: OutputLine["stream"]; text?: string }>) => {
      const data = event.data;
      if (data.type === "ready") {
        // the time limit starts once the runtime is loaded
        timer = setTimeout(() => {
          ctx.emit({ stream: "err", text: ctx.messages.timeout });
          finish(true);
        }, PYTHON_TIMEOUT_MS);
      } else if (data.type === "line") {
        printed += 1;
        ctx.emit({ stream: data.stream ?? "out", text: data.text ?? "" });
      } else if (data.type === "done") {
        if (printed === 0) ctx.emit({ stream: "info", text: ctx.messages.noOutput });
        finish(false);
      }
    };
    worker.onerror = (event) => {
      ctx.emit({ stream: "err", text: event.message || "Python runtime failed to load." });
      event.preventDefault();
      finish(true);
    };
    worker.postMessage({ code });
  });

  return {
    done,
    cancel: () => {
      ctx.emit({ stream: "info", text: ctx.messages.stopped });
      finish(true);
    },
  };
}

/* ------------------------------------------------------------------ */
/* SQL (SQLite via sql.js)                                             */
/* ------------------------------------------------------------------ */

interface SqlResult {
  columns: string[];
  values: unknown[][];
}
interface SqlDatabase {
  exec(sql: string): SqlResult[];
  close(): void;
}
interface SqlJs {
  Database: new () => SqlDatabase;
}
declare global {
  interface Window {
    initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<SqlJs>;
  }
}

let sqlJs: Promise<SqlJs> | null = null;

function loadSqlJs(): Promise<SqlJs> {
  sqlJs ??= new Promise<SqlJs>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${SQLJS_URL}sql-wasm.js`;
    script.integrity = SQLJS_INTEGRITY;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (!window.initSqlJs) return reject(new Error("sql.js failed to initialise"));
      window.initSqlJs({ locateFile: (file) => `${SQLJS_URL}${file}` }).then(resolve, reject);
    };
    script.onerror = () => reject(new Error("Could not load the SQLite runtime (network error)."));
    document.head.appendChild(script);
  }).catch((error) => {
    sqlJs = null;
    throw error;
  });
  return sqlJs;
}

/** Renders a result set the way the sqlite3 / psql shells do. */
export function formatTable(columns: string[], rows: unknown[][]): string {
  const cells = rows.map((row) => row.map((value) => (value === null ? "NULL" : String(value))));
  const widths = columns.map((name, i) => Math.max(name.length, ...cells.map((row) => row[i].length)));
  const line = (row: string[]) => row.map((cell, i) => cell.padEnd(widths[i])).join(" | ").trimEnd();
  return [line(columns), widths.map((w) => "-".repeat(w)).join("-+-"), ...cells.map(line)].join("\n");
}

function runSql(code: string, ctx: RunContext): RunHandle {
  let cancelled = false;
  const done = (async () => {
    let SQL: SqlJs;
    try {
      SQL = await loadSqlJs();
    } catch (error) {
      ctx.emit({ stream: "err", text: error instanceof Error ? error.message : String(error) });
      return;
    }
    if (cancelled) return;
    const db = new SQL.Database();
    try {
      const results = db.exec(code);
      if (results.length === 0) ctx.emit({ stream: "info", text: ctx.messages.rowsAffected });
      results.forEach((result, index) => {
        if (index > 0) ctx.emit({ stream: "out", text: "" });
        ctx.emit({ stream: "out", text: formatTable(result.columns, result.values) });
        if (result.values.length === 0) ctx.emit({ stream: "info", text: ctx.messages.noRows });
      });
    } catch (error) {
      ctx.emit({ stream: "err", text: `SQL error: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      db.close();
    }
  })();
  return { done, cancel: () => (cancelled = true) };
}

/* ------------------------------------------------------------------ */
/* JSON / YAML / HTML                                                  */
/* ------------------------------------------------------------------ */

function runJson(code: string, ctx: RunContext): RunHandle {
  try {
    const value: unknown = JSON.parse(code);
    ctx.emit({ stream: "info", text: `✔ JSON ${ctx.messages.valid}` });
    ctx.emit({ stream: "out", text: JSON.stringify(value, null, 2) });
  } catch (error) {
    ctx.emit({ stream: "err", text: `✖ ${error instanceof Error ? error.message : String(error)}` });
  }
  return { done: Promise.resolve(), cancel: () => {} };
}

function runYaml(code: string, ctx: RunContext): RunHandle {
  const done = (async () => {
    const { parseAllDocuments } = await import("yaml");
    const documents = parseAllDocuments(code);
    let failed = false;
    for (const doc of documents) {
      for (const problem of doc.errors) {
        failed = true;
        ctx.emit({ stream: "err", text: `✖ ${problem.message}` });
      }
      for (const warning of doc.warnings) ctx.emit({ stream: "info", text: `⚠ ${warning.message}` });
    }
    if (failed) return;
    ctx.emit({ stream: "info", text: `✔ YAML ${ctx.messages.valid} - ${documents.length} ${ctx.messages.document}(s)` });
    documents.forEach((doc, index) => {
      if (documents.length > 1) ctx.emit({ stream: "info", text: `--- ${ctx.messages.document} ${index + 1}` });
      // what a program actually receives once the YAML is parsed
      ctx.emit({ stream: "out", text: JSON.stringify(doc.toJS(), null, 2) ?? "null" });
    });
  })().catch((error: unknown) => {
    ctx.emit({ stream: "err", text: error instanceof Error ? error.message : String(error) });
  });
  return { done, cancel: () => {} };
}

function runHtml(code: string, ctx: RunContext): RunHandle {
  ctx.preview(code);
  return { done: Promise.resolve(), cancel: () => {} };
}

/* ------------------------------------------------------------------ */

export function runCode(runner: Runner, code: string, ctx: RunContext): RunHandle {
  switch (runner) {
    case "javascript":
      return runJavaScript(code, ctx);
    case "typescript":
      return runTypeScript(code, ctx);
    case "python":
      return runPython(code, ctx);
    case "sql":
      return runSql(code, ctx);
    case "json":
      return runJson(code, ctx);
    case "yaml":
      return runYaml(code, ctx);
    case "html":
      return runHtml(code, ctx);
  }
}
