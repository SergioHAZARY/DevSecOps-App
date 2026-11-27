"use client";

import * as React from "react";
import { Network } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type T = Dictionary["widgets"]["cidr"];

const toIp = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
const maskOf = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);

function parse(input: string): { ip: number; prefix: number } | null {
  const match = /^\s*(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*\/\s*(\d{1,2})\s*$/.exec(input);
  if (!match) return null;
  const octets = match.slice(1, 5).map(Number);
  const prefix = Number(match[5]);
  if (octets.some((o) => o > 255) || prefix > 32) return null;
  return { ip: ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0, prefix };
}

function inRange(ip: number, base: string, prefix: number): boolean {
  const parsed = parse(`${base}/${prefix}`);
  return !!parsed && ((ip & maskOf(prefix)) >>> 0) === parsed.ip;
}

function classify(ip: number, t: T): string {
  if (inRange(ip, "10.0.0.0", 8) || inRange(ip, "172.16.0.0", 12) || inRange(ip, "192.168.0.0", 16)) return t.private;
  if (inRange(ip, "127.0.0.0", 8)) return t.loopback;
  if (inRange(ip, "169.254.0.0", 16)) return t.linkLocal;
  if (inRange(ip, "100.64.0.0", 10)) return t.cgnat;
  if (inRange(ip, "224.0.0.0", 4)) return t.multicast;
  if (inRange(ip, "240.0.0.0", 4) || inRange(ip, "0.0.0.0", 8)) return t.reserved;
  return t.public;
}

function describe(ip: number, prefix: number) {
  const mask = maskOf(prefix);
  const network = (ip & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const total = 2 ** (32 - prefix);
  // /31 (point-to-point, RFC 3021) and /32 (single host) have no network/broadcast addresses to subtract
  const hosts = prefix >= 31 ? total : total - 2;
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  return { mask, network, broadcast, total, hosts, first, last };
}

const MAX_ROWS = 64;

export function CidrCalculator({ t, locale }: { t: T; locale: string }) {
  const [input, setInput] = React.useState("192.168.1.10/24");
  const [split, setSplit] = React.useState<number | null>(null);
  const parsed = parse(input);
  const number = new Intl.NumberFormat(locale);
  const inputId = React.useId();
  const splitId = React.useId();

  const info = parsed ? describe(parsed.ip, parsed.prefix) : null;
  const newPrefix = parsed && split !== null && split > parsed.prefix && split <= 32 ? split : null;

  const subnets = React.useMemo(() => {
    if (!parsed || !info || newPrefix === null) return [];
    const size = 2 ** (32 - newPrefix);
    const count = 2 ** (newPrefix - parsed.prefix);
    return Array.from({ length: Math.min(count, MAX_ROWS) }, (_, i) => describe(info.network + i * size, newPrefix));
  }, [parsed, info, newPrefix]);

  const bits = parsed ? parsed.ip.toString(2).padStart(32, "0") : "";

  const rows: [string, string][] =
    parsed && info
      ? [
          [t.network, `${toIp(info.network)}/${parsed.prefix}`],
          [t.mask, toIp(info.mask)],
          [t.wildcard, toIp(~info.mask >>> 0)],
          [t.broadcast, toIp(info.broadcast)],
          [t.firstHost, toIp(info.first)],
          [t.lastHost, toIp(info.last)],
          [t.hosts, number.format(info.hosts)],
          [t.total, number.format(info.total)],
          [t.type, classify(parsed.ip, t)],
        ]
      : [];

  return (
    <section className="my-6 rounded-lg border-2 border-primary/40 bg-card p-4 sm:p-5" aria-label={t.title}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Network className="size-5 text-primary" aria-hidden="true" />
        {t.title}
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label htmlFor={inputId} className="text-sm font-medium">
            {t.input}
          </label>
          <Input
            id={inputId}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSplit(null);
            }}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!parsed}
            className="mt-1 font-mono"
            placeholder="10.0.0.0/16"
          />
        </div>
        {parsed && parsed.prefix < 32 && (
          <div>
            <label htmlFor={splitId} className="text-sm font-medium">
              {t.split} - {t.splitInto}
            </label>
            <select
              id={splitId}
              value={newPrefix ?? ""}
              onChange={(e) => setSplit(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
            >
              <option value="">-</option>
              {Array.from({ length: Math.min(32 - parsed.prefix, 12) }, (_, i) => parsed.prefix + 1 + i).map((p) => (
                <option key={p} value={p}>
                  /{p} ({number.format(2 ** (p - parsed.prefix))} {t.subnets})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!parsed || !info ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {t.invalid}
        </p>
      ) : (
        <>
          <dl className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 border-b py-1.5">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-right font-mono text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4">
            <p className="text-sm font-medium">{t.binary}</p>
            <div className="mt-1.5 overflow-x-auto">
              <p className="flex w-max gap-2 font-mono text-sm" aria-label={`${t.binary}: ${bits}`}>
                {[0, 8, 16, 24].map((start) => (
                  <span key={start} className="flex" aria-hidden="true">
                    {bits
                      .slice(start, start + 8)
                      .split("")
                      .map((bit, i) => (
                        <span
                          key={i}
                          className={cn(
                            "px-[1px]",
                            start + i < parsed.prefix ? "bg-primary/15 font-semibold text-primary" : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                          )}
                        >
                          {bit}
                        </span>
                      ))}
                  </span>
                ))}
              </p>
            </div>
            <p className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              <span>
                <span className="mr-1 inline-block size-2.5 rounded-sm bg-primary/60" aria-hidden="true" />
                {parsed.prefix} {t.networkBits}
              </span>
              <span>
                <span className="mr-1 inline-block size-2.5 rounded-sm bg-amber-500/70" aria-hidden="true" />
                {32 - parsed.prefix} {t.hostBits}
              </span>
            </p>
          </div>

          {newPrefix !== null && (
            <div className="mt-4">
              <div className="table-scroll max-h-80 overflow-y-auto">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t.subnet}</th>
                      <th>{t.range}</th>
                      <th>{t.broadcast}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {subnets.map((s, i) => (
                      <tr key={s.network}>
                        <td>{i + 1}</td>
                        <td className="whitespace-nowrap">
                          {toIp(s.network)}/{newPrefix}
                        </td>
                        <td className="whitespace-nowrap">
                          {toIp(s.first)} - {toIp(s.last)}
                        </td>
                        <td className="whitespace-nowrap">{toIp(s.broadcast)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {2 ** (newPrefix - parsed.prefix) > MAX_ROWS && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t.showing} {number.format(2 ** (newPrefix - parsed.prefix))}.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
