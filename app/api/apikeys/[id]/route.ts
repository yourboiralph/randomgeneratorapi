import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ await params in Next 15/16

  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = await prisma.apiKey.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { status: "REVOKED" },
  });

  return NextResponse.json({ ok: true });
}
