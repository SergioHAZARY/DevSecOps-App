"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { BookOpen, FileText, Search as SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { localePath, type Dictionary } from "@/lib/i18n";
import { searchEntries } from "@/lib/search";
import { asset } from "@/lib/site";
import type { Locale, SearchEntry } from "@/lib/types";

interface SearchProps {
  locale: Locale;
  t: Dictionary["search"];
  nav: Dictionary["nav"];
  /** Shown before the learner types anything */
  suggestions: { title: string; url: string; hint: string }[];
}

type IndexState = { status: "idle" | "loading" | "error" } | { status: "ready"; entries: SearchEntry[] };

/** Global search (Ctrl+K / Cmd+K, or "/"). The index is a static JSON file fetched on first use. */
export function Search({ locale, t, nav, suggestions }: SearchProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState<IndexState>({ status: "idle" });
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open || index.status === "ready" || index.status === "loading") return;
    let cancelled = false;
    setIndex({ status: "loading" });
    fetch(asset(`/search/${locale}.json`))
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchEntry[]>;
      })
      .then((entries) => !cancelled && setIndex({ status: "ready", entries }))
      .catch(() => !cancelled && setIndex({ status: "error" }));
    return () => {
      cancelled = true;
    };
    // `index.status` is read, not tracked: the fetch must start once per opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locale]);

  const hits = React.useMemo(
    () => (index.status === "ready" ? searchEntries(index.entries, query, 30) : []),
    [index, query],
  );

  const go = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(localePath(locale, url));
  };

  const trimmed = query.trim();

  return (
    <>
      {/* trigger: looks like a search field on desktop, an icon on mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground max-md:size-10 max-md:justify-center max-md:border-0 max-md:px-0 md:w-56 lg:w-72"
        aria-label={nav.search}
        aria-keyshortcuts="Control+K Meta+K"
      >
        <SearchIcon className="size-4 shrink-0 max-md:size-5 max-md:text-foreground" aria-hidden="true" />
        <span className="flex-1 truncate text-left max-md:hidden">{nav.search}…</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] font-medium md:inline-block">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={nav.close} hideClose className="top-[4.5rem] max-w-2xl translate-y-0 sm:top-24">
          <DialogTitle className="sr-only">{t.title}</DialogTitle>
          <DialogDescription className="sr-only">{nav.searchPlaceholder}</DialogDescription>
          <Command shouldFilter={false} label={t.title} className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 border-b px-3">
              <SearchIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={nav.searchPlaceholder}
                className="h-14 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded border bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground hover:text-foreground"
                aria-label={nav.close}
              >
                Esc
              </button>
            </div>

            <Command.List className="max-h-[min(60dvh,28rem)] overflow-y-auto p-2">
              {index.status === "loading" && <Command.Loading>{t.loading}</Command.Loading>}
              {index.status === "error" && <p className="p-4 text-sm text-destructive">{t.error}</p>}

              {trimmed.length < 2 ? (
                <Command.Group
                  heading={t.suggestions}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {suggestions.map((item) => (
                    <Command.Item
                      key={item.url}
                      value={item.url}
                      onSelect={() => go(item.url)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    >
                      <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
                      <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{item.hint}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : (
                <>
                  {index.status === "ready" && hits.length === 0 && (
                    <Command.Empty className="p-6 text-center text-sm text-muted-foreground">
                      {t.noResults} « {trimmed} »
                    </Command.Empty>
                  )}
                  {hits.map((hit) => {
                    const isCourse = hit.entry.url.split("/").length === 3;
                    return (
                      <Command.Item
                        key={hit.entry.url}
                        value={hit.entry.url}
                        onSelect={() => go(hit.entry.url)}
                        className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                      >
                        {isCourse ? (
                          <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        ) : (
                          <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{hit.entry.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {hit.entry.module}
                            {!isCourse && ` › ${hit.entry.course}`}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{hit.excerpt}</span>
                        </span>
                      </Command.Item>
                    );
                  })}
                </>
              )}
            </Command.List>

            <div className="flex items-center gap-4 border-t px-3 py-2 text-xs text-muted-foreground">
              <span aria-live="polite">{trimmed.length >= 2 && index.status === "ready" ? `${hits.length} ${t.results}` : t.hint}</span>
              <span className="ml-auto hidden gap-3 sm:flex" aria-hidden="true">
                <span>↑↓ {t.navigate}</span>
                <span>↵ {t.select}</span>
                <span>Esc {t.closeHint}</span>
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
