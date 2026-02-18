import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db";
import crypto from "node:crypto";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Next 15/16

  const apiKey = req.nextUrl.searchParams.get("api_key");
  if (!apiKey) {
    return NextResponse.json({ error: "api_key required" }, { status: 401 });
  }

  const keyHash = sha256(apiKey);

  const key = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, status: true },
  });

  if (!key || key.status !== "ACTIVE") {
    return NextResponse.json({ error: "invalid api_key" }, { status: 401 });
  }

  // only allow reading requests made by THIS api key
  const reqRow = await prisma.randomRequest.findFirst({
    where: { id, apiKeyId: key.id },
    select: { id: true, type: true, min: true, max: true, result: true, createdAt: true },
  });

  if (!reqRow) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: reqRow.id,
    type: reqRow.type === "INTEGER" ? "integer" : "float",
    min: reqRow.min,
    max: reqRow.max,
    result: reqRow.result,
    createdAt: reqRow.createdAt,
  });
}
