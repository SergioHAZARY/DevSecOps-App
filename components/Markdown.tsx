import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/CodeBlock";
import { languageIds } from "@/lib/languages";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  locale: Locale;
  className?: string;
}

const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  console: "bash",
  py: "python",
  js: "javascript",
  ts: "typescript",
  yml: "yaml",
  terraform: "hcl",
  tf: "hcl",
  docker: "dockerfile",
  ps1: "powershell",
  conf: "ini",
  md: "markdown",
  plaintext: "text",
  txt: "text",
};

function resolveLang(className: string | undefined): string {
  const raw = /language-([\w-]+)/.exec(className ?? "")?.[1]?.toLowerCase() ?? "text";
  const lang = ALIASES[raw] ?? raw;
  return languageIds.includes(lang) ? lang : "text";
}

/**
 * Lesson Markdown -> React, rendered on the server.
 * Raw HTML in the source is not interpreted (react-markdown escapes it), fenced code
 * blocks become full <CodeBlock>s and tables scroll horizontally on small screens.
 */
export function Markdown({ children, locale, className }: MarkdownProps) {
  const components: Components = {
    pre({ children: preChildren }) {
      const child = React.Children.toArray(preChildren)[0];
      if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
        const code = String(child.props.children ?? "");
        return <CodeBlock code={code} lang={resolveLang(child.props.className)} locale={locale} />;
      }
      return <pre>{preChildren}</pre>;
    },
    table({ children: tableChildren }) {
      return (
        <div className="table-scroll" tabIndex={0} role="group">
          <table>{tableChildren}</table>
        </div>
      );
    },
    // lesson bodies start at h3: anything higher would break the page outline
    h1: ({ children: c }) => <h3>{c}</h3>,
    h2: ({ children: c }) => <h3>{c}</h3>,
    a({ href, children: c }) {
      const external = /^https?:\/\//.test(href ?? "");
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {c}
        </a>
      );
    },
  };

  return (
    <div className={cn("prose-lesson", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
