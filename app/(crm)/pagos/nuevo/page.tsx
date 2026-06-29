import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { NuevoPagoForm } from "./NuevoPagoForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Registrar pago" }

export default async function NuevoPagoPage() {
  const session = await requireAuth()
  const usuario = session.user as any

  const clientes = await prisma.cliente.findMany({
    where: {
      eliminadoEn: null,
      estado: { in: ["ACTIVO", "GANADO"] },
      ...(usuario.rol === "VENDEDOR" ? { vendedorId: usuario.id } : {}),
    },
    select: { id: true, nombre: true, telefono: true },
    orderBy: { nombre: "asc" },
    take: 200,
  })

  return <NuevoPagoForm clientes={clientes} />
}
