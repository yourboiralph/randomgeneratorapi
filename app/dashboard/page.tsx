"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ApiKeyRow = {
  id: string;
  name: string | null;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  dailyLimit: number;
  usedToday: number;
  lastUsedAt: string | null;
  createdAt: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(v: string | null) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "—";
  }
}

export default function ApiKeysPage() {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  // session
  useEffect(() => {
    (async () => {
      try {
        const s = await authClient.getSession();
        setSession(s);
        console.log("session:", s);
      } catch (e) {
        console.log("getSession failed", e);
      } finally {
        setSessionLoading(false);
      }
    })();
  }, []);

  // optional: block page if not logged in
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      toast.error("Please login first.");
    }
  }, [sessionLoading, session]);

  async function loadKeys() {
    setLoading(true);
    try {
      const res = await fetch("/api/apikeys", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load keys");
      setKeys(data.keys || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    setCreating(true);
    try {
      const res = await fetch("/api/apikeys", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create key");

      setNewKey(data.apiKey); // raw key shown once
      toast.success("API key created");
      await loadKeys();
    } catch (e: any) {
      toast.error(e.message || "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch(`/api/apikeys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to revoke key");

      toast.success("Key revoked");
      await loadKeys();
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke key");
    }
  }

  async function copy(text: string, okMsg = "Copied!") {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(okMsg);
    } catch {
      toast.error("Copy failed");
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  const stats = useMemo(() => {
    const active = keys.filter((k) => k.status === "ACTIVE").length;
    const revoked = keys.filter((k) => k.status === "REVOKED").length;
    const usedToday = keys.reduce((sum, k) => sum + (k.usedToday || 0), 0);
    const totalLimit = keys
      .filter((k) => k.status === "ACTIVE")
      .reduce((sum, k) => sum + (k.dailyLimit || 0), 0);

    return { active, revoked, usedToday, totalLimit };
  }, [keys]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-[-80px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              RNG API • Key Management
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              API Keys
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Create keys for your RNG API. You can only view a key once after
              creating it.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadKeys()}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/10 active:scale-[0.99]"
            >
              Refresh
            </button>

            <button
              onClick={createKey}
              disabled={creating}
              className={cx(
                "rounded-xl px-4 py-2 text-sm font-semibold",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-[0.99]",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {creating ? "Creating..." : "Create API Key"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-muted-foreground">Active keys</p>
            <p className="mt-2 text-2xl font-semibold">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-muted-foreground">Revoked keys</p>
            <p className="mt-2 text-2xl font-semibold">{stats.revoked}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-muted-foreground">Used today</p>
            <p className="mt-2 text-2xl font-semibold">{stats.usedToday}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-muted-foreground">Total daily limit</p>
            <p className="mt-2 text-2xl font-semibold">{stats.totalLimit}</p>
          </div>
        </div>

        {/* New Key Modal */}
        {newKey && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setNewKey(null)}
            />
            <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-background/80 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Your new API key</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Copy this now. You won’t be able to see it again.
                  </p>
                </div>
                <button
                  onClick={() => setNewKey(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Key (shown once)
                  </p>
                  <button
                    onClick={() => copy(newKey)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-2 break-all font-mono text-sm text-white/90">
                  {newKey}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    copy(newKey);
                    setNewKey(null);
                  }}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-[0.99]"
                >
                  Copy & Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys Table (Upgraded) */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">Your keys</p>
              <p className="text-xs text-muted-foreground">
                Manage rate limits and revoke keys anytime.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? "Loading…" : `${keys.length} total`}
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : keys.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No keys yet. Click “Create API Key”.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {keys.map((k) => {
                const active = k.status === "ACTIVE";
                const usagePct =
                  k.dailyLimit > 0
                    ? Math.min(100, Math.round((k.usedToday / k.dailyLimit) * 100))
                    : 0;

                return (
                  <div
                    key={k.id}
                    className="px-5 py-4 transition hover:bg-white/5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-xl border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-sm">
                            {k.prefix}…
                          </span>

                          <span
                            className={cx(
                              "text-xs rounded-full px-2 py-0.5 border",
                              active
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                : "border-white/10 bg-white/5 text-muted-foreground"
                            )}
                          >
                            {k.status}
                          </span>

                          {k.name && (
                            <span className="text-xs text-muted-foreground">
                              • {k.name}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          <div className="text-xs text-muted-foreground">
                            Daily limit:{" "}
                            <span className="text-white/90 font-semibold">
                              {k.dailyLimit}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Used today:{" "}
                            <span className="text-white/90 font-semibold">
                              {k.usedToday}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last used:{" "}
                            <span className="text-white/90 font-semibold">
                              {formatDate(k.lastUsedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Usage</span>
                            <span>{usagePct}%</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={cx(
                                "h-full rounded-full",
                                active
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                                  : "bg-white/20"
                              )}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => revokeKey(k.id)}
                          disabled={!active}
                          className={cx(
                            "rounded-xl px-4 py-2 text-sm font-semibold",
                            "border border-white/10 bg-white/5 hover:bg-white/10",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How to use */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">How to use</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Send your key in the request body.
              </p>
            </div>

            <button
              onClick={() =>
                copy(
                  `POST /api/random
{
  "api_key": "rng_live_....",
  "min": 0,
  "max": 1
}`
                )
              }
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10"
            >
              Copy example
            </button>
          </div>

          <pre className="mt-3 overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/90">
{`POST /api/random
{
  "api_key": "rng_live_....",
  "min": 0,
  "max": 1
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}