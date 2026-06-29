import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }
  const q = req.nextUrl.searchParams.get("q") ?? ""

  if (q.length < 2) return NextResponse.json({ resultados: [] })

  const [clientes, citas, pagos, notas] = await Promise.all([
    prisma.cliente.findMany({
      where: {
        ...filtro,
        eliminadoEn: null,
        OR: [
          { nombre: { contains: q } },
          { telefono: { contains: q } },
          { correo: { contains: q } },
          { empresaNombre: { contains: q } },
          { notas: { contains: q } },
        ],
      },
      select: { id: true, nombre: true, etapa: true, estado: true },
      take: 5,
    }),
    prisma.cita.findMany({
      where: {
        ...(!esAdmin ? { vendedorId: usuario.id } : {}),
        eliminadoEn: null,
        titulo: { contains: q },
      },
      select: { id: true, titulo: true, inicio: true },
      take: 3,
    }),
    prisma.pago.findMany({
      where: {
        ...filtro,
        eliminadoEn: null,
        OR: [
          { concepto: { contains: q } },
          { cliente: { nombre: { contains: q } } },
        ],
      },
      select: { id: true, monto: true, cliente: { select: { nombre: true } } },
      take: 3,
    }),
    prisma.nota.findMany({
      where: {
        ...(!esAdmin ? { usuarioId: usuario.id } : {}),
        eliminadoEn: null,
        contenido: { contains: q },
      },
      select: { id: true, contenido: true, clienteId: true, cliente: { select: { nombre: true } } },
      take: 3,
    }),
  ])

  const resultados = [
    ...clientes.map(c => ({
      tipo: "cliente",
      id: c.id,
      titulo: c.nombre,
      subtitulo: c.etapa,
      href: `/clientes/${c.id}`,
    })),
    ...citas.map(c => ({
      tipo: "cita",
      id: c.id,
      titulo: c.titulo,
      subtitulo: new Date(c.inicio).toLocaleDateString("es-MX"),
      href: `/agenda`,
    })),
    ...pagos.map(p => ({
      tipo: "pago",
      id: p.id,
      titulo: p.cliente.nombre,
      subtitulo: `$${p.monto.toLocaleString("es-MX")}`,
      href: `/pagos`,
    })),
    ...notas.map(n => ({
      tipo: "nota",
      id: n.id,
      titulo: n.cliente.nombre,
      subtitulo: n.contenido.slice(0, 60),
      href: `/clientes/${n.clienteId}`,
    })),
  ]

  return NextResponse.json({ resultados })
}
