import crypto from "node:crypto";

export function generateApiKey() {
  const raw = "rng_live_" + crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}
