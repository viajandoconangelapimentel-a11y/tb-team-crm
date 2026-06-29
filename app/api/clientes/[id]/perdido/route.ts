import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarAuditoria } from "@/lib/auditoria"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params
  const { motivo } = await req.json()

  const cliente = await prisma.cliente.findUnique({ where: { id } })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  await prisma.$transaction([
    prisma.cliente.update({
      where: { id },
      data: { estado: "PERDIDO", motivoPerdida: motivo, perdidoEn: new Date() },
    }),
    prisma.eventoHistorial.create({
      data: {
        clienteId: id,
        tipo: "perdido",
        descripcion: `Marcado como Perdido. Motivo: ${motivo ?? "sin especificar"}`,
        usuarioNombre: usuario.nombre ?? usuario.name,
      },
    }),
  ])

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre ?? usuario.name,
    accion: "marcar_perdido",
    entidad: "Cliente",
    entidadId: id,
    descripcion: `Marcó como perdido a ${cliente.nombre}. Motivo: ${motivo}`,
  })

  return NextResponse.json({ ok: true })
}
