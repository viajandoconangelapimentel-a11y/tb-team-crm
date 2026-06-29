import { requireAdmin } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ShieldCheck, Users, Download, Clock } from "lucide-react"
import { GestionUsuariosAdmin } from "./GestionUsuariosAdmin"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Panel Admin" }

export default async function AdminPage() {
  const session = await requireAdmin()

  const [usuarios, bitacora] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { creadoEn: "asc" } }),
    prisma.registroAuditoria.findMany({
      orderBy: { creadoEn: "desc" },
      take: 20,
    }),
  ])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck size={24} style={{ color: "var(--acento-admin)" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Panel de Administrador</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Tu equipo, tus datos, tu negocio</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <a
          href="/api/admin/respaldar"
          download="respaldo-tb-team.json"
          className="card p-4 flex items-center gap-3 hover:shadow-[var(--sombra-hover)] transition-all"
        >
          <Download size={18} style={{ color: "var(--marca)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Respaldar todo</p>
            <p className="text-xs" style={{ color: "var(--texto-3)" }}>Descargar JSON completo</p>
          </div>
        </a>
        <Link href="/admin/papelera" className="card p-4 flex items-center gap-3 hover:shadow-[var(--sombra-hover)] transition-all">
          <Clock size={18} style={{ color: "var(--texto-3)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Papelera</p>
            <p className="text-xs" style={{ color: "var(--texto-3)" }}>Restaurar lo borrado</p>
          </div>
        </Link>
        <Link href="/configuracion" className="card p-4 flex items-center gap-3 hover:shadow-[var(--sombra-hover)] transition-all">
          <ShieldCheck size={18} style={{ color: "var(--marca)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Configuración</p>
            <p className="text-xs" style={{ color: "var(--texto-3)" }}>Negocio y equipo</p>
          </div>
        </Link>
      </div>

      {/* Gestión de usuarios */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "var(--acento-equipo)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Usuarios del equipo</h2>
          </div>
        </div>
        <GestionUsuariosAdmin usuarios={usuarios as any} />
      </div>

      {/* Bitácora */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Clock size={16} style={{ color: "var(--texto-3)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Actividad reciente</h2>
        </div>
        <div className="space-y-1">
          {bitacora.map(r => (
            <div key={r.id} className="card flex items-center gap-3 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "var(--texto)" }}>{r.descripcion}</p>
                <p className="text-xs" style={{ color: "var(--texto-3)" }}>
                  {r.usuarioNombre} · {new Date(r.creadoEn).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {bitacora.length === 0 && (
            <div className="card p-6 text-center text-sm" style={{ color: "var(--texto-3)" }}>
              Sin actividad registrada aún.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
