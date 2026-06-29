import { requireAuth } from "@/lib/permisos"
import { NavegacionLateral } from "@/components/layout/NavegacionLateral"
import { NavegacionInferior } from "@/components/layout/NavegacionInferior"
import { prisma } from "@/lib/prisma"
import { BuscadorGlobal } from "@/components/BuscadorGlobal"
import { Bell } from "lucide-react"
import Link from "next/link"

export default async function CRMLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()
  const usuario = session.user as any

  // Contar leads nuevos sin contactar
  const leadsNuevos = await prisma.cliente.count({
    where: {
      estado: "ACTIVO",
      etapa: "Lista de contactos",
      ultimoContacto: null,
      eliminadoEn: null,
      ...(usuario.rol !== "ADMIN" ? { vendedorId: usuario.id } : {}),
    },
  })

  // Contar tareas vencidas hoy
  const tareasVencidas = await prisma.tarea.count({
    where: {
      usuarioId: usuario.id,
      completada: false,
      eliminadoEn: null,
      fechaVence: { lte: new Date() },
    },
  })

  return (
    <div className="min-h-dvh flex">
      {/* Sidebar desktop */}
      <NavegacionLateral
        usuario={{ nombre: usuario.nombre ?? usuario.name, rol: usuario.rol, correo: usuario.email }}
        leadsNuevos={leadsNuevos}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-60 transition-all">
        {/* Barra superior */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 border-b"
          style={{
            background: "var(--bg-glass)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex-1">
            <BuscadorGlobal />
          </div>

          {/* Campanita de recordatorios */}
          <Link
            href="/seguimiento"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-[var(--border)]"
            aria-label={`${tareasVencidas} recordatorios vencidos`}
          >
            <Bell size={18} style={{ color: "var(--texto-2)" }} />
            {tareasVencidas > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: "var(--rojo)" }}
              >
                {tareasVencidas > 9 ? "9+" : tareasVencidas}
              </span>
            )}
          </Link>

          {/* Avatar */}
          <Link
            href="/perfil"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "var(--marca)" }}
            aria-label="Mi perfil"
          >
            {(usuario.nombre ?? usuario.name ?? "U")[0].toUpperCase()}
          </Link>
        </header>

        {/* Página */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Navegación móvil inferior */}
      <NavegacionInferior />
    </div>
  )
}
