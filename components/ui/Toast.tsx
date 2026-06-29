"use client"
import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle, XCircle, Info, X } from "lucide-react"

type ToastTipo = "exito" | "error" | "info"
interface ToastItem {
  id: string
  mensaje: string
  tipo: ToastTipo
  accionLabel?: string
  accion?: () => void
}

const ToastContext = createContext<{
  toast: (msg: string, tipo?: ToastTipo, accionLabel?: string, accion?: () => void) => void
}>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((mensaje: string, tipo: ToastTipo = "exito", accionLabel?: string, accion?: () => void) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, mensaje, tipo, accionLabel, accion }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  function quitar(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const iconos = { exito: CheckCircle, error: XCircle, info: Info }
  const colores = {
    exito: "border-green-500/30 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300",
    error: "border-red-500/30 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300",
    info: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300",
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const Icono = iconos[t.tipo]
          return (
            <div
              key={t.id}
              className={`card border pointer-events-auto flex items-start gap-3 px-4 py-3 ${colores[t.tipo]}`}
              role="alert"
            >
              <Icono size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1 text-sm font-medium">{t.mensaje}</span>
              {t.accionLabel && t.accion && (
                <button
                  onClick={() => { t.accion!(); quitar(t.id) }}
                  className="text-xs underline font-semibold shrink-0"
                >
                  {t.accionLabel}
                </button>
              )}
              <button onClick={() => quitar(t.id)} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Cerrar">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
