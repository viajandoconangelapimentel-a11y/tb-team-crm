import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  nombre: z.string().min(1).max(100),
  tipo: z.enum(["whatsapp", "correo"]),
  cuerpo: z.string().min(1),
  asunto: z.string().optional(),
  etapa: z.string().optional(),
  objecion: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const p = await prisma.plantilla.create({ data: { ...parsed.data, usuarioId: usuario.id } })
  return NextResponse.json({ plantilla: p }, { status: 201 })
}
