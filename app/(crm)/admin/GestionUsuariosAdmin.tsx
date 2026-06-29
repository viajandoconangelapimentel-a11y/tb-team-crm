"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"
import { Modal } from "@/components/ui/Modal"
import { Plus, Edit3, UserX, UserCheck } from "lucide-react"

interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: string
  activo: boolean
  metaMesClientes: number
}

interface Props { usuarios: Usuario[] }

const ROLES = ["ADMIN", "VENDEDOR", "SOLO_LECTURA"]

export function GestionUsuariosAdmin({ usuarios: usuariosIniciales }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState(usuariosIniciales)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", rol: "VENDEDOR", metaMesClientes: 10 })

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }))

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { toast("La contraseña debe tener al menos 8 caracteres", "error"); return }
    setCargando(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { toast("No se pudo crear el usuario", "error"); return }
      toast(`Usuario ${form.nombre} creado ✓`, "exito")
      setModalAbierto(false)
      router.refresh()
    } catch {
      toast("Error al crear usuario", "error")
    } finally {
      setCargando(false)
    }
  }

  async function toggleActivo(u: Usuario) {
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !u.activo }),
    })
    if (res.ok) {
      toast(!u.activo ? `${u.nombre} reactivado` : `${u.nombre} desactivado`, "exito")
      router.refresh()
    }
  }

  const BADGES: Record<string, string> = { ADMIN: "badge-activo", VENDEDOR: "badge-ganado", SOLO_LECTURA: "badge-archivado" }

  return (
    <div className="space-y-2">
      <button onClick={() => setModalAbierto(true)} className="btn-marca text-sm mb-2">
        <Plus size={14} /> Agregar usuario
      </button>

      {usuarios.map(u => (
        <div key={u.id} className={`card flex items-center gap-3 px-4 py-3 ${!u.activo ? "opacity-50" : ""}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "var(--marca)" }}
          >
            {u.nombre[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>{u.nombre}</p>
            <p className="text-xs" style={{ color: "var(--texto-3)" }}>{u.correo}</p>
          </div>
          <span className={`badge ${BADGES[u.rol]}`}>{u.rol}</span>
          <button
            onClick={() => toggleActivo(u)}
            className="btn-secundario text-xs py-1 px-2"
            title={u.activo ? "Desactivar" : "Reactivar"}
          >
            {u.activo ? <UserX size={12} /> : <UserCheck size={12} />}
          </button>
        </div>
      ))}

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Agregar usuario">
        <form onSubmit={crearUsuario} className="space-y-4">
          {[
            { label: "Nombre", key: "nombre", type: "text", placeholder: "Nombre del vendedor" },
            { label: "Correo", key: "correo", type: "email", placeholder: "correo@ejemplo.com" },
            { label: "Contraseña (mín. 8 caracteres)", key: "password", type: "password", placeholder: "Contraseña segura" },
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
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Rol</label>
            <select
              value={form.rol}
              onChange={e => set("rol", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Meta del mes (cierres)</label>
            <input
              type="number"
              min="1"
              value={form.metaMesClientes}
              onChange={e => set("metaMesClientes", parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            />
          </div>
          <button type="submit" disabled={cargando} className="btn-marca w-full justify-center text-sm">
            {cargando ? "Creando…" : "Crear usuario"}
          </button>
        </form>
      </Modal>
    </div>
  )
}
