import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { ConfiguracionCliente } from "./ConfiguracionCliente"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Configuración" }

export default async function ConfiguracionPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const config = await prisma.configNegocio.findUnique({ where: { id: "1" } })

  return <ConfiguracionCliente config={config as any} esAdmin={esAdmin} />
}
