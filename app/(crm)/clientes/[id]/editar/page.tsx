import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { EditarClienteForm } from "./EditarClienteForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Editar cliente" }

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await requireAuth()
  const usuario = session.user as any

  const cliente = await prisma.cliente.findFirst({
    where: {
      id,
      eliminadoEn: null,
      ...(usuario.rol === "VENDEDOR" ? { vendedorId: usuario.id } : {}),
    },
  })

  if (!cliente) notFound()

  return <EditarClienteForm cliente={cliente as any} />
}
