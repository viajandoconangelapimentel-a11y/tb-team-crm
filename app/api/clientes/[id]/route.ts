import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarAuditoria } from "@/lib/auditoria"
import { z } from "zod"

const patchSchema = z.object({
  etapa: z.string().optional(),
  temperatura: z.enum(["CALIENTE", "TIBIO", "FRIO"]).optional(),
  objecion: z.string().optional(),
  valorEstimado: z.number().min(0).optional(),
  proximaAccion: z.string().optional(),
  proximaAccionFecha: z.string().nullable().optional(),
  vendedorId: z.string().optional(),
}).passthrough()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id, eliminadoEn: null },
    include: {
      vendedor: { select: { nombre: true } },
      etiquetas: { include: { etiqueta: true } },
      pagos: { where: { eliminadoEn: null } },
    },
  })

  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  return NextResponse.json({ cliente })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params

  const cliente = await prisma.cliente.findUnique({ where: { id }, select: { vendedorId: true, etapa: true, nombre: true } })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const { proximaAccionFecha, ...resto } = parsed.data

  const actualizado = await prisma.$transaction(async (tx) => {
    const c = await tx.cliente.update({
      where: { id },
      data: {
        ...resto,
        proximaAccionFecha: proximaAccionFecha ? new Date(proximaAccionFecha) : proximaAccionFecha === null ? null : undefined,
        actualizadoEn: new Date(),
      },
    })

    // Registrar cambio de etapa en historial
    if (parsed.data.etapa && parsed.data.etapa !== cliente.etapa) {
      await tx.eventoHistorial.create({
        data: {
          clienteId: id,
          tipo: "cambio_etapa",
          descripcion: `Movido de "${cliente.etapa}" a "${parsed.data.etapa}"`,
          usuarioNombre: usuario.nombre ?? usuario.name,
        },
      })
    }

    return c
  })

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre ?? usuario.name,
    accion: "editar",
    entidad: "Cliente",
    entidadId: id,
    descripcion: `Editó a ${cliente.nombre}`,
  })

  return NextResponse.json({ cliente: actualizado })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params

  const cliente = await prisma.cliente.findUnique({ where: { id }, select: { vendedorId: true, nombre: true } })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  // Soft delete — va a Papelera
  await prisma.cliente.update({ where: { id }, data: { eliminadoEn: new Date() } })

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre ?? usuario.name,
    accion: "borrar",
    entidad: "Cliente",
    entidadId: id,
    descripcion: `Envió a la papelera al cliente ${cliente.nombre}`,
  })

  return NextResponse.json({ ok: true })
}
