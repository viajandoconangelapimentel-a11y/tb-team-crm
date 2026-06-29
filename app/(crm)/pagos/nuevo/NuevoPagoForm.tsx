"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"
import { ArrowLeft, DollarSign } from "lucide-react"

interface Props { clientes: { id: string; nombre: string; telefono: string | null }[] }

export function NuevoPagoForm({ clientes }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({
    clienteId: "",
    monto: 3500,
    metodo: "Transferencia",
    estatus: "pagado",
    concepto: "Afiliación TB Team",
    esParcialidad: false,
    totalContrato: 3500,
    fechaPago: new Date().toISOString().slice(0, 10),
    fechaVencimiento: "",
    notas: "",
  })
  const [cargando, setCargando] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clienteId) { toast("Selecciona un cliente", "error"); return }
    setCargando(true)
    const body = {
      ...form,
      monto: Number(form.monto),
      totalContrato: Number(form.totalContrato),
      fechaPago: form.estatus === "pagado" && form.fechaPago ? new Date(form.fechaPago).toISOString() : null,
      fechaVencimiento: form.fechaVencimiento ? new Date(form.fechaVencimiento).toISOString() : null,
    }
    const res = await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setCargando(false)
    if (res.ok) {
      toast("Pago registrado ✓", "exito")
      router.push("/pagos")
    } else {
      const data = await res.json().catch(() => ({}))
      toast(data.error ?? "No se pudo registrar el pago", "error")
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
          <ArrowLeft size={20} style={{ color: "var(--texto-2)" }} />
        </button>
        <div className="flex items-center gap-2">
          <DollarSign size={22} style={{ color: "var(--marca)" }} />
          <h1 className="text-xl font-bold" style={{ color: "var(--texto)" }}>Registrar pago</h1>
        </div>
      </div>

      <form onSubmit={guardar} className="card p-5 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Cliente *</label>
          <select required value={form.clienteId} onChange={e => set("clienteId", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
            <option value="">Selecciona un cliente…</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}{c.telefono ? ` — ${c.telefono}` : ""}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Concepto</label>
          <input type="text" value={form.concepto} onChange={e => set("concepto", e.target.value)}
            placeholder="Afiliación TB Team"
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Monto (MXN)</label>
            <input type="number" min={1} value={form.monto} onChange={e => set("monto", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Método de pago</label>
            <select value={form.metodo} onChange={e => set("metodo", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}>
              {["Transferencia","Tarjeta","Liga de pago","Efectivo","Otro"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Estatus</label>
          <div className="flex gap-2">
            {[["pagado","✅ Pagado"],["pendiente","⏳ Pendiente"],["vencido","❌ Vencido"]].map(([val, label]) => (
              <button key={val} type="button" onClick={() => set("estatus", val)}
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: form.estatus === val ? "var(--marca)" : "var(--bg)",
                  color: form.estatus === val ? "white" : "var(--texto-2)",
                  border: `1px solid ${form.estatus === val ? "var(--marca)" : "var(--border)"}`,
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.esParcialidad} onChange={e => set("esParcialidad", e.target.checked)}
            className="w-4 h-4 accent-[var(--marca)]" />
          <span className="text-sm" style={{ color: "var(--texto-2)" }}>Es parcialidad (pago a plazos)</span>
        </label>

        {form.esParcialidad && (
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Total del contrato (MXN)</label>
            <input type="number" min={1} value={form.totalContrato} onChange={e => set("totalContrato", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
          </div>
        )}

        {form.estatus === "pagado" && (
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Fecha de pago</label>
            <input type="date" value={form.fechaPago} onChange={e => set("fechaPago", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
          </div>
        )}

        {form.estatus === "pendiente" && (
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Fecha de vencimiento</label>
            <input type="date" value={form.fechaVencimiento} onChange={e => set("fechaVencimiento", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Notas internas</label>
          <textarea rows={2} value={form.notas} onChange={e => set("notas", e.target.value)}
            placeholder="Notas adicionales…"
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secundario flex-1 justify-center text-sm">
            Cancelar
          </button>
          <button type="submit" disabled={cargando || !form.clienteId} className="btn-marca flex-1 justify-center text-sm">
            {cargando ? "Registrando…" : "Registrar pago"}
          </button>
        </div>
      </form>
    </div>
  )
}
