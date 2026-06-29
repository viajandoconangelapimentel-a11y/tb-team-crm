import { CheckCircle2, XCircle, Archive, Circle, Trophy } from "lucide-react"

export function BadgeEstado({ estado }: { estado: string }) {
  const config: Record<string, { label: string; clase: string; icono: React.ReactNode }> = {
    ACTIVO: { label: "Activo", clase: "badge-activo", icono: <Circle size={10} fill="currentColor" /> },
    GANADO: { label: "Ganado", clase: "badge-ganado", icono: <Trophy size={10} /> },
    PERDIDO: { label: "Perdido", clase: "badge-perdido", icono: <XCircle size={10} /> },
    ARCHIVADO: { label: "Archivado", clase: "badge-archivado", icono: <Archive size={10} /> },
  }
  const { label, clase, icono } = config[estado] ?? config.ACTIVO
  return <span className={`badge ${clase}`}>{icono}{label}</span>
}

export function BadgeTemperatura({ temp }: { temp: string }) {
  const map: Record<string, string> = { CALIENTE: "🔥 Caliente", TIBIO: "🟡 Tibio", FRIO: "🔵 Frío" }
  return <span className="badge" style={{ background: "var(--border)", color: "var(--texto-2)" }}>{map[temp] ?? temp}</span>
}

export function BadgePago({ estatus }: { estatus: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pagado: { label: "Pagado", color: "badge-ganado" },
    pendiente: { label: "Pendiente", color: "badge-activo" },
    vencido: { label: "Vencido", color: "border border-red-400/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400" },
  }
  const { label, color } = map[estatus] ?? map.pendiente
  return <span className={`badge ${color}`}>{label}</span>
}
