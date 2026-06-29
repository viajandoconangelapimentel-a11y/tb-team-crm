import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { PerfilCliente } from "./PerfilCliente"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Mi Perfil" }

export default async function PerfilPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const usuarioDB = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: { id: true, nombre: true, correo: true, rol: true, tema: true, vistaDensa: true, onboardingCompletado: true, metaMesClientes: true },
  })

  return <PerfilCliente usuario={usuarioDB as any} />
}
