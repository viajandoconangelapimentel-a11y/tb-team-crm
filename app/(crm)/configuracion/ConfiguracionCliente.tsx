"use client"
import { useState } from "react"
import { useToast } from "@/components/ui/Toast"
import { Settings } from "lucide-react"
import { SelectorTema } from "@/components/ui/SelectorTema"

interface Props {
  config: any
  esAdmin: boolean
}

export function ConfiguracionCliente({ config, esAdmin }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    nombreNegocio: config?.nombreNegocio ?? "TB Team Agentes Yaz",
    colorMarca: config?.colorMarca ?? "#e07ba8",
    moneda: config?.moneda ?? "MXN",
    husoHorario: config?.husoHorario ?? "America/Cancun",
    horarioInicio: config?.horarioInicio ?? "09:00",
    horarioFin: config?.horarioFin ?? "12:00",
    metaMesClientes: config?.metaMesClientes ?? 10,
    mensajeWhatsapp: config?.mensajeWhatsapp ?? "",
  })
  const [cargando, setCargando] = useState(false)
  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    const res = await fetch("/api/configuracion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setCargando(false)
    if (res.ok) toast("Configuración guardada ✓", "exito")
    else toast("No se pudo guardar la configuración", "error")
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={24} style={{ color: "var(--marca)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Configuración</h1>
      </div>

      {/* Apariencia — disponible para todos */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--texto)" }}>Apariencia</p>
        <SelectorTema />
      </div>

      {/* Configuración del negocio — solo admin */}
      {esAdmin && (
        <form onSubmit={guardar} className="card p-5 space-y-4">
          <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Negocio (solo admin)</p>

          {[
            { label: "Nombre del negocio", key: "nombreNegocio", type: "text" },
            { label: "Horario inicio (citas)", key: "horarioInicio", type: "time" },
            { label: "Horario fin (citas)", key: "horarioFin", type: "time" },
            { label: "Meta del mes (clientes)", key: "metaMesClientes", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => set(f.key, f.type === "number" ? parseInt(e.target.value) : e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Color de marca</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.colorMarca} onChange={e => set("colorMarca", e.target.value)} className="w-12 h-10 rounded cursor-pointer" />
              <span className="text-sm font-mono" style={{ color: "var(--texto-2)" }}>{form.colorMarca}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Moneda</label>
            <select value={form.moneda} onChange={e => set("moneda", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
              {["MXN", "USD", "EUR", "COP", "ARS"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Mensaje tipo de WhatsApp</label>
            <textarea rows={3} value={form.mensajeWhatsapp} onChange={e => set("mensajeWhatsapp", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              placeholder="Hola {nombre}, mi nombre es Yazmín Leal..." />
            <p className="text-xs mt-1" style={{ color: "var(--texto-3)" }}>Usa {"{nombre}"} para el nombre del cliente</p>
          </div>

          <button type="submit" disabled={cargando} className="btn-marca w-full justify-center text-sm">
            {cargando ? "Guardando…" : "Guardar configuración"}
          </button>
        </form>
      )}
    </div>
  )
}
