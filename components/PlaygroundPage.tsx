"use client";

import * as React from "react";
import { Playground } from "@/components/Playground";
import { getLanguage } from "@/lib/languages";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STARTERS: Record<string, { file: string; code: string }> = {
  python: {
    file: "main.py",
    code: `# DevSecOps playground - Python runs in your browser (Pyodide)
import hashlib

password = "ChangeMe123!"
digest = hashlib.sha256(password.encode()).hexdigest()
print("SHA-256:", digest)

for port in (22, 80, 443):
    print(f"Port {port} is a common service port")
`,
  },
  javascript: {
    file: "main.js",
    code: `// JavaScript runs in a sandboxed Web Worker
const headers = {
  "Strict-Transport-Security": "max-age=63072000",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'self'",
};

for (const [name, value] of Object.entries(headers)) {
  console.log(\`\${name}: \${value}\`);
}
`,
  },
  typescript: {
    file: "main.ts",
    code: `// TypeScript is compiled to JavaScript, then run
interface User {
  name: string;
  role: "admin" | "user";
}

const users: User[] = [
  { name: "alice", role: "admin" },
  { name: "bob", role: "user" },
];

const admins = users.filter((u) => u.role === "admin").map((u) => u.name);
console.log("Admins:", admins);
`,
  },
  sql: {
    file: "query.sql",
    code: `-- SQLite runs in your browser (sql.js)
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT);
INSERT INTO users (name, role) VALUES ('alice', 'admin'), ('bob', 'user'), ('carol', 'user');

-- Parameterized queries are the fix for SQL injection
SELECT role, COUNT(*) AS total
FROM users
GROUP BY role
ORDER BY total DESC;
`,
  },
  json: {
    file: "policy.json",
    code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
`,
  },
  yaml: {
    file: "workflow.yaml",
    code: `name: security
on: [push]
permissions:
  contents: read
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan for secrets
        uses: gitleaks/gitleaks-action@v2
`,
  },
  html: {
    file: "index.html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'" />
    <title>Secure page</title>
  </head>
  <body>
    <h1>Hello, DevSecOps!</h1>
    <p>Edit the HTML and press Run to preview.</p>
  </body>
</html>
`,
  },
};

const ORDER = ["python", "javascript", "typescript", "sql", "json", "yaml", "html"];

export function PlaygroundPage({ t, title, subtitle }: { t: Dictionary["code"]; title: string; subtitle: string }) {
  const [lang, setLang] = React.useState("python");
  const starter = STARTERS[lang];

  return (
    <main id="main" className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </header>

      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label={t.language}>
        {ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={lang === id}
            onClick={() => setLang(id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              lang === id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {getLanguage(id).label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 overflow-hidden rounded-lg border">
        <Playground
          key={lang}
          code={starter.code}
          lang={lang}
          file={starter.file}
          t={t}
          expectedLabel={t.output}
          className="h-[70vh]"
          editorHeight="40%"
        />
      </div>
    </main>
  );
}
