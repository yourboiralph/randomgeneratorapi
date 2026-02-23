"use client";

import { redirect } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Billing = "monthly" | "yearly";

type Tier = {
  id: string;
  name: string;
  tagline: string;
  highlight?: boolean;

  monthlyPrice: number; // in USD
  yearlyPrice: number;  // in USD (per month billed yearly, or total—see label below)
  callsPerMonth: number;
  keyLimit: number;

  features: string[];
  cta: string;
};

function money(n: number) {
  return n === 0 ? "Free" : `$${n}`;
}

function compactNumber(n: number) {
  return n.toLocaleString();
}

export default function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  // Adjust these however you want
  const tiers: Tier[] = useMemo(
    () => [
      {
        id: "free",
        name: "Free",
        tagline: "For testing & side projects",
        monthlyPrice: 0,
        yearlyPrice: 0,
        callsPerMonth: 200,
        keyLimit: 1,
        features: [
          "1 API key",
          "200 calls / month",
          "Result lookup & verify UI",
          "Basic rate limiting",
          "Community support",
        ],
        cta: "Start Free",
      },
      {
        id: "pro",
        name: "Pro",
        tagline: "For real apps shipping to users",
        highlight: true,
        monthlyPrice: 50,
        yearlyPrice: 15, // per month billed yearly (example)
        callsPerMonth: 100_000,
        keyLimit: 5,
        features: [
          "Up to 5 API keys",
          "100,000 calls / month",
          "Higher burst limits",
          "Usage dashboard (calls/day)",
          "Email support",
        ],
        cta: "Upgrade to Pro",
      },
      {
        id: "business",
        name: "Business",
        tagline: "For teams & heavy usage",
        monthlyPrice: 999,
        yearlyPrice: 65, // per month billed yearly (example)
        callsPerMonth: 500_000,
        keyLimit: 20,
        features: [
          "Up to 20 API keys",
          "500,000 calls / month",
          "Priority rate limits",
          "Audit logs",
          "SLA & priority support",
          "Custom usage caps per key",
        ],
        cta: "Contact Sales",
      },
    ],
    []
  );

  return (
    <section className="relative overflow-hidden py-16">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-44 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-violet-500/20 to-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-10 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-sky-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-gradient-to-tr from-orange-500/15 via-rose-500/10 to-purple-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4">
        {/* header */}
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            API Keys • Usage Limits • Verify UI
          </div>

          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing for your RNG API
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
            Pick a plan based on call volume. Every plan includes result lookup + verification so your users can
            independently check fairness.
          </p>

          {/* billing toggle */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
            <ToggleButton active={billing === "monthly"} onClick={() => setBilling("monthly")}>
              Monthly
            </ToggleButton>
            <ToggleButton active={billing === "yearly"} onClick={() => setBilling("monthly")}>
              Yearly <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-200">-20%</span>
            </ToggleButton>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Yearly pricing shown as <span className="font-medium text-foreground/80">per-month equivalent</span>, billed annually.
          </p>
        </div>

        {/* grid */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => {
            const price = billing === "monthly" ? t.monthlyPrice : t.yearlyPrice;
            return (
              <div
                key={t.id}
                className={[
                  "group relative rounded-2xl border bg-white/[0.04] p-6 shadow-sm backdrop-blur",
                  "border-white/10 hover:border-white/20",
                  "transition-transform duration-300 hover:-translate-y-1",
                  t.highlight ? "ring-1 ring-violet-400/30" : "",
                ].join(" ")}
              >
                {/* highlight badge */}
                {t.highlight && (
                  <div className="absolute -top-3 left-6 rounded-full border border-violet-300/30 bg-violet-500/15 px-3 py-1 text-xs text-violet-900 backdrop-blur">
                    Most Popular
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                  </div>

                  {/* little spark */}
                  <div className="h-10 w-10 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0" />
                </div>

                {/* price */}
                <div className="mt-5 flex items-end gap-2">
                  <div className="text-4xl font-semibold tracking-tight">
                    {money(price)}
                  </div>
                  {price !== 0 && (
                    <div className="pb-1 text-sm text-muted-foreground">/ mo</div>
                  )}
                </div>

                {/* limits */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Stat label="Calls / month" value={compactNumber(t.callsPerMonth)} />
                  <Stat label="API keys" value={String(t.keyLimit)} />
                </div>

                {/* divider */}
                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* features */}
                <ul className="space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-foreground/90">
                      <span className="mt-1 inline-block h-4 w-4 rounded-md bg-emerald-500/15 ring-1 ring-emerald-500/20" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* cta */}
                <button
                  className={[
                    "mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium",
                    "transition",
                    t.highlight
                      ? "bg-violet-500 text-white hover:bg-violet-400"
                      : "bg-white/10 text-foreground hover:bg-white/15",
                  ].join(" ")}
                  onClick={() => {
                    // wire this to your checkout / key generation flow
                    // redirect('/register')
                    
                  }}
                >
                  {t.cta}
                </button>

                {/* subtle glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 blur-xl" />
                </div>
              </div>
            );
          })}
        </div>

        {/* footer note */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-muted-foreground backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-foreground/80">Need more volume?</span>{" "}
              Add overage billing (e.g. $0.20 per 1,000 calls) or create an Enterprise tier with custom caps + SLA.
            </div>
            <div className="text-xs">
              Tip: show usage from your DB (calls this month) + “reset date” on the dashboard.
            </div>
          </div>
        </div>
      </div>

      {/* simple floating animation */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          section :global(.animate-pulse) {
            animation-duration: 1.4s;
          }
        }
      `}</style>
    </section>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm",
        "transition",
        active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
      type="button"
    >
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}