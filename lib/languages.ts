/**
 * Languages accepted in lesson code blocks.
 *  - shiki:  grammar used for static syntax highlighting (server side)
 *  - monaco: language id used by the Monaco editor ("Try it Yourself")
 *  - runner: how the playground executes the code in the browser, if it can
 *  - run:    command shown to run the file locally when there is no in-browser runner
 */
export type Runner = "javascript" | "typescript" | "python" | "sql" | "json" | "yaml" | "html";

export interface LanguageInfo {
  label: string;
  shiki: string;
  monaco: string;
  runner?: Runner;
  run?: string;
}

export const languages: Record<string, LanguageInfo> = {
  python: { label: "Python", shiki: "python", monaco: "python", runner: "python", run: "python3 {file}" },
  javascript: { label: "JavaScript", shiki: "javascript", monaco: "javascript", runner: "javascript", run: "node {file}" },
  typescript: { label: "TypeScript", shiki: "typescript", monaco: "typescript", runner: "typescript", run: "npx tsx {file}" },
  sql: { label: "SQL", shiki: "sql", monaco: "sql", runner: "sql", run: "sqlite3 lab.db < {file}" },
  json: { label: "JSON", shiki: "json", monaco: "json", runner: "json", run: "jq . {file}" },
  yaml: { label: "YAML", shiki: "yaml", monaco: "yaml", runner: "yaml", run: "yamllint {file}" },
  html: { label: "HTML", shiki: "html", monaco: "html", runner: "html" },
  bash: { label: "Bash", shiki: "bash", monaco: "shell", run: "bash {file}" },
  go: { label: "Go", shiki: "go", monaco: "go", run: "go run {file}" },
  hcl: { label: "HCL / Terraform", shiki: "hcl", monaco: "hcl", run: "terraform init && terraform plan" },
  rego: { label: "Rego", shiki: "rego", monaco: "plaintext", run: "opa eval -d {file} -i input.json 'data'" },
  powershell: { label: "PowerShell", shiki: "powershell", monaco: "powershell", run: "pwsh -File {file}" },
  dockerfile: { label: "Dockerfile", shiki: "dockerfile", monaco: "dockerfile", run: "docker build -t demo ." },
  php: { label: "PHP", shiki: "php", monaco: "php", run: "php {file}" },
  java: { label: "Java", shiki: "java", monaco: "java", run: "java {file}" },
  groovy: { label: "Groovy", shiki: "groovy", monaco: "plaintext" },
  ini: { label: "INI / conf", shiki: "ini", monaco: "ini" },
  toml: { label: "TOML", shiki: "toml", monaco: "ini" },
  nginx: { label: "NGINX", shiki: "nginx", monaco: "plaintext", run: "nginx -t" },
  apache: { label: "Apache", shiki: "apache", monaco: "plaintext", run: "apachectl configtest" },
  xml: { label: "XML", shiki: "xml", monaco: "xml" },
  css: { label: "CSS", shiki: "css", monaco: "css" },
  markdown: { label: "Markdown", shiki: "markdown", monaco: "markdown" },
  diff: { label: "Diff", shiki: "diff", monaco: "plaintext" },
  makefile: { label: "Makefile", shiki: "makefile", monaco: "plaintext", run: "make" },
  c: { label: "C", shiki: "c", monaco: "c", run: "gcc {file} -o app && ./app" },
  csharp: { label: "C#", shiki: "csharp", monaco: "csharp", run: "dotnet run" },
  ruby: { label: "Ruby", shiki: "ruby", monaco: "ruby", run: "ruby {file}" },
  http: { label: "HTTP", shiki: "http", monaco: "plaintext" },
  text: { label: "Text", shiki: "text", monaco: "plaintext" },
};

export const languageIds = Object.keys(languages);

export function getLanguage(id: string): LanguageInfo {
  return languages[id] ?? languages.text;
}
