"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Search, User, CalendarDays, Wallet, FileText, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Resultado {
  tipo: "cliente" | "cita" | "pago" | "nota"
  id: string
  titulo: string
  subtitulo?: string
  href: string
}

export function BuscadorGlobal() {
  const [abierto, setAbierto] = useState(false)
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [cargando, setCargando] = useState(false)
  const [seleccionado, setSeleccionado] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Atajo de teclado / o Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault()
        setAbierto(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const buscar = useCallback(async (q: string) => {
    if (q.length < 2) { setResultados([]); return }
    setCargando(true)
    try {
      const res = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResultados(data.resultados ?? [])
    } catch { setResultados([]) }
    finally { setCargando(false) }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => buscar(query), 250)
    return () => clearTimeout(timer)
  }, [query, buscar])

  function cerrar() { setAbierto(false); setQuery(""); setResultados([]) }

  const iconos: Record<string, React.ElementType> = { cliente: User, cita: CalendarDays, pago: Wallet, nota: FileText }
  const etiquetas: Record<string, string> = { cliente: "Cliente", cita: "Cita", pago: "Pago", nota: "Nota" }

  return (
    <>
      {/* Botón de búsqueda */}
      <button
        onClick={() => { setAbierto(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
        style={{ background: "var(--border)", color: "var(--texto-3)" }}
        aria-label="Buscar"
      >
        <Search size={16} />
        <span className="hidden sm:block">Buscar…</span>
        <kbd className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border-strong)]">⌘K</kbd>
      </button>

      {/* Overlay */}
      {abierto && (
        <div className="fixed inset-0 z-[800] p-4 flex flex-col items-center pt-20" onClick={cerrar}>
          <div
            className="card-glass w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <Search size={18} style={{ color: "var(--texto-3)" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSeleccionado(0) }}
                placeholder="Busca clientes, citas, pagos, notas…"
                className="flex-1 bg-transparent text-base outline-none"
                style={{ color: "var(--texto)" }}
                onKeyDown={e => {
                  if (e.key === "ArrowDown") setSeleccionado(s => Math.min(s + 1, resultados.length - 1))
                  if (e.key === "ArrowUp") setSeleccionado(s => Math.max(s - 1, 0))
                  if (e.key === "Enter" && resultados[seleccionado]) {
                    router.push(resultados[seleccionado].href)
                    cerrar()
                  }
                  if (e.key === "Escape") cerrar()
                }}
                aria-label="Buscar en el sistema"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpiar">
                  <X size={16} style={{ color: "var(--texto-3)" }} />
                </button>
              )}
            </div>

            {/* Resultados */}
            <div className="max-h-72 overflow-y-auto">
              {cargando && (
                <p className="text-center py-6 text-sm" style={{ color: "var(--texto-3)" }}>Buscando…</p>
              )}
              {!cargando && query.length >= 2 && resultados.length === 0 && (
                <div className="text-center py-8 px-4">
                  <Search size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No encontré nada con &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1" style={{ color: "var(--texto-3)" }}>Revisa cómo lo escribiste o</p>
                  <Link
                    href="/clientes/nuevo"
                    onClick={cerrar}
                    className="btn-marca mt-3 text-xs"
                  >
                    + Crear cliente nuevo
                  </Link>
                </div>
              )}
              {resultados.map((r, i) => {
                const Icono = iconos[r.tipo]
                return (
                  <Link
                    key={r.id}
                    href={r.href}
                    onClick={cerrar}
                    className="flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{
                      background: i === seleccionado ? "var(--marca-light)" : "transparent",
                      color: "var(--texto)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--border)" }}>
                      <Icono size={14} style={{ color: "var(--marca)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.titulo}</p>
                      {r.subtitulo && <p className="text-xs truncate" style={{ color: "var(--texto-3)" }}>{r.subtitulo}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--border)", color: "var(--texto-3)" }}>
                      {etiquetas[r.tipo]}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
