import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { registrarAuditoria } from "@/lib/auditoria"

const schema = z.object({
  clienteId: z.string().min(1),
  monto: z.number().positive(),
  metodo: z.enum(["Transferencia", "Tarjeta", "Liga de pago", "Efectivo", "Otro"]),
  estatus: z.enum(["pagado", "pendiente", "vencido"]),
  concepto: z.string().min(1).max(300),
  esParcialidad: z.boolean().optional(),
  totalContrato: z.number().optional(),
  fechaPago: z.string().nullable().optional(),
  fechaVencimiento: z.string().nullable().optional(),
  notas: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any

  const { searchParams } = new URL(req.url)
  const estatus = searchParams.get("estatus")

  const pagos = await prisma.pago.findMany({
    where: {
      ...(usuario.rol === "VENDEDOR" ? { vendedorId: usuario.id } : {}),
      ...(estatus ? { estatus } : {}),
      cliente: { eliminadoEn: null },
    },
    include: { cliente: { select: { id: true, nombre: true } } },
    orderBy: { creadoEn: "desc" },
    take: 100,
  })

  return NextResponse.json({ pagos })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", detalle: parsed.error.flatten() }, { status: 400 })

  const { clienteId, fechaPago, fechaVencimiento, ...resto } = parsed.data

  // Verificar que el cliente pertenece al vendedor (si es VENDEDOR)
  if (usuario.rol === "VENDEDOR") {
    const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, vendedorId: usuario.id, eliminadoEn: null } })
    if (!cliente) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  }

  const ultimoFolio = await prisma.pago.aggregate({ _max: { folioConsecutivo: true } })
  const folio = (ultimoFolio._max.folioConsecutivo ?? 0) + 1

  const pago = await prisma.pago.create({
    data: {
      ...resto,
      clienteId,
      vendedorId: usuario.id,
      folioConsecutivo: folio,
      fechaPago: fechaPago ? new Date(fechaPago) : null,
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
    },
  })

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre ?? usuario.name,
    accion: "crear",
    entidad: "pago",
    entidadId: pago.id,
    descripcion: `Pago de $${parsed.data.monto} MXN registrado — folio #${folio}`,
  })

  return NextResponse.json({ pago }, { status: 201 })
}
