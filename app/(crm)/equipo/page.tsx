import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { UserCog } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Equipo" }

export default async function EquipoPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const usuarios = esAdmin
    ? await prisma.usuario.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } })
    : await prisma.usuario.findMany({ where: { id: usuario.id } })

  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const stats = await Promise.all(usuarios.map(async u => {
    const [ganados, activos] = await Promise.all([
      prisma.cliente.count({ where: { vendedorId: u.id, estado: "GANADO", ganadoEn: { gte: inicioMes }, eliminadoEn: null } }),
      prisma.cliente.count({ where: { vendedorId: u.id, estado: "ACTIVO", eliminadoEn: null } }),
    ])
    return { ...u, ganados, activos }
  }))

  const ranking = [...stats].sort((a, b) => b.ganados - a.ganados)

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <UserCog size={24} style={{ color: "var(--acento-equipo)" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Equipo</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Tu gente y sus metas este mes</p>
        </div>
      </div>

      <div className="space-y-2">
        {ranking.map((u, i) => {
          const medallas = ["🥇", "🥈", "🥉"]
          const pct = Math.round((u.ganados / (u.metaMesClientes || 1)) * 100)
          return (
            <div key={u.id} className="card p-4 flex items-center gap-4">
              <span className="text-xl shrink-0">{medallas[i] ?? `#${i + 1}`}</span>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: "var(--marca)" }}
              >
                {u.nombre[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--texto)" }}>{u.nombre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: "var(--marca)" }} />
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "var(--texto-3)" }}>{pct}%</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-extrabold" style={{ color: "var(--texto)" }}>{u.ganados}</p>
                <p className="text-xs" style={{ color: "var(--texto-3)" }}>/ {u.metaMesClientes}</p>
              </div>
            </div>
          )
        })}
      </div>

      {esAdmin && (
        <div className="pt-2">
          <Link href="/admin" className="btn-secundario text-sm">⚙️ Gestionar equipo en Panel Admin</Link>
        </div>
      )}
    </div>
  )
}
