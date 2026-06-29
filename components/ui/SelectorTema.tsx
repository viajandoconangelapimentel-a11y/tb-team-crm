"use client"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTema } from "@/components/TemaProvider"

const OPCIONES = [
  { valor: "claro" as const, icono: Sun, label: "Claro" },
  { valor: "oscuro" as const, icono: Moon, label: "Oscuro" },
  { valor: "automatico" as const, icono: Monitor, label: "Auto" },
]

export function SelectorTema({ compacto = false }: { compacto?: boolean }) {
  const { tema, setTema } = useTema()

  if (compacto) {
    const Icono = OPCIONES.find(o => o.valor === tema)?.icono ?? Monitor
    return (
      <button
        onClick={() => {
          const idx = OPCIONES.findIndex(o => o.valor === tema)
          setTema(OPCIONES[(idx + 1) % 3].valor)
        }}
        className="flex items-center justify-center px-3 py-2 rounded-lg transition-colors hover:bg-[var(--border)] w-full"
        style={{ color: "var(--texto-3)" }}
        aria-label="Cambiar tema"
      >
        <Icono size={16} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1">
      {OPCIONES.map(({ valor, icono: Icono, label }) => (
        <button
          key={valor}
          onClick={() => setTema(valor)}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg flex-1 transition-all text-xs"
          style={{
            background: tema === valor ? "var(--marca-light)" : "transparent",
            color: tema === valor ? "var(--marca-dark)" : "var(--texto-3)",
            fontWeight: tema === valor ? 600 : 400,
          }}
          aria-pressed={tema === valor}
          title={label}
        >
          <Icono size={14} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
