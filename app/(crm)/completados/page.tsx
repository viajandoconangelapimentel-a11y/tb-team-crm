import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Trophy } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Completados" }

export default async function CompletadosPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }

  const clientes = await prisma.cliente.findMany({
    where: { ...filtro, estado: "GANADO", eliminadoEn: null },
    orderBy: { ganadoEn: "desc" },
    take: 50,
  })

  const totalIngresos = clientes.reduce((s, c) => s + c.valorEstimado, 0)

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Trophy size={24} style={{ color: "var(--acento-completados)" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Tu muro de victorias 🏆</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>{clientes.length} clientes ganados · ${totalIngresos.toLocaleString("es-MX")} MXN</p>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy size={32} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium" style={{ color: "var(--texto)" }}>Aún no tienes clientes completados</p>
          <p className="text-sm mt-1" style={{ color: "var(--texto-3)" }}>Cierra tu primera venta y aparecerá aquí 🎉</p>
          <Link href="/embudo" className="btn-marca mt-4 text-sm inline-flex">Ver embudo</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map(c => (
            <div key={c.id} className="card flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                {c.nombre[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/clientes/${c.id}`} className="link-cliente text-sm font-semibold">{c.nombre}</Link>
                <p className="text-xs" style={{ color: "var(--texto-3)" }}>
                  Ganado el {c.ganadoEn ? new Date(c.ganadoEn).toLocaleDateString("es-MX", { day: "numeric", month: "long" }) : "—"}
                </p>
              </div>
              {c.valorEstimado > 0 && (
                <span className="text-sm font-bold" style={{ color: "var(--acento-completados)" }}>
                  ${c.valorEstimado.toLocaleString("es-MX")}
                </span>
              )}
              <Link href={`/clientes/${c.id}`} className="btn-secundario text-xs py-1.5 px-3">Ver ficha</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
