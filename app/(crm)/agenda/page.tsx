import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { AgendaCliente } from "./AgendaCliente"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Agenda" }

export default async function AgendaPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)

  const citas = await prisma.cita.findMany({
    where: {
      ...(!esAdmin ? { vendedorId: usuario.id } : {}),
      eliminadoEn: null,
      inicio: { gte: inicioMes, lte: finMes },
    },
    include: { cliente: { select: { id: true, nombre: true } }, vendedor: { select: { nombre: true } } },
    orderBy: { inicio: "asc" },
  })

  const clientes = await prisma.cliente.findMany({
    where: { ...(!esAdmin ? { vendedorId: usuario.id } : {}), estado: "ACTIVO", eliminadoEn: null },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })

  return (
    <AgendaCliente
      citas={citas as any}
      clientes={clientes}
      usuarioId={usuario.id}
      esAdmin={esAdmin}
      mesActual={hoy.getMonth()}
      anioActual={hoy.getFullYear()}
    />
  )
}
