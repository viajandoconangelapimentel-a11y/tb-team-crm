"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, KanbanSquare, ListChecks, Plus, MoreHorizontal } from "lucide-react"
import { useState } from "react"

const NAV_MOVIL = [
  { href: "/dashboard", icono: LayoutDashboard, label: "Tablero" },
  { href: "/clientes", icono: Users, label: "Clientes" },
  { href: "/embudo", icono: KanbanSquare, label: "Embudo" },
  { href: "/seguimiento", icono: ListChecks, label: "Seguimiento" },
]

export function NavegacionInferior() {
  const pathname = usePathname()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-2 pb-safe"
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border)",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        paddingTop: 8,
      }}
      aria-label="Navegación móvil"
    >
      {NAV_MOVIL.map(({ href, icono: Icono, label }) => {
        const activa = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[44px]"
            style={{ color: activa ? "var(--marca)" : "var(--texto-3)" }}
            aria-current={activa ? "page" : undefined}
          >
            <Icono size={22} strokeWidth={activa ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}

      {/* Botón + Nuevo central */}
      <Link
        href="/clientes/nuevo"
        className="flex flex-col items-center gap-0.5 px-3 py-1"
        aria-label="Agregar nuevo cliente"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{ background: "var(--marca)" }}
        >
          <Plus size={20} />
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--texto-3)" }}>Nuevo</span>
      </Link>

      <button
        className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[44px]"
        onClick={() => setMenuAbierto(v => !v)}
        style={{ color: "var(--texto-3)" }}
        aria-label="Más opciones"
      >
        <MoreHorizontal size={22} />
        <span className="text-[10px] font-medium">Más</span>
      </button>
    </nav>
  )
}
