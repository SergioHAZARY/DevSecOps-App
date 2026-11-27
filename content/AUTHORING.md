# Guide de rédaction des leçons / Lesson authoring guide

Every lesson is one YAML file: `content/<course-slug>/<lesson-slug>.yaml`.
The list of courses and lessons (slugs, titles, order) lives in `data/curriculum.ts` - a lesson file
must exist for every lesson declared there, with exactly that file name. Titles are **not** repeated in
the YAML.

`content/what-is-devsecops/definition.yaml` is the reference lesson: same structure, tone and depth expected.

## Validate

```bash
npx tsx scripts/build-content.ts --check <course-slug> [<course-slug>...]
```

It writes nothing and must end with `✔`. Fix every reported error.

## Structure

```yaml
description:            # ONE sentence (SEO + search results), >= 30 chars
  fr: "..."
  en: "..."
duration: 15            # minutes (5-120)

intro:                  # Markdown, >= 200 chars. Simple words, an everyday analogy, what the learner will do.
  fr: |
    ...
  en: |
    ...

sections:               # 1 to 4 theory sections, Markdown, each body >= 150 chars
  - heading: { fr: "...", en: "..." }
    body:
      fr: |
        ...
      en: |
        ...

examples:               # AT LEAST 3 (3 to 5). Complete, commented, realistic.
  - title: { fr: "...", en: "..." }
    file: main.tf       # displayed file name: app.py, Dockerfile, .github/workflows/ci.yml ...
    lang: hcl           # see "Languages" below
    kind: secure        # vulnerable | secure | neutral (optional, default neutral)
    code: |
      ...
    output: |           # optional: expected result (terminal output, HTTP response, plan...)
      ...
    note:               # Markdown, 1-3 sentences explaining what to look at
      fr: "..."
      en: "..."

mistake:                # "Erreur courante à éviter" - Markdown, >= 100 chars
  fr: |
  en: |

bestPractice:           # "Best Practice DevSecOps" - Markdown, >= 100 chars (usually a bullet list)
  fr: |
  en: |

exercise:
  statement:            # Markdown: a concrete task the learner can do
    fr: |
    en: |
  solution:
    file: solution.sh
    lang: bash
    code: |
      ...
    note: { fr: "...", en: "..." }   # optional

quiz:                   # EXACTLY 5 questions, EXACTLY 4 options each
  - q: { fr: "...", en: "..." }
    options:
      fr: ["...", "...", "...", "..."]
      en: ["...", "...", "...", "..."]
    answer: 2           # 0-based index of the correct option (same index in fr and en)
    why: { fr: "...", en: "..." }

widgets: [cidr-calculator]   # optional: cidr-calculator | base-converter | permission-calculator
```

No other key is accepted. Every text exists in **French and English** (`fr` and `en`), same meaning,
natural wording in each language (not word-for-word translation).

## Languages (`lang`)

`python, javascript, typescript, sql, json, yaml, html, bash, go, hcl, rego, powershell, dockerfile, php,
java, groovy, ini, toml, nginx, apache, xml, css, markdown, diff, makefile, c, csharp, ruby, http, text`

- Terraform -> `hcl`. Jenkinsfile -> `groovy`. sshd_config, sysctl, systemd units, fail2ban -> `ini`.
  Shell sessions / CLI commands -> `bash`. Anything else -> `text`.
- `python`, `javascript`, `typescript`, `sql` (SQLite), `json`, `yaml`, `html` are **executed in the browser**
  by the "Try it Yourself" playground. Whenever the topic allows it, make those examples self-contained
  (standard library only, no network, no files, prints its result) so the learner can press Run, and give
  the real `output`. SQL examples meant to run should create their own tables (SQLite dialect).
  When an example needs a real environment (Flask, boto3, Express, PostgreSQL...), that is fine: write it
  for the real tool.

## Pedagogy

- Audience: French-speaking and English-speaking learners going **step by step from beginner to pro to
  expert**. Inside a course, the first lesson assumes nothing; each lesson builds on the previous ones;
  the last lessons reach professional, production-grade practice.
- Intro: plain words, define every acronym the first time, one analogy from everyday life.
- Use a Markdown comparison table whenever two or more things are compared.
- Show **vulnerable vs secure** code (`kind: vulnerable` then `kind: secure`) whenever the topic has a
  dangerous way and a safe way of doing things.
- Examples are real and complete: something a learner can copy into a file and run. No `...`, no
  "your code here", no TODO, no lorem ipsum, no invented commands, flags or APIs. If you are not sure a
  flag or an option exists, use the form you are sure of.
- Code comments are in English, short, and explain the *why* (especially the security reason).
- Never include real-looking live credentials. Use obviously fake values (`AKIAIOSFODNN7EXAMPLE`,
  `example.com`, `10.0.0.0/8`, `192.0.2.0/24`, `changeme-in-vault`).
- Offensive techniques are shown only to explain the defense, against the learner's own lab
  (`localhost`, `scanme.nmap.org`, a local container). Remind the reader to scan only what they are
  authorised to test when a lesson involves scanning or exploitation.
- Tool versions: prefer current stable versions and syntax (2026). Mention when a tool is deprecated
  or superseded (e.g. tfsec -> Trivy).
- Quiz: questions test understanding of this lesson; one unambiguous correct answer; wrong options
  plausible; **vary the position of the correct answer** (the validator rejects a quiz whose answers
  use fewer than 3 different positions).

Typical size of a lesson file: 250 to 450 lines.

## Markdown allowed in text fields

Paragraphs, `**bold**`, `*italic*`, `` `inline code` ``, bullet and numbered lists, GFM tables,
`>` blockquotes, links, fenced code blocks, `###` sub-headings. No raw HTML, no images, no `#`/`##`.

## YAML rules (read carefully - most errors come from here)

- Indent with **2 spaces**, never tabs.
- Multi-line text and all code: block scalar `|`. Nothing needs escaping inside a block scalar:
  `${{ secrets.X }}`, `${VAR}`, backslashes, quotes and backticks are all literal.
- Single-line text: **double quotes** `"..."`. Inside double quotes, escape `"` as `\"` and `\` as `\\`.
  If a single-line text contains `"` or `\`, it is simpler to switch to a block scalar:

  ```yaml
  note:
    fr: |
      Le chemin `C:\Windows` et l'option "Strict" sont littéraux ici.
  ```
- Never leave a text value unquoted: `fr: Oui: 22 # ssh` is silently truncated/mis-parsed,
  and `yes`, `no`, `on`, `off`, `null`, `1.10` are not strings.
- Every line of a block scalar must be indented at least as much as its first line. If the code's
  **first line** itself starts with spaces, add an indentation indicator: `code: |2`.
- Go code and Makefile recipes may contain tab characters *after* the YAML indentation.
- Inline lists of options are fine: `fr: ["Option A", "Option B", "Option C", "Option D"]` - each
  option double-quoted.
