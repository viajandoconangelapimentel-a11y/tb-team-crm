"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Suspense } from "react"

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setCargando(true)

    const res = await signIn("credentials", {
      correo,
      password,
      redirect: false,
    })

    setCargando(false)

    if (res?.error) {
      setError("Correo o contraseña incorrectos. Si intentaste varias veces, espera 15 minutos.")
    } else {
      router.push(params.get("callbackUrl") ?? "/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
            style={{ background: "var(--marca)" }}
          >
            TB
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>TB Team Agentes Yaz</h1>
          <p className="text-sm mt-1" style={{ color: "var(--texto-3)" }}>CRM de ventas — Entra a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(220,38,38,0.08)", color: "var(--rojo)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--texto-2)" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-xl border text-base outline-none transition-all"
              style={{
                background: "var(--bg)",
                borderColor: "var(--border-strong)",
                color: "var(--texto)",
              }}
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--texto-2)" }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrar ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border text-base outline-none transition-all pr-12"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border-strong)",
                  color: "var(--texto)",
                }}
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setMostrar(m => !m)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrar ? <EyeOff size={16} style={{ color: "var(--texto-3)" }} /> : <Eye size={16} style={{ color: "var(--texto-3)" }} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-marca w-full justify-center text-base"
          >
            {cargando ? <><Loader2 size={16} className="animate-spin" /> Entrando…</> : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: "var(--texto-3)" }}>
          ¿Problemas para entrar? Escríbele a tu administrador.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
