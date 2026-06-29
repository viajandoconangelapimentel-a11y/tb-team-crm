import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { BadgePago } from "@/components/ui/Badge"
import { Wallet, Plus, AlertTriangle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Pagos" }

export default async function PagosPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

  const [pagos, pagosVencidos, totalMes] = await Promise.all([
    prisma.pago.findMany({
      where: { ...filtro, eliminadoEn: null },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { creadoEn: "desc" },
      take: 50,
    }),
    prisma.pago.findMany({
      where: { ...filtro, eliminadoEn: null, estatus: "pendiente", fechaVencimiento: { lte: hoy } },
      include: { cliente: { select: { id: true, nombre: true } } },
    }),
    prisma.pago.aggregate({
      where: { ...filtro, eliminadoEn: null, estatus: "pagado", fechaPago: { gte: inicioMes } },
      _sum: { monto: true },
    }),
  ])

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet size={24} style={{ color: "var(--acento-pagos)" }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Pagos</h1>
            <p className="text-sm" style={{ color: "var(--texto-3)" }}>Lo que cobraste y lo que falta</p>
          </div>
        </div>
        <Link href="/pagos/nuevo" className="btn-marca text-sm">
          <Plus size={16} /> Registrar pago
        </Link>
      </div>

      {/* Resumen del mes */}
      <div className="card p-5">
        <p className="text-sm font-medium mb-1" style={{ color: "var(--texto-3)" }}>Cobrado este mes</p>
        <p className="text-3xl font-extrabold" style={{ color: "var(--texto)" }}>
          ${(totalMes._sum.monto ?? 0).toLocaleString("es-MX")} MXN
        </p>
      </div>

      {/* Pagos vencidos */}
      {pagosVencidos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1">
            <AlertTriangle size={16} style={{ color: "var(--rojo)" }} />
            <h2 className="text-sm font-bold text-red-500">Pagos vencidos ({pagosVencidos.length})</h2>
          </div>
          <div className="space-y-2">
            {pagosVencidos.map(p => (
              <div key={p.id} className="card border border-red-200 dark:border-red-900 flex items-center gap-3 px-4 py-3">
                <Wallet size={16} style={{ color: "var(--rojo)" }} />
                <div className="flex-1">
                  <Link href={`/clientes/${p.cliente.id}`} className="link-cliente text-sm font-semibold">{p.cliente.nombre}</Link>
                  <p className="text-xs" style={{ color: "var(--texto-3)" }}>{p.concepto ?? "Sin concepto"} · Venció {p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString("es-MX") : "—"}</p>
                </div>
                <span className="text-sm font-bold text-red-500">${p.monto.toLocaleString("es-MX")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de todos los pagos */}
      <div className="space-y-2">
        {pagos.length === 0 ? (
          <div className="card p-12 text-center">
            <Wallet size={32} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium" style={{ color: "var(--texto)" }}>Sin pagos registrados</p>
            <Link href="/pagos/nuevo" className="btn-marca mt-4 text-sm inline-flex">+ Registrar primer pago</Link>
          </div>
        ) : (
          pagos.map(p => (
            <div key={p.id} className="card flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
              <Wallet size={16} style={{ color: "var(--acento-pagos)" }} />
              <div className="flex-1 min-w-0">
                <Link href={`/clientes/${p.cliente.id}`} className="link-cliente text-sm font-semibold">{p.cliente.nombre}</Link>
                <p className="text-xs" style={{ color: "var(--texto-3)" }}>{p.metodo} · {p.concepto ?? "Sin concepto"}</p>
              </div>
              <BadgePago estatus={p.estatus} />
              <span className="text-sm font-bold ml-2" style={{ color: "var(--texto)" }}>
                ${p.monto.toLocaleString("es-MX")}
              </span>
              {p.fechaPago && (
                <span className="text-xs shrink-0" style={{ color: "var(--texto-3)" }}>
                  {new Date(p.fechaPago).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
