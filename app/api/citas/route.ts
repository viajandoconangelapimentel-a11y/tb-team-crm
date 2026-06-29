import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  titulo: z.string().min(1).max(200),
  clienteId: z.string().optional(),
  inicio: z.string(),
  fin: z.string(),
  notas: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const cita = await prisma.$transaction(async (tx) => {
    const c = await tx.cita.create({
      data: {
        titulo: parsed.data.titulo,
        clienteId: parsed.data.clienteId || undefined,
        vendedorId: usuario.id,
        inicio: new Date(parsed.data.inicio),
        fin: new Date(parsed.data.fin),
        notas: parsed.data.notas,
        origen: "Manual",
      },
    })

    // Si hay cliente, registrar en historial
    if (parsed.data.clienteId) {
      await tx.eventoHistorial.create({
        data: {
          clienteId: parsed.data.clienteId,
          tipo: "cita",
          descripcion: `Cita agendada: "${parsed.data.titulo}" el ${new Date(parsed.data.inicio).toLocaleDateString("es-MX")}`,
          usuarioNombre: usuario.nombre ?? usuario.name,
        },
      })
      await tx.cliente.update({
        where: { id: parsed.data.clienteId },
        data: { ultimoContacto: new Date() },
      })
    }

    return c
  })

  return NextResponse.json({ cita }, { status: 201 })
}
