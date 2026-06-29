import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { ListaClientesCliente } from "./ListaClientesCliente"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Clientes" }

export default async function ClientesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const sp = await searchParams

  const pagina = parseInt(sp.pagina ?? "1")
  const porPagina = 25
  const skip = (pagina - 1) * porPagina
  const busqueda = sp.q ?? ""
  const temperatura = sp.temperatura ?? ""
  const etapa = sp.etapa ?? ""
  const origen = sp.origen ?? ""

  const where: any = {
    eliminadoEn: null,
    estado: "ACTIVO",
    ...(esAdmin ? {} : { vendedorId: usuario.id }),
    ...(busqueda ? {
      OR: [
        { nombre: { contains: busqueda } },
        { telefono: { contains: busqueda } },
        { correo: { contains: busqueda } },
        { empresaNombre: { contains: busqueda } },
      ]
    } : {}),
    ...(temperatura ? { temperatura } : {}),
    ...(etapa ? { etapa } : {}),
    ...(origen ? { origen } : {}),
  }

  const [clientes, total, etapas, etiquetas] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: { etiquetas: { include: { etiqueta: true } }, vendedor: { select: { nombre: true } } },
      orderBy: [{ proximaAccionFecha: "asc" }, { actualizadoEn: "desc" }],
      skip,
      take: porPagina,
    }),
    prisma.cliente.count({ where }),
    prisma.configNegocio.findUnique({ where: { id: "1" }, select: { etapasEmbudo: true } }),
    prisma.etiqueta.findMany({ orderBy: { nombre: "asc" } }),
  ])

  const listaEtapas: string[] = etapas?.etapasEmbudo ? JSON.parse(etapas.etapasEmbudo) : []

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Clientes</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Todas tus personas en un solo lugar</p>
        </div>
        <Link href="/clientes/nuevo" className="btn-marca text-sm">
          <Plus size={16} /> Agregar cliente
        </Link>
      </div>

      <ListaClientesCliente
        clientes={clientes as any}
        total={total}
        pagina={pagina}
        porPagina={porPagina}
        etapas={listaEtapas}
        etiquetas={etiquetas}
        esAdmin={esAdmin}
        filtros={{ q: busqueda, temperatura, etapa, origen }}
      />
    </div>
  )
}
