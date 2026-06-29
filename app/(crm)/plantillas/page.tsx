import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { PlantillasCliente } from "./PlantillasCliente"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Plantillas y Asistente IA" }

export default async function PlantillasPage() {
  const session = await requireAuth()
  const usuario = session.user as any

  const plantillas = await prisma.plantilla.findMany({
    where: { OR: [{ usuarioId: usuario.id }, { esGlobal: true }] },
    orderBy: [{ esFavorita: "desc" }, { creadoEn: "desc" }],
  })

  return <PlantillasCliente plantillas={plantillas as any} usuarioId={usuario.id} tieneIA={!!process.env.ANTHROPIC_API_KEY} />
}
