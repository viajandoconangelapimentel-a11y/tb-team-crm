import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { EmbudoKanban } from "./EmbudoKanban"
import type { Metadata } from "next"
import Link from "next/link"
import { Trophy, XCircle, Archive } from "lucide-react"

export const metadata: Metadata = { title: "Embudo" }

export default async function EmbudoPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }

  const config = await prisma.configNegocio.findUnique({ where: { id: "1" } })
  const etapas: string[] = config?.etapasEmbudo ? JSON.parse(config.etapasEmbudo) : []

  const clientes = await prisma.cliente.findMany({
    where: { ...filtro, estado: { in: ["ACTIVO", "GANADO"] }, eliminadoEn: null },
    include: { etiquetas: { include: { etiqueta: true } }, vendedor: { select: { nombre: true } } },
    orderBy: { actualizadoEn: "desc" },
  })

  // Contadores de secciones
  const [totalCompletados, totalPerdidos, totalArchivados] = await Promise.all([
    prisma.cliente.count({ where: { ...filtro, estado: "GANADO", eliminadoEn: null } }),
    prisma.cliente.count({ where: { ...filtro, estado: "PERDIDO", eliminadoEn: null } }),
    prisma.cliente.count({ where: { ...filtro, estado: "ARCHIVADO", eliminadoEn: null } }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Embudo de ventas</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Mueve a cada cliente hacia la venta</p>
        </div>
        {/* Accesos rápidos a otras secciones */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/completados" className="btn-secundario text-xs flex items-center gap-1.5">
            <Trophy size={12} style={{ color: "var(--acento-completados)" }} />
            Completados ({totalCompletados})
          </Link>
          <Link href="/perdidos" className="btn-secundario text-xs flex items-center gap-1.5">
            <XCircle size={12} style={{ color: "var(--acento-perdidos)" }} />
            Perdidos ({totalPerdidos})
          </Link>
          <Link href="/archivados" className="btn-secundario text-xs flex items-center gap-1.5">
            <Archive size={12} style={{ color: "var(--acento-archivados)" }} />
            Archivados ({totalArchivados})
          </Link>
        </div>
      </div>

      <EmbudoKanban
        clientes={clientes as any}
        etapas={etapas}
        umbralDias={config?.umbralEstancamientoDias ?? 7}
      />
    </div>
  )
}
