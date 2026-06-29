"use client"
import { useState } from "react"
import { useToast } from "@/components/ui/Toast"
import { SelectorTema } from "@/components/ui/SelectorTema"
import { User } from "lucide-react"

interface Props {
  usuario: { id: string; nombre: string; correo: string; rol: string; tema: string; metaMesClientes: number; onboardingCompletado: boolean }
}

export function PerfilCliente({ usuario }: Props) {
  const { toast } = useToast()
  const [nombre, setNombre] = useState(usuario.nombre)
  const [pwActual, setPwActual] = useState("")
  const [pwNueva, setPwNueva] = useState("")
  const [cargando, setCargando] = useState(false)

  async function guardarNombre() {
    setCargando(true)
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
    setCargando(false)
    if (res.ok) toast("Nombre actualizado ✓", "exito")
    else toast("No se pudo actualizar", "error")
  }

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwNueva.length < 8) { toast("La contraseña debe tener mínimo 8 caracteres", "error"); return }
    setCargando(true)
    const res = await fetch("/api/perfil/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual: pwActual, nueva: pwNueva }),
    })
    setCargando(false)
    if (res.ok) { toast("Contraseña actualizada ✓", "exito"); setPwActual(""); setPwNueva("") }
    else toast("La contraseña actual no es correcta", "error")
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <User size={24} style={{ color: "var(--marca)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Mi perfil</h1>
      </div>

      {/* Avatar y nombre */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: "var(--marca)" }}>
            {nombre[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--texto)" }}>{nombre}</p>
            <p className="text-sm" style={{ color: "var(--texto-3)" }}>{usuario.correo} · {usuario.rol}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--texto-2)" }}>Nombre</label>
          <div className="flex gap-2">
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            />
            <button onClick={guardarNombre} disabled={cargando || nombre === usuario.nombre} className="btn-marca text-sm px-4">
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Tema */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--texto)" }}>Apariencia</p>
        <SelectorTema />
      </div>

      {/* Contraseña */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--texto)" }}>Cambiar contraseña</p>
        <form onSubmit={cambiarPassword} className="space-y-3">
          {[
            { label: "Contraseña actual", val: pwActual, set: setPwActual },
            { label: "Nueva contraseña (mín. 8 caracteres)", val: pwNueva, set: setPwNueva },
          ].map(f => (
            <div key={f.label}>
              <label className="text-sm font-medium block mb-1" style={{ color: "var(--texto-2)" }}>{f.label}</label>
              <input
                type="password"
                value={f.val}
                onChange={e => f.set(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
              />
            </div>
          ))}
          <button type="submit" disabled={cargando} className="btn-marca text-sm">Cambiar contraseña</button>
        </form>
      </div>
    </div>
  )
}
