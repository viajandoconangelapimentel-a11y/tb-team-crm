"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { InfoTooltip } from "@/components/ui/Tooltip"

const ETAPAS = [
  "Lista de contactos", "Información", "Invitación", "Presentación",
  "Seguimiento 1 resolver dudas", "Seguimiento 2 envío de link de registro e instrucciones",
  "Seguimiento 3 Certificación PTA", "Alta en ESCALA", "Alta en grupos de difusión",
  "Sesión Presentación Zoom", "Contacto semana 1", "Contacto semana 2",
  "Contacto semana 3", "Contacto semana 4"
]

const ORIGENES = ["Instagram", "Facebook", "WhatsApp", "Recomendado", "Landing", "Agenda", "Evento", "Otro"]
const OBJECIONES = ["Está caro", "Lo voy a pensar", "Tengo que consultarlo con mi pareja/socio", "No es buen momento", "Otra"]

export default function NuevoClientePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cargando, setCargando] = useState(false)
  const [duplicado, setDuplicado] = useState<{ id: string; nombre: string } | null>(null)
  const [form, setForm] = useState({
    nombre: "", telefono: "", correo: "", origen: "Instagram",
    etapa: "Lista de contactos", temperatura: "TIBIO",
    objecion: "", valorEstimado: "", proximaAccion: "", proximaAccionFecha: "",
    zona: "", notas: "",
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setCargando(true)
    setDuplicado(null)

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          valorEstimado: form.valorEstimado ? parseFloat(form.valorEstimado) : 0,
        }),
      })

      if (res.status === 409) {
        const data = await res.json()
        setDuplicado(data.clienteExistente)
        setCargando(false)
        return
      }

      if (!res.ok) throw new Error()
      const data = await res.json()
      toast("Cliente agregado ✓", "exito")
      router.push(`/clientes/${data.cliente.id}`)
    } catch {
      toast("No se pudo guardar. Inténtalo de nuevo.", "error")
      setCargando(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link href="/clientes" className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: "var(--texto-3)" }}>
        <ChevronLeft size={16} /> Volver a clientes
      </Link>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Agregar cliente</h1>
        <p className="text-sm" style={{ color: "var(--texto-3)" }}>Campos con * son obligatorios</p>
      </div>

      {/* Alerta de duplicado */}
      {duplicado && (
        <div className="card p-4 flex items-center gap-3" style={{ background: "rgba(234,179,8,0.08)" }}>
          <AlertTriangle size={18} style={{ color: "var(--ambar)" }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--texto)" }}>
              Ya tienes a <strong>{duplicado.nombre}</strong> con ese número de WhatsApp.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/clientes/${duplicado.id}`} className="btn-marca text-xs">Abrir su ficha</Link>
            <button onClick={() => setDuplicado(null)} className="btn-secundario text-xs">Crear de todos modos</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Nombre completo *</label>
          <input
            required
            value={form.nombre}
            onChange={e => set("nombre", e.target.value)}
            placeholder="Ej: Valeria Sánchez Torres"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: "var(--texto-2)" }}>
              WhatsApp
              <InfoTooltip texto="Número de WhatsApp" consejo="Ponlo con lada, ej: 99 8123 4567. Se usará para el botón de WhatsApp directo." />
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => set("telefono", e.target.value)}
              placeholder="998 123 4567"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--texto-3)" }}>Con lada, ej: 998 123 4567</p>
          </div>

          {/* Correo */}
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Correo electrónico</label>
            <input
              type="email"
              value={form.correo}
              onChange={e => set("correo", e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Origen */}
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>¿Cómo llegó?</label>
            <select
              value={form.origen}
              onChange={e => set("origen", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            >
              {ORIGENES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Temperatura */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: "var(--texto-2)" }}>
              Temperatura
              <InfoTooltip texto="¿Qué tan cerca está de comprar?" consejo="🔥 Caliente = atiéndelo hoy. 🔵 Frío = a futuro. Gasta tu energía en los calientes." />
            </label>
            <select
              value={form.temperatura}
              onChange={e => set("temperatura", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            >
              <option value="CALIENTE">🔥 Caliente</option>
              <option value="TIBIO">🟡 Tibio</option>
              <option value="FRIO">🔵 Frío</option>
            </select>
          </div>
        </div>

        {/* Etapa */}
        <div>
          <label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: "var(--texto-2)" }}>
            Etapa del embudo
            <InfoTooltip texto="Etapa actual del proceso de venta" consejo="Muévelo de etapa en el Embudo conforme avance." />
          </label>
          <select
            value={form.etapa}
            onChange={e => set("etapa", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
          >
            {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Objeción */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: "var(--texto-2)" }}>
              Objeción principal
              <InfoTooltip texto="La razón por la que NO te ha comprado" consejo="Anótala apenas la oigas: es lo que vas a vencer para cerrar." />
            </label>
            <select
              value={form.objecion}
              onChange={e => set("objecion", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            >
              <option value="">Sin objeción aún</option>
              {OBJECIONES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Paquete elegido */}
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: "var(--texto-2)" }}>
              Paquete elegido
              <InfoTooltip texto="¿Qué paquete eligió o le interesa a este cliente?" consejo="El valor se llena automáticamente según el paquete." />
            </label>
            <select
              value={form.valorEstimado}
              onChange={e => set("valorEstimado", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            >
              <option value="">Sin paquete aún</option>
              <option value="68.99">EVO Basics — $68.99</option>
              <option value="79.98">EVO Essentials — $79.98</option>
              <option value="299.00">EVO Bundle — $299.00</option>
            </select>
          </div>
        </div>

        {/* Próxima acción */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-1.5" style={{ color: "var(--texto-2)" }}>
              Próxima acción
              <InfoTooltip texto="El siguiente paso con este cliente" consejo="Si lo dejas vacío, el cliente se te enfría. Siempre déjale una acción." />
            </label>
            <input
              value={form.proximaAccion}
              onChange={e => set("proximaAccion", e.target.value)}
              placeholder="Ej: Llamar y agendar cita"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>¿Para cuándo?</label>
            <input
              type="date"
              value={form.proximaAccionFecha}
              onChange={e => set("proximaAccionFecha", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            />
          </div>
        </div>

        {/* Zona */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Zona / Ubicación</label>
          <input
            value={form.zona}
            onChange={e => set("zona", e.target.value)}
            placeholder="Ej: Cancún, Playa del Carmen…"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
          />
        </div>

        {/* Notas */}
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Notas iniciales</label>
          <textarea
            rows={3}
            value={form.notas}
            onChange={e => set("notas", e.target.value)}
            placeholder="Algo importante que quieras recordar de este cliente…"
            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/clientes" className="btn-secundario text-sm">Cancelar</Link>
          <button type="submit" disabled={cargando} className="btn-marca text-sm flex-1 justify-center">
            {cargando ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : "Guardar cliente"}
          </button>
        </div>
      </form>
    </div>
  )
}
