"use client";

import { useEffect, useState } from "react";
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

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

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

  async function copyNewKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    toast.success("Copied!");
  }

  useEffect(() => {
    loadKeys();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create keys for your RNG API. You can only view a key once after creating it.
          </p>
        </div>

        <button
          onClick={createKey}
          disabled={creating}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create API Key"}
        </button>
      </div>

      {/* New Key Modal */}
      {newKey && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5">
            <h2 className="text-lg font-semibold">Your new API key</h2>
            <p className="text-sm text-gray-600 mt-1">
              Copy this now. You won’t be able to see it again.
            </p>

            <div className="mt-4 rounded-lg border bg-gray-50 p-3 break-all font-mono text-sm">
              {newKey}
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={copyNewKey}
                className="rounded-lg border px-4 py-2"
              >
                Copy
              </button>
              <button
                onClick={() => setNewKey(null)}
                className="rounded-lg bg-black text-white px-4 py-2"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="mt-6 rounded-2xl border overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 text-sm font-medium">
          Your keys
        </div>

        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">
            No keys yet. Click “Create API Key”.
          </div>
        ) : (
          <div className="divide-y">
            {keys.map((k) => (
              <div key={k.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{k.prefix}…</span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 border ${
                        k.status === "ACTIVE"
                          ? "border-green-300 text-green-700 bg-green-50"
                          : "border-gray-300 text-gray-600 bg-gray-50"
                      }`}
                    >
                      {k.status}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Daily limit: <b>{k.dailyLimit}</b></span>
                    <span>Used today: <b>{k.usedToday}</b></span>
                    <span>Last used: <b>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "—"}</b></span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => revokeKey(k.id)}
                    disabled={k.status !== "ACTIVE"}
                    className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simple usage example */}
      <div className="mt-6 rounded-2xl border p-4">
        <h3 className="font-semibold">How to use</h3>
        <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-auto">
{`POST /api/random
{
  "api_key": "rng_live_....",
  "min": 0,
  "max": 1
}`}
        </pre>
      </div>
    </div>
  );
}
