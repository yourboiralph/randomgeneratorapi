import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/apikey";

function startOfDayUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { raw, hash, prefix } = generateApiKey();

  await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      keyHash: hash,
      prefix,
      dailyLimit: 1000,
      status: "ACTIVE",
    },
  });

  // raw key shown only once
  return NextResponse.json({ apiKey: raw });
}

export async function GET() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = startOfDayUTC();

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      status: true,
      dailyLimit: true,
      lastUsedAt: true,
      createdAt: true,
      usages: {
        where: { day },
        select: { count: true },
        take: 1,
      },
    },
  });

  const formatted = keys.map((k) => ({
    ...k,
    usedToday: k.usages[0]?.count ?? 0,
    usages: undefined,
  }));

  return NextResponse.json({ keys: formatted });
}
