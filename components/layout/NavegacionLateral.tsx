"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, KanbanSquare, CalendarDays, Wallet,
  ListChecks, Trophy, XCircle, Archive, Share2, UserCog,
  Sparkles, ShieldCheck, CalendarPlus, LogOut, HelpCircle,
  ChevronLeft, ChevronRight
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { BuscadorGlobal } from "@/components/BuscadorGlobal"
import { SelectorTema } from "@/components/ui/SelectorTema"

const NAV_PRINCIPAL = [
  { href: "/dashboard", icono: LayoutDashboard, label: "Tablero", acento: "var(--acento-dashboard)" },
  { href: "/clientes", icono: Users, label: "Clientes", acento: "var(--acento-clientes)" },
  { href: "/embudo", icono: KanbanSquare, label: "Embudo", acento: "var(--acento-embudo)" },
  { href: "/seguimiento", icono: ListChecks, label: "Seguimiento", acento: "var(--acento-seguimiento)" },
  { href: "/agenda", icono: CalendarDays, label: "Agenda", acento: "var(--acento-agenda)" },
  { href: "/pagos", icono: Wallet, label: "Pagos", acento: "var(--acento-pagos)" },
]

const NAV_SECUNDARIO = [
  { href: "/completados", icono: Trophy, label: "Completados", acento: "var(--acento-completados)" },
  { href: "/perdidos", icono: XCircle, label: "Perdidos", acento: "var(--acento-perdidos)" },
  { href: "/archivados", icono: Archive, label: "Archivados", acento: "var(--acento-archivados)" },
  { href: "/plantillas", icono: Sparkles, label: "Asistente IA", acento: "var(--acento-ia)" },
  { href: "/compartir", icono: Share2, label: "Comparte y crece", acento: "var(--acento-compartir)" },
  { href: "/agenda/paginas", icono: CalendarPlus, label: "Páginas de agenda", acento: "var(--acento-agenda)" },
  { href: "/equipo", icono: UserCog, label: "Equipo", acento: "var(--acento-equipo)" },
  { href: "/admin", icono: ShieldCheck, label: "Panel admin", acento: "var(--acento-admin)" },
]

interface Props {
  usuario: { nombre: string; rol: string; correo: string }
  leadsNuevos?: number
}

export function NavegacionLateral({ usuario, leadsNuevos = 0 }: Props) {
  const pathname = usePathname()
  const [colapsada, setColapsada] = useState(false)

  const esActiva = (href: string) => pathname.startsWith(href)

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r transition-all duration-200"
      style={{
        width: colapsada ? 64 : 240,
        background: "var(--bg-glass)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: "var(--marca)" }}
          aria-label="TB Team"
        >
          TB
        </div>
        {!colapsada && (
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "var(--texto)" }}>TB Team Agentes</p>
            <p className="text-xs truncate" style={{ color: "var(--texto-3)" }}>CRM de ventas</p>
          </div>
        )}
        <button
          className="ml-auto rounded-lg p-1 hover:bg-[var(--border)] transition-colors"
          onClick={() => setColapsada(c => !c)}
          aria-label={colapsada ? "Expandir menú" : "Colapsar menú"}
        >
          {colapsada ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Scroll */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Leads nuevos */}
        {leadsNuevos > 0 && !colapsada && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2" style={{ background: "var(--marca-light)", color: "var(--marca-dark)" }}>
            <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[10px]">{leadsNuevos}</span>
            Tienes {leadsNuevos} nuevo{leadsNuevos > 1 ? "s" : ""} interesado{leadsNuevos > 1 ? "s" : ""} sin contactar
          </div>
        )}

        <nav aria-label="Navegación principal">
          {NAV_PRINCIPAL.map(({ href, icono: Icono, label, acento }) => {
            const activa = esActiva(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-sm font-medium"
                style={{
                  color: activa ? acento : "var(--texto-2)",
                  background: activa ? `color-mix(in srgb, ${acento} 12%, transparent)` : "transparent",
                }}
                aria-current={activa ? "page" : undefined}
              >
                <Icono size={18} style={{ color: activa ? acento : undefined, flexShrink: 0 }} />
                {!colapsada && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="mx-3 my-2 border-t" style={{ borderColor: "var(--border)" }} />

        <nav aria-label="Navegación secundaria">
          {NAV_SECUNDARIO.map(({ href, icono: Icono, label, acento }) => {
            // Solo admin ve panel admin
            if (href === "/admin" && usuario.rol !== "ADMIN") return null
            const activa = esActiva(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all text-sm"
                style={{
                  color: activa ? acento : "var(--texto-3)",
                  background: activa ? `color-mix(in srgb, ${acento} 12%, transparent)` : "transparent",
                }}
                aria-current={activa ? "page" : undefined}
              >
                <Icono size={16} style={{ color: activa ? acento : undefined, flexShrink: 0 }} />
                {!colapsada && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-3 space-y-1" style={{ borderColor: "var(--border)" }}>
        <SelectorTema compacto={colapsada} />
        <Link
          href="/ayuda"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--border)]"
          style={{ color: "var(--texto-3)" }}
        >
          <HelpCircle size={16} />
          {!colapsada && <span>Ayuda</span>}
        </Link>
        <Link
          href="/perfil"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--border)]"
          style={{ color: "var(--texto-2)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "var(--marca)" }}
          >
            {usuario.nombre[0]?.toUpperCase()}
          </div>
          {!colapsada && (
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{usuario.nombre}</p>
              <p className="text-[10px] opacity-60 truncate">{usuario.rol}</p>
            </div>
          )}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 w-full"
        >
          <LogOut size={16} />
          {!colapsada && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
