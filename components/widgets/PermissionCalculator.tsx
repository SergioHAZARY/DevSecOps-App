"use client";

import * as React from "react";
import { AlertTriangle, KeyRound, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type T = Dictionary["widgets"]["perm"];

const WHO = ["owner", "group", "others"] as const;
const RIGHTS = [
  { key: "read", value: 4, letter: "r" },
  { key: "write", value: 2, letter: "w" },
  { key: "execute", value: 1, letter: "x" },
] as const;

export function PermissionCalculator({ t }: { t: T }) {
  // one octal digit per class: owner, group, others
  const [digits, setDigits] = React.useState<[number, number, number]>([6, 4, 0]);
  const id = React.useId();

  const toggle = (who: number, value: number) =>
    setDigits((previous) => {
      const next: [number, number, number] = [...previous];
      next[who] ^= value;
      return next;
    });

  const octal = digits.join("");
  const symbolic = digits.map((d) => RIGHTS.map((r) => (d & r.value ? r.letter : "-")).join("")).join("");
  const worldWritable = (digits[2] & 2) !== 0;

  return (
    <section className="my-6 rounded-lg border-2 border-primary/40 bg-card p-4 sm:p-5" aria-label={t.title}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <KeyRound className="size-5 text-primary" aria-hidden="true" />
        {t.title}
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {WHO.map((who, whoIndex) => (
          <fieldset key={who} className="rounded-md border p-3">
            <legend className="px-1 text-sm font-semibold">
              {t[who]} <span className="font-mono text-primary">{digits[whoIndex]}</span>
            </legend>
            {RIGHTS.map((right) => (
              <label key={right.key} htmlFor={`${id}-${who}-${right.key}`} className="flex min-h-9 cursor-pointer items-center gap-2.5">
                <input
                  id={`${id}-${who}-${right.key}`}
                  type="checkbox"
                  className="size-4 accent-[hsl(var(--primary))]"
                  checked={(digits[whoIndex] & right.value) !== 0}
                  onChange={() => toggle(whoIndex, right.value)}
                />
                <span>
                  {t[right.key]} <span className="font-mono text-sm text-muted-foreground">({right.letter} = {right.value})</span>
                </span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-muted p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.octal}</dt>
          <dd className="font-mono text-2xl font-bold">{octal}</dd>
        </div>
        <div className="rounded-md bg-muted p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.symbolic}</dt>
          <dd className="font-mono text-2xl font-bold">-{symbolic}</dd>
        </div>
        <div className="rounded-md bg-code p-3 text-code-foreground">
          <dt className="text-xs font-medium uppercase tracking-wide text-white/60">{t.command}</dt>
          <dd className="font-mono text-lg">chmod {octal} file</dd>
        </div>
      </dl>

      <p
        role="status"
        className={cn(
          "mt-3 flex items-center gap-2 text-sm font-medium",
          worldWritable ? "text-destructive" : "text-primary",
        )}
      >
        {worldWritable ? <AlertTriangle className="size-4 shrink-0" aria-hidden="true" /> : <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />}
        {octal === "777" ? t.warning777 : worldWritable ? t.warningWorldWritable : t.ok}
      </p>
    </section>
  );
}
