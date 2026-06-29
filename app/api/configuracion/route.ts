import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).rol !== "ADMIN")
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

  const body = await req.json()
  const config = await prisma.configNegocio.upsert({
    where: { id: "1" },
    create: { id: "1", ...body },
    update: body,
  })
  return NextResponse.json({ config })
}
