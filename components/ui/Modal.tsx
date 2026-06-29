"use client"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: React.ReactNode
  maxAncho?: string
}

export function Modal({ abierto, onCerrar, titulo, children, maxAncho = "max-w-lg" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar() }
    document.addEventListener("keydown", handler)
    // Trampa de foco
    panelRef.current?.focus()
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative card-glass w-full ${maxAncho} max-h-[90vh] overflow-y-auto p-6 focus:outline-none`}
        style={{ zIndex: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-titulo" className="text-lg font-semibold" style={{ color: "var(--texto)" }}>
            {titulo}
          </h2>
          <button
            onClick={onCerrar}
            className="rounded-lg p-1.5 hover:bg-[var(--border)] transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ModalConfirmacion({
  abierto,
  onCerrar,
  onConfirmar,
  titulo,
  mensaje,
  labelConfirmar = "Confirmar",
  peligroso = false,
  cargando = false,
}: {
  abierto: boolean
  onCerrar: () => void
  onConfirmar: () => void
  titulo: string
  mensaje: string
  labelConfirmar?: string
  peligroso?: boolean
  cargando?: boolean
}) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo} maxAncho="max-w-sm">
      <p className="text-sm mb-5" style={{ color: "var(--texto-2)" }}>{mensaje}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCerrar} className="btn-secundario text-sm">Cancelar</button>
        <button
          onClick={onConfirmar}
          disabled={cargando}
          className={`btn-marca text-sm ${peligroso ? "!bg-red-600 hover:!bg-red-700" : ""}`}
        >
          {cargando ? "Procesando…" : labelConfirmar}
        </button>
      </div>
    </Modal>
  )
}
