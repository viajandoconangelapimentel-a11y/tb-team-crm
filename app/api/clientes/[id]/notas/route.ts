import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const notaSchema = z.object({
  contenido: z.string().min(1).max(2000),
  tipo: z.enum(["nota", "llamada", "mensaje", "reunion"]).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params

  const body = await req.json()
  const parsed = notaSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const cliente = await prisma.cliente.findUnique({ where: { id }, select: { vendedorId: true } })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  const nota = await prisma.$transaction(async (tx) => {
    const n = await tx.nota.create({
      data: {
        clienteId: id,
        usuarioId: usuario.id,
        contenido: parsed.data.contenido,
        tipo: parsed.data.tipo ?? "nota",
      },
    })
    await tx.cliente.update({
      where: { id },
      data: { ultimoContacto: new Date() },
    })
    return n
  })

  return NextResponse.json({ nota }, { status: 201 })
}
