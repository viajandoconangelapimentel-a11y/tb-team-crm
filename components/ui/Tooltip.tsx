"use client"
import { useState, useRef } from "react"
import { Info } from "lucide-react"

interface TooltipProps {
  texto: string
  consejo?: string
  children?: React.ReactNode
}

export function Tooltip({ texto, consejo, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="inline-flex items-center"
        aria-label="Más información"
      >
        {children ?? <Info size={14} style={{ color: "var(--texto-3)" }} />}
      </button>
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 card-glass p-3 text-xs"
          style={{ color: "var(--texto-2)" }}
        >
          <p className="font-medium mb-1" style={{ color: "var(--texto)" }}>{texto}</p>
          {consejo && (
            <p className="opacity-80">💡 {consejo}</p>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--bg-card)]" />
        </div>
      )}
    </div>
  )
}

// Versión con ícono "i" integrado para campos de formulario
export function InfoTooltip({ texto, consejo }: { texto: string; consejo?: string }) {
  return <Tooltip texto={texto} consejo={consejo} />
}
