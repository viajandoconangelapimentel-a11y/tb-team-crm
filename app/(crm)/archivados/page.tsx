import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Archive } from "lucide-react"
import { RestaurarBoton } from "./RestaurarBoton"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Archivados" }

export default async function ArchivadosPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }

  const clientes = await prisma.cliente.findMany({
    where: { ...filtro, estado: "ARCHIVADO", eliminadoEn: null },
    orderBy: { archivaEn: "desc" },
    take: 50,
  })

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Archive size={24} style={{ color: "var(--acento-archivados)" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Archivados</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Guardados sin perder nada — puedes restaurarlos cuando quieras</p>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="card p-12 text-center">
          <Archive size={32} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium" style={{ color: "var(--texto)" }}>No hay nada archivado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map(c => (
            <div key={c.id} className="card flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--border)", color: "var(--texto-3)" }}>
                {c.nombre[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/clientes/${c.id}`} className="link-cliente text-sm font-semibold">{c.nombre}</Link>
                <p className="text-xs" style={{ color: "var(--texto-3)" }}>
                  Archivado el {c.archivaEn ? new Date(c.archivaEn).toLocaleDateString("es-MX") : "—"}
                </p>
              </div>
              <RestaurarBoton clienteId={c.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
