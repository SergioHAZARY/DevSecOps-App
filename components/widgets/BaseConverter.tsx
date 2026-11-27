"use client";

import * as React from "react";
import { Binary } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type T = Dictionary["widgets"]["base"];

const BASES = [
  { key: "decimal", radix: 10, pattern: /^[0-9]+$/, prefix: "" },
  { key: "binary", radix: 2, pattern: /^[01]+$/, prefix: "0b" },
  { key: "hex", radix: 16, pattern: /^[0-9a-fA-F]+$/, prefix: "0x" },
  { key: "octal", radix: 8, pattern: /^[0-7]+$/, prefix: "0o" },
] as const;

type BaseKey = (typeof BASES)[number]["key"];

/** 64 bits is plenty for a lesson and keeps the fields readable */
const MAX = (1n << 64n) - 1n;

function parseIn(text: string, radix: number): bigint | null {
  const clean = text.replace(/[\s_]/g, "");
  if (clean === "") return null;
  try {
    const value = radix === 10 ? BigInt(clean) : BigInt(`${radix === 2 ? "0b" : radix === 16 ? "0x" : "0o"}${clean}`);
    return value <= MAX ? value : null;
  } catch {
    return null;
  }
}

function format(value: bigint, radix: number): string {
  const text = value.toString(radix).toUpperCase();
  // group binary digits by 4 so that long numbers stay readable
  return radix === 2 ? text.padStart(Math.ceil(text.length / 4) * 4, "0").replace(/(.{4})(?=.)/g, "$1 ") : text;
}

export function BaseConverter({ t }: { t: T }) {
  const [value, setValue] = React.useState<bigint>(202n);
  // while a field is being edited we keep what the learner typed, even if it is not valid yet
  const [draft, setDraft] = React.useState<{ key: BaseKey; text: string } | null>(null);
  const id = React.useId();

  const onChange = (key: BaseKey, radix: number, pattern: RegExp, text: string) => {
    setDraft({ key, text });
    const clean = text.replace(/[\s_]/g, "");
    if (!pattern.test(clean)) return;
    const parsed = parseIn(clean, radix);
    if (parsed !== null) setValue(parsed);
  };

  const lowByte = Number(value & 0xffn);

  return (
    <section className="my-6 rounded-lg border-2 border-primary/40 bg-card p-4 sm:p-5" aria-label={t.title}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Binary className="size-5 text-primary" aria-hidden="true" />
        {t.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{t.hint}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {BASES.map(({ key, radix, pattern, prefix }) => {
          const editing = draft?.key === key;
          const text = editing ? draft.text : format(value, radix);
          const clean = text.replace(/[\s_]/g, "");
          const invalid = editing && clean !== "" && (!pattern.test(clean) || parseIn(clean, radix) === null);
          return (
            <div key={key}>
              <label htmlFor={`${id}-${key}`} className="text-sm font-medium">
                {t[key]} <span className="font-normal text-muted-foreground">(base {radix})</span>
              </label>
              <div className="mt-1 flex items-center">
                {prefix && (
                  <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-2 font-mono text-sm text-muted-foreground" aria-hidden="true">
                    {prefix}
                  </span>
                )}
                <Input
                  id={`${id}-${key}`}
                  value={text}
                  onChange={(e) => onChange(key, radix, pattern, e.target.value)}
                  onBlur={() => setDraft(null)}
                  inputMode={radix === 10 || radix === 8 || radix === 2 ? "numeric" : "text"}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? `${id}-${key}-error` : undefined}
                  className={cn("font-mono", prefix && "rounded-l-none", invalid && "border-destructive")}
                />
              </div>
              {invalid && (
                <p id={`${id}-${key}-error`} className="mt-1 text-xs text-destructive" role="alert">
                  {t.invalid}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium">{t.bits}</p>
        <div className="mt-2 overflow-x-auto">
          <div className="flex w-max gap-1.5">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
              const on = ((lowByte >> bit) & 1) === 1;
              return (
                <button
                  key={bit}
                  type="button"
                  aria-pressed={on}
                  aria-label={`bit ${bit} (${2 ** bit})`}
                  onClick={() => {
                    setDraft(null);
                    setValue(value ^ (1n << BigInt(bit)));
                  }}
                  className={cn(
                    "flex w-12 flex-col items-center rounded-md border py-1.5 font-mono transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent",
                  )}
                >
                  <span className="text-[0.7rem] opacity-80">{2 ** bit}</span>
                  <span className="text-lg font-bold leading-tight">{on ? 1 : 0}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {[7, 6, 5, 4, 3, 2, 1, 0].filter((bit) => (lowByte >> bit) & 1).map((bit) => 2 ** bit).join(" + ") || "0"} = {lowByte}
        </p>
      </div>
    </section>
  );
}
