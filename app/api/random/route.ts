import { NextResponse } from "next/server";
import crypto from "node:crypto";
import prisma from "@/lib/db";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function startOfDayUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function randomFloat(min: number, max: number) {
  const buf = crypto.randomBytes(6);
  const int = buf.readUIntBE(0, 6); // 0..2^48-1
  const x = int / 2 ** 48; // 0..1
  return min + x * (max - min);
}

function randomInteger(min: number, max: number) {
  // inclusive range [min, max]
  return crypto.randomInt(min, max + 1);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const apiKey = body?.api_key;
  const min = body?.min;
  const max = body?.max;
  const typeRaw = (body?.type ?? "float").toString().toLowerCase();

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "api_key required" }, { status: 401 });
  }

  if (typeof min !== "number" || typeof max !== "number" || !Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    return NextResponse.json({ error: "invalid min/max" }, { status: 400 });
  }

  const isInteger = typeRaw === "integer" || typeRaw === "int";

  // integer validation
  if (isInteger && (!Number.isInteger(min) || !Number.isInteger(max))) {
    return NextResponse.json({ error: "min/max must be integers when type=integer" }, { status: 400 });
  }

  const keyHash = sha256(apiKey);

  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, status: true, dailyLimit: true },
  });

  if (!key || key.status !== "ACTIVE") {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // daily usage (same as before)
  const day = startOfDayUTC();
  const usage = await prisma.apiKeyUsage.upsert({
    where: { apiKeyId_day: { apiKeyId: key.id, day } },
    create: { apiKeyId: key.id, day, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  if (usage.count > key.dailyLimit) {
    return NextResponse.json(
      { error: "daily limit exceeded", dailyLimit: key.dailyLimit, usedToday: usage.count, remainingToday: 0 },
      { status: 429 }
    );
  }

  const result = isInteger
    ? randomInteger(min, max)
    : randomFloat(min, max);

  // store the request/result
  const saved = await prisma.randomRequest.create({
    data: {
      apiKeyId: key.id,
      type: isInteger ? "INTEGER" : "FLOAT",
      min,
      max,
      result,
    },
    select: { id: true, createdAt: true },
  });

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  });

  return NextResponse.json({
    id: saved.id,
    type: isInteger ? "integer" : "float",
    min,
    max,
    result,
    createdAt: saved.createdAt,
    usedToday: usage.count,
    dailyLimit: key.dailyLimit,
    remainingToday: Math.max(0, key.dailyLimit - usage.count),
  });
}
