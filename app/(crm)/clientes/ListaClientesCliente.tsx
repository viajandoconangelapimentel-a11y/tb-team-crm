"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Star, StarOff, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react"
import { BadgeTemperatura, BadgeEstado } from "@/components/ui/Badge"

interface Cliente {
  id: string
  nombre: string
  telefono: string | null
  correo: string | null
  etapa: string
  estado: string
  temperatura: string
  valorEstimado: number
  proximaAccion: string | null
  proximaAccionFecha: string | null
  origen: string | null
  etiquetas: { etiqueta: { nombre: string; color: string } }[]
  vendedor: { nombre: string } | null
}

interface Props {
  clientes: Cliente[]
  total: number
  pagina: number
  porPagina: number
  etapas: string[]
  etiquetas: { id: string; nombre: string; color: string }[]
  esAdmin: boolean
  filtros: { q: string; temperatura: string; etapa: string; origen: string }
}

export function ListaClientesCliente({ clientes, total, pagina, porPagina, etapas, esAdmin, filtros }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [filtroAbierto, setFiltroAbierto] = useState(false)
  const totalPaginas = Math.ceil(total / porPagina)

  function irA(params: Record<string, string>) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
    router.push(`${pathname}?${sp.toString()}`)
  }

  function limpiarFiltros() {
    router.push(pathname)
  }

  const hayFiltros = filtros.q || filtros.temperatura || filtros.etapa || filtros.origen
  const hoy = new Date()

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--texto-3)" }} />
          <input
            type="search"
            placeholder="Buscar por nombre, teléfono, correo…"
            defaultValue={filtros.q}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            onChange={e => {
              const v = e.target.value
              setTimeout(() => irA({ ...filtros, q: v, pagina: "1" }), 300)
            }}
          />
        </div>
        <button
          onClick={() => setFiltroAbierto(f => !f)}
          className="btn-secundario text-sm relative"
        >
          <Filter size={14} /> Filtros
          {hayFiltros && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />}
        </button>
        {hayFiltros && (
          <button onClick={limpiarFiltros} className="btn-secundario text-sm text-red-500">
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {filtroAbierto && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--texto-3)" }}>Temperatura</label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              value={filtros.temperatura}
              onChange={e => irA({ ...filtros, temperatura: e.target.value, pagina: "1" })}
            >
              <option value="">Todas</option>
              <option value="CALIENTE">🔥 Caliente</option>
              <option value="TIBIO">🟡 Tibio</option>
              <option value="FRIO">🔵 Frío</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--texto-3)" }}>Etapa</label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              value={filtros.etapa}
              onChange={e => irA({ ...filtros, etapa: e.target.value, pagina: "1" })}
            >
              <option value="">Todas</option>
              {etapas.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--texto-3)" }}>Origen</label>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              value={filtros.origen}
              onChange={e => irA({ ...filtros, origen: e.target.value, pagina: "1" })}
            >
              <option value="">Todos</option>
              {["Instagram", "Facebook", "WhatsApp", "Recomendado", "Landing", "Agenda"].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Contador */}
      <p className="text-sm" style={{ color: "var(--texto-3)" }}>
        Mostrando {Math.min(porPagina, clientes.length)} de {total} clientes activos
      </p>

      {/* Lista */}
      {clientes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-medium mb-2" style={{ color: "var(--texto)" }}>
            {hayFiltros ? "Ningún cliente con estos filtros" : "Aún no tienes clientes"}
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--texto-3)" }}>
            {hayFiltros ? "Prueba quitar algún filtro." : "¡Agrega tu primer cliente y empieza a vender!"}
          </p>
          {!hayFiltros && (
            <Link href="/clientes/nuevo" className="btn-marca text-sm">+ Agregar cliente</Link>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {clientes.map(c => {
            const vencida = c.proximaAccionFecha && new Date(c.proximaAccionFecha) < hoy
            return (
              <div
                key={c.id}
                className="card flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: "var(--marca)" }}
                  aria-hidden="true"
                >
                  {c.nombre[0]?.toUpperCase()}
                </div>

                {/* Nombre + info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="link-cliente font-medium text-sm"
                    title={`Ver expediente de ${c.nombre}`}
                  >
                    {c.nombre}
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-xs" style={{ color: "var(--texto-3)" }}>{c.etapa}</span>
                    {c.etiquetas.slice(0, 2).map(({ etiqueta: e }) => (
                      <span
                        key={e.nombre}
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: e.color + "22", color: e.color }}
                      >
                        {e.nombre}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Temperatura */}
                <div className="hidden sm:block shrink-0">
                  <BadgeTemperatura temp={c.temperatura} />
                </div>

                {/* Valor */}
                {c.valorEstimado > 0 && (
                  <span className="hidden md:block text-sm font-medium shrink-0" style={{ color: "var(--acento-pagos)" }}>
                    ${c.valorEstimado.toLocaleString("es-MX")}
                  </span>
                )}

                {/* Próxima acción */}
                {c.proximaAccion && (
                  <div className="hidden lg:flex flex-col items-end shrink-0 max-w-[140px]">
                    <span className={`text-xs font-medium truncate ${vencida ? "text-red-500" : ""}`} style={!vencida ? { color: "var(--texto-3)" } : {}}>
                      {vencida && "⚠️ "}
                      {c.proximaAccion.slice(0, 30)}
                    </span>
                    {c.proximaAccionFecha && (
                      <span className="text-[10px]" style={{ color: "var(--texto-3)" }}>
                        {new Date(c.proximaAccionFecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => irA({ ...filtros, pagina: String(pagina - 1) })}
            disabled={pagina <= 1}
            className="btn-secundario p-2 disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm px-3" style={{ color: "var(--texto-2)" }}>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => irA({ ...filtros, pagina: String(pagina + 1) })}
            disabled={pagina >= totalPaginas}
            className="btn-secundario p-2 disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
