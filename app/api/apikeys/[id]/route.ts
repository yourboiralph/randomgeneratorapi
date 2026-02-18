import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // only revoke keys owned by this user
  const key = await prisma.apiKey.findFirst({
    where: { id: params.id, userId: session.user.id },
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
