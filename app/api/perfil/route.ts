import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const body = await req.json()
  const schema = z.object({ nombre: z.string().min(1).max(100).optional(), tema: z.string().optional() })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  await prisma.usuario.update({ where: { id: usuario.id }, data: parsed.data })
  return NextResponse.json({ ok: true })
}
