"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Plus, Star, MessageCircle, Mail, Edit3, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { Modal } from "@/components/ui/Modal"

interface Plantilla {
  id: string
  nombre: string
  tipo: string
  asunto: string | null
  cuerpo: string
  etapa: string | null
  objecion: string | null
  esFavorita: boolean
  esGlobal: boolean
  usuarioId: string | null
}

interface Props { plantillas: Plantilla[]; usuarioId: string; tieneIA: boolean }

const VARS = ["{nombre}", "{empresa}", "{etapa}", "{valor}", "{vendedor}", "{objecion}"]

export function PlantillasCliente({ plantillas: inicial, usuarioId, tieneIA }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [plantillas, setPlantillas] = useState(inicial)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Plantilla | null>(null)
  const [form, setForm] = useState({ nombre: "", tipo: "whatsapp", cuerpo: "", asunto: "", etapa: "" })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  function nuevaPlantilla() { setEditando(null); setForm({ nombre: "", tipo: "whatsapp", cuerpo: "", asunto: "", etapa: "" }); setModalAbierto(true) }
  function editarPlantilla(p: Plantilla) { setEditando(p); setForm({ nombre: p.nombre, tipo: p.tipo, cuerpo: p.cuerpo, asunto: p.asunto ?? "", etapa: p.etapa ?? "" }); setModalAbierto(true) }

  async function guardar() {
    const url = editando ? `/api/plantillas/${editando.id}` : "/api/plantillas"
    const method = editando ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (res.ok) {
      toast(editando ? "Plantilla actualizada ✓" : "Plantilla creada ✓", "exito")
      setModalAbierto(false)
      router.refresh()
    } else toast("No se pudo guardar", "error")
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return
    const res = await fetch(`/api/plantillas/${id}`, { method: "DELETE" })
    if (res.ok) { toast("Plantilla eliminada", "exito"); router.refresh() }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles size={24} style={{ color: "var(--acento-ia)" }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Plantillas y Asistente IA</h1>
            <p className="text-sm" style={{ color: "var(--texto-3)" }}>Mensajes que cierran, no que saludan</p>
          </div>
        </div>
        <button onClick={nuevaPlantilla} className="btn-marca text-sm"><Plus size={14} /> Nueva plantilla</button>
      </div>

      {!tieneIA && (
        <div className="card p-4" style={{ background: "var(--marca-light)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--marca-dark)" }}>
            💡 Activa el Asistente IA poniendo tu <code>ANTHROPIC_API_KEY</code> en las variables de entorno para respuestas personalizadas con IA.
          </p>
        </div>
      )}

      {/* Lista de plantillas */}
      {plantillas.length === 0 ? (
        <div className="card p-12 text-center">
          <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium" style={{ color: "var(--texto)" }}>Sin plantillas aún</p>
          <button onClick={nuevaPlantilla} className="btn-marca mt-4 text-sm">+ Crear mi primera plantilla</button>
        </div>
      ) : (
        <div className="space-y-2">
          {plantillas.map(p => (
            <div key={p.id} className="card p-4 flex items-start gap-3">
              <div className="mt-0.5">
                {p.tipo === "whatsapp" ? <MessageCircle size={16} style={{ color: "var(--verde)" }} /> : <Mail size={16} style={{ color: "var(--acento-clientes)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>{p.nombre}</p>
                  {p.esFavorita && <Star size={12} fill="var(--ambar)" stroke="none" />}
                  {p.esGlobal && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--border)", color: "var(--texto-3)" }}>Sistema</span>}
                </div>
                <p className="text-xs line-clamp-2" style={{ color: "var(--texto-3)" }}>{p.cuerpo}</p>
                {p.etapa && <p className="text-[10px] mt-1" style={{ color: "var(--texto-3)" }}>Etapa: {p.etapa}</p>}
              </div>
              {!p.esGlobal && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => editarPlantilla(p)} className="btn-secundario p-1.5 text-xs" aria-label="Editar"><Edit3 size={12} /></button>
                  <button onClick={() => eliminar(p.id)} className="btn-secundario p-1.5 text-xs text-red-500" aria-label="Eliminar"><Trash2 size={12} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva/editar plantilla */}
      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo={editando ? "Editar plantilla" : "Nueva plantilla"} maxAncho="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Nombre de la plantilla</label>
            <input value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="Ej: Primer contacto caliente" className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Tipo</label>
            <select value={form.tipo} onChange={e => set("tipo", e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
              <option value="whatsapp">WhatsApp</option>
              <option value="correo">Correo</option>
            </select>
          </div>
          {form.tipo === "correo" && (
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Asunto</label>
              <input value={form.asunto} onChange={e => set("asunto", e.target.value)} placeholder="Asunto del correo" className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
            </div>
          )}
          <div>
            <label className="text-sm font-medium block mb-1" style={{ color: "var(--texto-2)" }}>Mensaje</label>
            <p className="text-xs mb-2" style={{ color: "var(--texto-3)" }}>Variables que puedes usar: {VARS.join(", ")}</p>
            <textarea rows={5} value={form.cuerpo} onChange={e => set("cuerpo", e.target.value)} placeholder="Hola {nombre}, quería contactarte..." className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none" style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
          </div>
          <button onClick={guardar} className="btn-marca w-full justify-center text-sm">{editando ? "Guardar cambios" : "Crear plantilla"}</button>
        </div>
      </Modal>
    </div>
  )
}
