"use client";

import Link from "next/link";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background (same vibe as verify page) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/25 via-indigo-500/20 to-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-56 -left-32 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-sky-500/15 blur-3xl" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-500/18 via-fuchsia-500/14 to-cyan-500/14 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:18px_18px] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/5 dark:to-black/30" />

        {/* subtle floating blobs */}
        <div className="absolute left-[8%] top-[18%] h-10 w-10 rounded-full bg-fuchsia-500/15 blur-xl animate-[floaty_7s_ease-in-out_infinite]" />
        <div className="absolute left-[20%] top-[70%] h-12 w-12 rounded-full bg-cyan-500/15 blur-xl animate-[floaty_9s_ease-in-out_infinite]" />
        <div className="absolute right-[14%] top-[28%] h-14 w-14 rounded-full bg-indigo-500/15 blur-xl animate-[floaty_8s_ease-in-out_infinite]" />
        <div className="absolute right-[26%] top-[72%] h-10 w-10 rounded-full bg-emerald-500/15 blur-xl animate-[floaty_10s_ease-in-out_infinite]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* Left: Hero */}
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-xs backdrop-blur dark:bg-black/30">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Verifiable RNG API
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Random numbers that are{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                easy to verify
              </span>
              .
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Generate random integers or floats and verify results instantly by
              lookup ID. Built for transparency, fairness checks, and clean
              audit trails.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/verify"
                className={cn(
                  "group inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-medium transition",
                  "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm",
                  "hover:opacity-95 active:scale-[0.99]"
                )}
              >
                Open Verify Page
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <a
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-2xl border bg-white/60 px-5 text-sm font-medium backdrop-blur transition hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/40"
              >
                Pricing
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge>Fast</Badge>
              <Badge>Simple</Badge>
              <Badge>Auditable</Badge>
              <Badge>Developer-friendly</Badge>
            </div>
          </section>

          {/* Right: Simple "alive" mock card */}
          <section className="relative">
            <div className="rounded-3xl border bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-black/35">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Example</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Generate → Get ID → Verify anytime
                  </div>
                </div>
                <span className="rounded-full border bg-white/60 px-3 py-1 text-xs backdrop-blur dark:bg-black/30">
                  /api/random
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border bg-white/60 p-4 backdrop-blur dark:bg-black/30">
                  <div className="text-[11px] text-muted-foreground">
                    Request body
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded-xl border bg-black/90 p-3 text-xs text-white">
{`{
  "min": 0,
  "max": 1
}`}
                  </pre>
                </div>

                <div className="rounded-2xl border bg-gradient-to-br from-indigo-600/10 via-fuchsia-600/10 to-cyan-600/10 p-4">
                  <div className="text-[11px] text-muted-foreground">
                    Response (example)
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <MiniStat label="result" value="1" />
                    <MiniStat label="type" value="integer" />
                    <MiniStat
                      label="lookup id"
                      value="cuid_••••••••••••"
                      wide
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Verify with <b className="text-foreground">/verify</b> using the
                  lookup id
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  online
                </span>
              </div>
            </div>

            {/* glow ring */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.25rem] bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-cyan-500/10 blur-2xl" />
          </section>
        </div>
      </main>

      {/* How it works */}
      <section id="how" className="relative mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-3xl border bg-white/65 p-6 backdrop-blur dark:bg-black/30">
          <h2 className="text-lg font-semibold">How verification works</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
            Every generated result is stored with its parameters (min/max/type)
            and a unique ID. Anyone can paste that ID into the verify page to
            fetch the exact record and confirm the output.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Step
              n="01"
              title="Generate"
              desc="Send min/max (and type if needed)."
            />
            <Step
              n="02"
              title="Receive ID"
              desc="Store the lookup ID with your game/result."
            />
            <Step
              n="03"
              title="Verify"
              desc="Paste the ID into /verify to confirm."
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Built for fairness checks, audit trails, and simple integration.
            </div>
            <Link
              href="/verify"
              className="inline-flex h-10 items-center justify-center rounded-2xl border bg-white/60 px-4 text-sm font-medium backdrop-blur transition hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/40"
            >
              Try verification →
            </Link>
          </div>
        </div>
      </section>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border bg-white/60 px-3 py-1 backdrop-blur dark:bg-black/30">
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/60 p-3 backdrop-blur dark:bg-black/30",
        wide && "col-span-2"
      )}
    >
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-white/60 p-4 backdrop-blur dark:bg-black/30">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Step</div>
        <div className="text-xs font-semibold">{n}</div>
      </div>
      <div className="mt-2 text-sm font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}