import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { ExpedienteCliente } from "./ExpedienteCliente"
import type { Metadata } from "next"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const c = await prisma.cliente.findUnique({ where: { id }, select: { nombre: true } })
  return { title: c?.nombre ?? "Cliente" }
}

export default async function ClientePage({ params }: Props) {
  const { id } = await params
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      vendedor: { select: { id: true, nombre: true } },
      citas: { where: { eliminadoEn: null }, orderBy: { inicio: "desc" }, take: 5 },
      pagos: { where: { eliminadoEn: null }, orderBy: { creadoEn: "desc" } },
      notas_rel: { where: { eliminadoEn: null }, include: { usuario: { select: { nombre: true } } }, orderBy: { fechaReal: "desc" } },
      archivos: { where: { eliminadoEn: null }, orderBy: { creadoEn: "desc" } },
      tareas: { where: { eliminadoEn: null, completada: false }, orderBy: { fechaVence: "asc" }, take: 5 },
      historial: { orderBy: { creadoEn: "desc" }, take: 20 },
      etiquetas: { include: { etiqueta: true } },
    },
  })

  if (!cliente || cliente.eliminadoEn) notFound()

  // Control de acceso: vendedor solo ve sus clientes
  if (!esAdmin && cliente.vendedorId && cliente.vendedorId !== usuario.id) {
    redirect("/clientes")
  }

  const config = await prisma.configNegocio.findUnique({ where: { id: "1" } })
  const vendedores = esAdmin ? await prisma.usuario.findMany({ where: { activo: true }, select: { id: true, nombre: true } }) : []
  const etiquetas = await prisma.etiqueta.findMany({ orderBy: { nombre: "asc" } })
  const plantillas = await prisma.plantilla.findMany({
    where: { OR: [{ usuarioId: usuario.id }, { esGlobal: true }] },
    orderBy: { esFavorita: "desc" },
  })

  return (
    <ExpedienteCliente
      cliente={cliente as any}
      config={config as any}
      vendedores={vendedores}
      etiquetas={etiquetas}
      plantillas={plantillas as any}
      usuarioId={usuario.id}
      esAdmin={esAdmin}
    />
  )
}
