import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const row = await prisma.randomRequest.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      min: true,
      max: true,
      result: true,
      createdAt: true,
      // 🚫 NOT returning apiKeyId
      // 🚫 NOT returning apiKey
    },
  });

  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    type: row.type === "INTEGER" ? "integer" : "float",
    min: row.min,
    max: row.max,
    result: row.result,
    createdAt: row.createdAt,
  });
}
