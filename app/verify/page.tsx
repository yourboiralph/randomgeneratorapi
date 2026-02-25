"use client";

import { useMemo, useRef, useState } from "react";

type LookupResult = {
  id: string;
  type: "integer" | "float";
  min: number;
  max: number;
  result: number;
  createdAt: string;
  keyPrefix: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Notice = {
  type: "success" | "error" | "info";
  message: string;
} | null;

export default function LookupPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LookupResult | null>(null);

  // ✅ inline status UI (replaces toast)
  const [notice, setNotice] = useState<Notice>(null);
  const noticeTimer = useRef<number | null>(null);

  function showNotice(next: Notice, ms = 3000) {
    setNotice(next);

    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    if (next) {
      noticeTimer.current = window.setTimeout(() => {
        setNotice(null);
        noticeTimer.current = null;
      }, ms);
    }
  }

  const prettyCreatedAt = useMemo(() => {
    if (!data?.createdAt) return "";
    try {
      return new Date(data.createdAt).toLocaleString();
    } catch {
      return data.createdAt;
    }
  }, [data?.createdAt]);

  async function lookup() {
    const clean = id.trim();

    if (!clean) {
      showNotice({ type: "error", message: "Please enter an ID." }, 3500);
      return;
    }

    setLoading(true);
    setData(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/random/lookup?id=${encodeURIComponent(clean)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Lookup failed");
      }

      setData(json);
      showNotice({ type: "success", message: "Found!" }, 2200);
    } catch (e: any) {
      showNotice({ type: "error", message: e?.message || "Lookup failed" }, 4500);
    } finally {
      setLoading(false);
    }
  }

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") lookup();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/25 via-indigo-500/20 to-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-sky-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/5 dark:to-black/30" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-xs backdrop-blur dark:bg-black/30">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              RNG Lookup
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">Lookup RNG Result</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Paste a request ID to fetch the exact min/max + generated result.
            </p>
          </div>

          {/* Search Card */}
          <div className="rounded-3xl border bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-black/35">
            {/* ✅ Inline notice (modern, no toast) */}
            {notice && (
              <div
                className={cn(
                  "mb-4 rounded-2xl border px-4 py-3 text-sm backdrop-blur",
                  "animate-in fade-in slide-in-from-top-1 duration-200",
                  notice.type === "success" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  notice.type === "error" &&
                    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                  notice.type === "info" &&
                    "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 break-words">{notice.message}</span>
                  <button
                    onClick={() => setNotice(null)}
                    className="shrink-0 rounded-xl border bg-white/60 px-2 py-1 text-xs font-medium backdrop-blur transition hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/40"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Request ID</label>

                <div className="group relative">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur transition-opacity group-focus-within:opacity-100 bg-gradient-to-r from-fuchsia-500/20 via-indigo-500/20 to-cyan-500/20" />
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    onKeyDown={onEnter}
                    placeholder="cuid..."
                    className={cn(
                      "relative w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm outline-none transition",
                      "focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15",
                      "dark:bg-black/30",
                      "placeholder:text-muted-foreground"
                    )}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  Tip: press <b>Enter</b> to search.
                </div>
              </div>

              <button
                onClick={lookup}
                disabled={loading}
                className={cn(
                  "h-11 w-full cursor-pointer rounded-2xl px-4 text-sm font-medium transition sm:w-40",
                  "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm",
                  "hover:opacity-95 active:scale-[0.99]",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="mt-5 space-y-3">
                <div className="h-4 w-1/3 animate-pulse rounded bg-black/5 dark:bg-white/10" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                  <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                  <div className="col-span-2 h-20 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                </div>
              </div>
            )}
          </div>

          {/* Result Card */}
          {data && (
            <div className="mt-6 rounded-3xl border bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-black/35">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Result</h2>
                    <span className="inline-flex items-center rounded-full border bg-white/60 px-2 py-0.5 text-[11px] backdrop-blur dark:bg-black/30">
                      {data.keyPrefix}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground break-all">ID: {data.id}</p>
                </div>

                <span className="w-fit rounded-full border bg-white/60 px-3 py-1 text-xs backdrop-blur dark:bg-black/30">
                  {data.type}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <StatCard label="Min" value={data.min} />
                <StatCard label="Max" value={data.max} />

                <div className="col-span-2 rounded-2xl border bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-cyan-600/10 p-4">
                  <div className="text-xs text-muted-foreground">Result</div>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <div className="text-3xl font-bold tracking-tight">{data.result}</div>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard?.writeText(String(data.result));
                          showNotice({ type: "success", message: "Copied result!" }, 1800);
                        } catch {
                          showNotice({ type: "error", message: "Copy failed. Please copy manually." }, 3500);
                        }
                      }}
                      className="rounded-xl border bg-white/60 px-3 py-2 text-xs font-medium backdrop-blur transition hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/40"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Created: <b className="text-foreground">{prettyCreatedAt}</b>
                </span>
              </div>
            </div>
          )}

          {/* Footer hint */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Keep this page open for quick verifications during games.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white/60 p-4 backdrop-blur dark:bg-black/30">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}