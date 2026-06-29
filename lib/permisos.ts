import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export type Rol = "ADMIN" | "VENDEDOR" | "SOLO_LECTURA"

// Función central de permisos - úsala en TODAS las rutas
export function puede(rol: string, accion: string, recurso?: string): boolean {
  if (rol === "ADMIN") return true

  const permisosVendedor: Record<string, boolean> = {
    "ver:sus-clientes": true,
    "crear:cliente": true,
    "editar:sus-clientes": true,
    "ver:sus-citas": true,
    "crear:cita": true,
    "ver:sus-pagos": true,
    "crear:pago": true,
    "ver:su-meta": true,
    "editar:su-perfil": true,
    "ver:plantillas": true,
    "crear:plantilla": true,
  }

  const permisosSoloLectura: Record<string, boolean> = {
    "ver:sus-clientes": true,
    "ver:sus-citas": true,
    "ver:sus-pagos": true,
    "ver:su-meta": true,
  }

  if (rol === "VENDEDOR") return permisosVendedor[accion] ?? false
  if (rol === "SOLO_LECTURA") return permisosSoloLectura[accion] ?? false

  return false
}

// Helper para obtener sesión y verificar login en server components
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

// Helper para verificar que es admin
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if ((session.user as any).rol !== "ADMIN") redirect("/dashboard")
  return session
}

// Helper para filtro de clientes por vendedor
export function filtroCliente(usuarioId: string, rol: string) {
  if (rol === "ADMIN") return {}
  return { vendedorId: usuarioId }
}
