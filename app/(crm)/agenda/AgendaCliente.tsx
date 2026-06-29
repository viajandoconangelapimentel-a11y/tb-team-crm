"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarDays, Plus, Video, Clock } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { Modal } from "@/components/ui/Modal"

interface Cita {
  id: string
  titulo: string
  inicio: string
  fin: string
  meetLink: string | null
  notas: string | null
  cliente: { id: string; nombre: string } | null
  vendedor: { nombre: string } | null
}

interface Props {
  citas: Cita[]
  clientes: { id: string; nombre: string }[]
  usuarioId: string
  esAdmin: boolean
  mesActual: number
  anioActual: number
}

export function AgendaCliente({ citas, clientes, mesActual, anioActual }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({
    titulo: "", clienteId: "", fecha: "", hora: "09:00", duracion: "30", notas: ""
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  // Agrupar citas por día
  const citasPorDia: Record<string, Cita[]> = {}
  citas.forEach(c => {
    const dia = new Date(c.inicio).toDateString()
    if (!citasPorDia[dia]) citasPorDia[dia] = []
    citasPorDia[dia].push(c)
  })

  async function agendarCita(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    const inicio = new Date(`${form.fecha}T${form.hora}:00`)
    const fin = new Date(inicio.getTime() + parseInt(form.duracion) * 60 * 1000)

    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: form.titulo, clienteId: form.clienteId || undefined, inicio: inicio.toISOString(), fin: fin.toISOString(), notas: form.notas }),
    })
    setCargando(false)
    if (res.ok) {
      toast("Cita agendada ✓ — Si tienes Google Calendar conectado, el evento se creó ahí también.", "exito")
      setModalAbierto(false)
      router.refresh()
    } else toast("No se pudo agendar la cita", "error")
  }

  const hoy = new Date()
  const diasDelMes = new Date(anioActual, mesActual + 1, 0).getDate()
  const primerDia = new Date(anioActual, mesActual, 1).getDay()
  const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays size={24} style={{ color: "var(--acento-agenda)" }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Agenda</h1>
            <p className="text-sm" style={{ color: "var(--texto-3)" }}>Tus citas, organizadas solas</p>
          </div>
        </div>
        <button onClick={() => setModalAbierto(true)} className="btn-marca text-sm">
          <Plus size={16} /> Agendar cita
        </button>
      </div>

      {/* Calendario visual */}
      <div className="card p-5">
        <p className="text-center font-semibold mb-4" style={{ color: "var(--texto)" }}>{MESES[mesActual]} {anioActual}</p>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS.map(d => <p key={d} className="text-center text-xs font-medium" style={{ color: "var(--texto-3)" }}>{d}</p>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: primerDia }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: diasDelMes }).map((_, i) => {
            const dia = i + 1
            const fecha = new Date(anioActual, mesActual, dia)
            const esHoy = fecha.toDateString() === hoy.toDateString()
            const tieneCita = citasPorDia[fecha.toDateString()]
            const esFueraDiasLaborales = fecha.getDay() === 0 || fecha.getDay() === 6
            return (
              <div
                key={dia}
                className="aspect-square flex flex-col items-center justify-center rounded-lg relative cursor-pointer hover:bg-[var(--border)] transition-colors text-sm"
                style={{
                  background: esHoy ? "var(--marca)" : "transparent",
                  color: esHoy ? "white" : esFueraDiasLaborales ? "var(--texto-3)" : "var(--texto)",
                  opacity: esFueraDiasLaborales ? 0.4 : 1,
                }}
                onClick={() => { if (!esFueraDiasLaborales) { const d = new Date(anioActual, mesActual, dia); setForm(prev => ({ ...prev, fecha: d.toISOString().slice(0, 10) })); setModalAbierto(true) } }}
                title={tieneCita ? `${tieneCita.length} cita(s)` : esFueraDiasLaborales ? "Fin de semana" : "Sin citas"}
              >
                {dia}
                {tieneCita && <div className="w-1 h-1 rounded-full absolute bottom-1" style={{ background: esHoy ? "white" : "var(--marca)" }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista de citas */}
      <div className="space-y-2">
        {Object.keys(citasPorDia).length === 0 ? (
          <div className="card p-8 text-center">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium" style={{ color: "var(--texto)" }}>Sin citas este mes</p>
            <button onClick={() => setModalAbierto(true)} className="btn-marca mt-4 text-sm">+ Agendar primera cita</button>
          </div>
        ) : (
          Object.entries(citasPorDia).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime()).map(([dia, citas]) => (
            <div key={dia}>
              <p className="text-xs font-semibold px-1 mb-1.5" style={{ color: "var(--texto-3)" }}>
                {new Date(dia).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {citas.map(c => (
                <div key={c.id} className="card flex items-center gap-3 px-4 py-3 mb-1 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="text-center w-12 shrink-0">
                    <p className="text-lg font-bold" style={{ color: "var(--acento-agenda)" }}>
                      {new Date(c.inicio).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--texto-3)" }}>
                      {new Date(c.fin).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>{c.titulo}</p>
                    {c.cliente && <Link href={`/clientes/${c.cliente.id}`} className="link-cliente text-xs">{c.cliente.nombre}</Link>}
                  </div>
                  {c.meetLink && (
                    <a href={c.meetLink} target="_blank" rel="noopener noreferrer" className="btn-marca text-xs py-1.5 px-3 shrink-0">
                      <Video size={12} /> Meet
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Modal agendar */}
      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Agendar cita">
        <div className="mb-3 text-sm" style={{ background: "var(--marca-light)", color: "var(--marca-dark)", padding: "8px 12px", borderRadius: 8 }}>
          💡 Si tienes Google Calendar conectado, el evento se creará automáticamente.
        </div>
        <form onSubmit={agendarCita} className="space-y-4">
          {[
            { label: "Título de la cita", key: "titulo", type: "text", placeholder: "Ej: Llamada con María González" },
            { label: "Fecha", key: "fecha", type: "date" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>{f.label}</label>
              <input
                required
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Hora (09:00–12:00)</label>
              <input type="time" min="09:00" max="12:00" value={form.hora} onChange={e => set("hora", e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Duración</label>
              <select value={form.duracion} onChange={e => set("duracion", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
                <option value="30">30 minutos</option>
                <option value="60">1 hora</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Cliente (opcional)</label>
            <select value={form.clienteId} onChange={e => set("clienteId", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
              <option value="">Sin cliente asignado</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <button type="submit" disabled={cargando} className="btn-marca w-full justify-center text-sm">
            {cargando ? "Agendando…" : "Agendar cita"}
          </button>
        </form>
      </Modal>
    </div>
  )
}
