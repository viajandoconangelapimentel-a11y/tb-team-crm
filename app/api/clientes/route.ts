import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarAuditoria } from "@/lib/auditoria"
import { z } from "zod"

const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(120),
  telefono: z.string().optional(),
  correo: z.string().email().optional().or(z.literal("")),
  origen: z.string().optional(),
  etapa: z.string().optional(),
  temperatura: z.enum(["CALIENTE", "TIBIO", "FRIO"]).optional(),
  objecion: z.string().optional(),
  valorEstimado: z.number().min(0).optional(),
  proximaAccion: z.string().optional(),
  proximaAccionFecha: z.string().optional(),
  notas: z.string().optional(),
  empresaNombre: z.string().optional(),
  zona: z.string().optional(),
  vendedorId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const sp = req.nextUrl.searchParams
  const pagina = parseInt(sp.get("pagina") ?? "1")
  const porPagina = 25
  const skip = (pagina - 1) * porPagina
  const q = sp.get("q") ?? ""
  const estado = sp.get("estado") ?? "ACTIVO"

  const where: any = {
    eliminadoEn: null,
    ...(estado !== "todos" ? { estado } : {}),
    ...(esAdmin ? {} : { vendedorId: usuario.id }),
    ...(q ? { OR: [{ nombre: { contains: q } }, { telefono: { contains: q } }, { correo: { contains: q } }] } : {}),
  }

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: { etiquetas: { include: { etiqueta: true } }, vendedor: { select: { nombre: true } } },
      orderBy: { actualizadoEn: "desc" },
      skip,
      take: porPagina,
    }),
    prisma.cliente.count({ where }),
  ])

  return NextResponse.json({ clientes, total, pagina, porPagina })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any

  const body = await req.json()
  const parsed = clienteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 })
  }

  const { proximaAccionFecha, correo, ...resto } = parsed.data

  // Verificar duplicado por teléfono
  if (resto.telefono) {
    const existe = await prisma.cliente.findFirst({
      where: { telefono: { equals: resto.telefono }, eliminadoEn: null },
      select: { id: true, nombre: true },
    })
    if (existe) {
      return NextResponse.json({ error: "duplicado", clienteExistente: existe }, { status: 409 })
    }
  }

  const cliente = await prisma.$transaction(async (tx) => {
    const c = await tx.cliente.create({
      data: {
        ...resto,
        correo: correo || undefined,
        vendedorId: (usuario.rol === "ADMIN" && resto.vendedorId) ? resto.vendedorId : usuario.id,
        proximaAccionFecha: proximaAccionFecha ? new Date(proximaAccionFecha) : undefined,
        etapa: resto.etapa ?? "Lista de contactos",
      },
    })
    await tx.eventoHistorial.create({
      data: {
        clienteId: c.id,
        tipo: "creacion",
        descripcion: "Cliente creado",
        usuarioNombre: usuario.nombre ?? usuario.name,
      },
    })
    return c
  })

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre ?? usuario.name,
    accion: "crear",
    entidad: "Cliente",
    entidadId: cliente.id,
    descripcion: `Creó al cliente ${cliente.nombre}`,
  })

  return NextResponse.json({ cliente }, { status: 201 })
}
