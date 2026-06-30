"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"
import { ArrowLeft, Save } from "lucide-react"

const ETAPAS = [
  "Lista de contactos","Invitación","Información","Presentación",
  "Seguimiento 1 resolver dudas","Seguimiento 2 envío de link de registro e instrucciones",
  "Seguimiento 3 Certificación PTA","Alta en ESCALA","Alta en grupos de difusión",
  "Alta en sistema back office","Duplicación","Primer viaje vendido",
  "3 viajes vendidos","5 viajes vendidos",
]

const ORIGENES = ["Instagram","Facebook","WhatsApp","Recomendado","Landing","TikTok","Otro"]
const OBJECIONES = ["Está caro","Lo voy a pensar","Tengo que consultarlo con mi pareja/socio","No es buen momento","Ninguna"]

interface Props { cliente: any }

export function EditarClienteForm({ cliente }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    nombre: cliente.nombre ?? "",
    telefono: cliente.telefono ?? "",
    correo: cliente.correo ?? "",
    origen: cliente.origen ?? "Instagram",
    zona: cliente.zona ?? "",
    etapa: cliente.etapa ?? "Lista de contactos",
    temperatura: cliente.temperatura ?? "TIBIO",
    objecion: cliente.objecion ?? "",
    valorEstimado: cliente.valorEstimado ?? 3500,
    empresa: cliente.empresa ?? "",
    notas: cliente.notas ?? "",
    proximaAccion: cliente.proximaAccion ?? "",
    proximaAccionFecha: cliente.proximaAccionFecha
      ? new Date(cliente.proximaAccionFecha).toISOString().slice(0, 16)
      : "",
  })
  const [cargando, setCargando] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    const body = {
      ...form,
      valorEstimado: Number(form.valorEstimado),
      proximaAccionFecha: form.proximaAccionFecha ? new Date(form.proximaAccionFecha).toISOString() : null,
    }
    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setCargando(false)
    if (res.ok) {
      toast("Cliente actualizado ✓", "exito")
      router.push(`/clientes/${cliente.id}`)
    } else {
      toast("No se pudo guardar", "error")
    }
  }

  const campo = (label: string, key: string, tipo = "text", placeholder = "") => (
    <div>
      <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>{label}</label>
      <input
        type={tipo}
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
        style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
      />
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
          <ArrowLeft size={20} style={{ color: "var(--texto-2)" }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: "var(--texto)" }}>Editar cliente</h1>
      </div>

      <form onSubmit={guardar} className="card p-5 space-y-4">
        {campo("Nombre completo *", "nombre", "text", "Nombre Apellido")}
        {campo("Teléfono (sin +52)", "telefono", "tel", "9981234567")}
        {campo("Correo electrónico", "correo", "email", "correo@ejemplo.com")}
        {campo("Zona / Ciudad", "zona", "text", "Cancún, Q. Roo")}
        {campo("Empresa (opcional)", "empresa", "text", "Nombre de empresa")}

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Origen</label>
          <select value={form.origen} onChange={e => set("origen", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
            {ORIGENES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Etapa del embudo</label>
          <select value={form.etapa} onChange={e => set("etapa", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
            {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Temperatura</label>
          <div className="flex gap-2">
            {[["CALIENTE","🔥 Caliente"],["TIBIO","🌡️ Tibio"],["FRIO","❄️ Frío"]].map(([val, label]) => (
              <button key={val} type="button" onClick={() => set("temperatura", val)}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: form.temperatura === val ? "var(--marca)" : "var(--bg)",
                  color: form.temperatura === val ? "white" : "var(--texto-2)",
                  border: `1px solid ${form.temperatura === val ? "var(--marca)" : "var(--border)"}`,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Objeción principal</label>
          <select value={form.objecion} onChange={e => set("objecion", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
            <option value="">Sin objeción</option>
            {OBJECIONES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Paquete elegido</label>
          <select value={form.valorEstimado} onChange={e => set("valorEstimado", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
            <option value="">Sin paquete aún</option>
            <option value="0">EVO YZ — $0</option>
            <option value="68.99">EVO Basics — $68.99</option>
            <option value="79.98">EVO Essentials — $79.98</option>
            <option value="299.00">EVO Bundle — $299.00</option>
          </select>
        </div>

        {campo("Próxima acción", "proximaAccion", "text", "Llamar y resolver dudas de precio")}

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Fecha de próxima acción</label>
          <input type="datetime-local" value={form.proximaAccionFecha} onChange={e => set("proximaAccionFecha", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Notas generales</label>
          <textarea rows={3} value={form.notas} onChange={e => set("notas", e.target.value)}
            placeholder="Notas internas sobre este cliente…"
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secundario flex-1 justify-center text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={cargando || !form.nombre} className="btn-marca flex-1 justify-center text-sm gap-2">
            <Save size={16} />
            {cargando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}
