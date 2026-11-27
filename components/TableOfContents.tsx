"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
  /** 1 = section of the lesson, 2 = sub-entry (an example, a theory heading) */
  depth: 1 | 2;
}

/** Right-hand "On this page" navigation; highlights the section currently being read. */
export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  const [active, setActive] = React.useState<string | undefined>(items[0]?.id);

  React.useEffect(() => {
    const elements = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // the first heading (in document order) that sits in the upper part of the viewport
        const first = items.find((item) => visible.has(item.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-72px 0px -65% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className="text-sm">
      <p className="mb-2 font-semibold">{title}</p>
      <ul className="border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 border-transparent py-1 pr-2 leading-snug text-muted-foreground hover:text-foreground",
                item.depth === 1 ? "pl-3" : "pl-6 text-[0.82rem]",
                active === item.id && "border-primary font-medium text-primary",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
