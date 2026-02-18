"use client";

import { useState } from "react";
import { toast } from "sonner";

type LookupResult = {
  id: string;
  type: "integer" | "float";
  min: number;
  max: number;
  result: number;
  createdAt: string;
  keyPrefix: string;
};

export default function LookupPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LookupResult | null>(null);

  async function lookup() {
    if (!id.trim()) {
      toast.error("Please enter an ID");
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`/api/random/lookup?id=${encodeURIComponent(id.trim())}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Lookup failed");
      }

      setData(json);
      toast.success("Found!");
    } catch (e: any) {
      toast.error(e.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">Lookup RNG Result</h1>

      <div className="mt-6 rounded-2xl border p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Request ID</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="cuid..."
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
          />
        </div>

        <button
          onClick={lookup}
          disabled={loading}
          className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {data && (
        <div className="mt-6 rounded-2xl border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Result</h2>
              <p className="text-xs text-muted-foreground mt-1 break-all">
                ID: {data.id}
              </p>
            </div>
            <span className="text-xs rounded-full border px-2 py-1">
              {data.type}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Min</div>
              <div className="font-medium">{data.min}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs text-muted-foreground">Max</div>
              <div className="font-medium">{data.max}</div>
            </div>
            <div className="rounded-lg border p-3 col-span-2">
              <div className="text-xs text-muted-foreground">Result</div>
              <div className="text-2xl font-semibold">{data.result}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span>Created: <b>{new Date(data.createdAt).toLocaleString()}</b></span>
          </div>
        </div>
      )}
    </div>
  );
}
