import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const body = await req.json()
  const schema = z.object({ actual: z.string().min(1), nueva: z.string().min(8) })
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const db = await prisma.usuario.findUnique({ where: { id: usuario.id } })
  if (!db) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

  const ok = await bcrypt.compare(parsed.data.actual, db.passwordHash)
  if (!ok) return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 })

  const hash = await bcrypt.hash(parsed.data.nueva, 12)
  await prisma.usuario.update({ where: { id: usuario.id }, data: { passwordHash: hash } })
  return NextResponse.json({ ok: true })
}
