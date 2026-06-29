import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { ReactivarBoton } from "./ReactivarBoton"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Perdidos" }

export default async function PerdidosPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }

  const clientes = await prisma.cliente.findMany({
    where: { ...filtro, estado: "PERDIDO", eliminadoEn: null },
    orderBy: { perdidoEn: "desc" },
    take: 50,
  })

  // Resumen de motivos
  const motivos: Record<string, number> = {}
  clientes.forEach(c => {
    if (c.motivoPerdida) motivos[c.motivoPerdida] = (motivos[c.motivoPerdida] ?? 0) + 1
  })

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <XCircle size={24} style={{ color: "var(--acento-perdidos)" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Perdidos</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Aprende por qué y reactiva cuando sea el momento</p>
        </div>
      </div>

      {/* Motivos más comunes */}
      {Object.keys(motivos).length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--texto)" }}>¿Por qué perdemos ventas?</p>
          <div className="space-y-2">
            {Object.entries(motivos).sort((a, b) => b[1] - a[1]).map(([motivo, count]) => (
              <div key={motivo} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs" style={{ color: "var(--texto-2)" }}>{motivo}</span>
                    <span className="text-xs font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / clientes.length) * 100}%`, background: "var(--texto-3)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {clientes.length === 0 ? (
        <div className="card p-12 text-center">
          <XCircle size={32} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium" style={{ color: "var(--texto)" }}>No hay clientes perdidos</p>
          <p className="text-sm mt-1" style={{ color: "var(--texto-3)" }}>¡Sigue así! 💪</p>
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
                {c.motivoPerdida && (
                  <p className="text-xs" style={{ color: "var(--texto-3)" }}>Motivo: {c.motivoPerdida}</p>
                )}
              </div>
              <ReactivarBoton clienteId={c.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
