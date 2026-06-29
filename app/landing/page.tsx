"use client"
import { useState } from "react"
import { MessageCircle, CheckCircle2, Star, Calendar, ChevronRight, Loader2 } from "lucide-react"

const TESTIMONIOS = [
  { nombre: "Sofía Ramírez", ciudad: "Mérida, Yucatán", texto: "Increíble oportunidad. En 2 semanas ya tenía mis primeras ventas. Yazmín me guió paso a paso y sin ella no lo hubiera logrado." },
  { nombre: "Daniela Torres", ciudad: "CDMX", texto: "Empecé sin saber nada de viajes y hoy ya tengo mis propios clientes. La capacitación es excelente y el equipo siempre está disponible." },
  { nombre: "Patricia Leal", ciudad: "Monterrey, NL", texto: "¡Lo mejor fue que puedo trabajar desde casa y no descuido a mis hijos! Gracias TB Team por esta oportunidad de vida." },
  { nombre: "Carmen Vega", ciudad: "Cancún, Q. Roo", texto: "Pensé que era difícil pero resulta que no. Yazmín te explica todo clarito. Ya llevo 3 meses generando ingresos extras." },
]

export default function LandingPage() {
  const [form, setForm] = useState({ nombre: "", whatsapp: "", correo: "" })
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.whatsapp.trim()) return
    setCargando(true)
    setError("")

    // Guardar lead con reintento
    const intentar = async (intento = 1): Promise<boolean> => {
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            utmSource: new URLSearchParams(window.location.search).get("utm_source") ?? "Landing",
          }),
        })
        return res.ok
      } catch {
        if (intento < 3) {
          await new Promise(r => setTimeout(r, 1000 * intento))
          return intentar(intento + 1)
        }
        return false
      }
    }

    const ok = await intentar()
    setCargando(false)
    if (ok) {
      setEnviado(true)
    } else {
      setError("Hubo un problema al enviar tu información. Por favor inténtalo de nuevo o escríbenos directo por WhatsApp.")
    }
  }

  const numWA = "5219981234567"
  const msgWA = encodeURIComponent(`Hola Yazmín, me interesa saber más sobre cómo empezar mi agencia de viajes desde casa con TB Team.`)

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
      {/* HERO */}
      <section
        className="relative min-h-[80dvh] flex flex-col items-center justify-center text-center px-4 py-16"
        style={{ background: "linear-gradient(135deg, #fce8f1 0%, #f8f7f9 60%, #ede9f8 100%)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: "var(--marca-light)", color: "var(--marca-dark)" }}
          >
            🌴 Cancún, Quintana Roo — Oportunidad real de trabajo desde casa
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: "var(--texto)" }}>
            Empieza tu propia{" "}
            <span style={{ color: "var(--marca)" }}>agencia de viajes</span>
            {" "}desde casa
          </h1>
          <p className="text-lg md:text-xl mb-8" style={{ color: "var(--texto-2)" }}>
            Sin experiencia, sin dejar tu familia, generando ingresos reales. Yazmín Leal te guía paso a paso desde cero.
          </p>

          {/* CTA Principal */}
          <a
            href="#formulario"
            className="btn-marca text-lg px-8 py-4 rounded-2xl inline-flex"
            style={{ fontSize: 18 }}
          >
            Agenda tu cita gratuita <ChevronRight size={20} />
          </a>

          <p className="mt-3 text-sm" style={{ color: "var(--texto-3)" }}>Sin costo · Sin compromiso · En menos de 24 horas te contactamos</p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--texto)" }}>¿Por qué unirte a TB Team?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icono: "🏠", titulo: "Trabaja desde casa", desc: "Sin horario fijo, sin jefe. Tú decides cuándo y cuánto trabajar." },
            { icono: "🎓", titulo: "Certificación incluida", desc: "Te certificamos como agente de viajes. No necesitas experiencia previa." },
            { icono: "💰", titulo: "Ingresos reales", desc: "Comisiones atractivas por cada venta. Muchas empiezan a ganar desde el primer mes." },
          ].map(b => (
            <div key={b.titulo} className="card p-5 text-center">
              <p className="text-3xl mb-3">{b.icono}</p>
              <p className="font-semibold mb-1" style={{ color: "var(--texto)" }}>{b.titulo}</p>
              <p className="text-sm" style={{ color: "var(--texto-3)" }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULARIO */}
      <section id="formulario" className="py-16 px-4" style={{ background: "var(--marca-light)" }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "var(--texto)" }}>
            Agenda tu cita gratis 📅
          </h2>
          <p className="text-center text-sm mb-6" style={{ color: "var(--texto-2)" }}>
            Déjanos tus datos y Yazmín te contacta en menos de 24 horas
          </p>

          {enviado ? (
            <div className="card p-8 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: "var(--verde)" }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--texto)" }}>¡Listo, {form.nombre.split(" ")[0]}! 🎉</h3>
              <p className="text-sm mb-6" style={{ color: "var(--texto-2)" }}>
                Te contactamos en menos de 24 horas. Si quieres atención inmediata, escríbenos por WhatsApp ahora mismo.
              </p>
              <a
                href={`https://wa.me/${numWA}?text=${msgWA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-marca text-base inline-flex"
              >
                <MessageCircle size={18} /> Escríbenos por WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(220,38,38,0.08)", color: "var(--rojo)" }}>
                  {error}
                  <br />
                  <a href={`https://wa.me/${numWA}?text=${msgWA}`} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                    Escríbenos directo por WhatsApp →
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--texto-2)" }}>Tu nombre *</label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => set("nombre", e.target.value)}
                  placeholder="Ej: María González"
                  className="w-full px-4 py-3 rounded-xl border text-base outline-none"
                  style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--texto-2)" }}>Tu WhatsApp *</label>
                <input
                  required
                  type="tel"
                  value={form.whatsapp}
                  onChange={e => set("whatsapp", e.target.value)}
                  placeholder="998 123 4567"
                  className="w-full px-4 py-3 rounded-xl border text-base outline-none"
                  style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--texto-2)" }}>Correo electrónico (opcional)</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={e => set("correo", e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl border text-base outline-none"
                  style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="btn-marca w-full justify-center text-base py-3"
              >
                {cargando ? <><Loader2 size={18} className="animate-spin" /> Enviando…</> : "¡Quiero saber más! →"}
              </button>

              <p className="text-center text-xs" style={{ color: "var(--texto-3)" }}>
                Tu información es confidencial. No compartimos tus datos.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--texto)" }}>
          Lo que dicen nuestras agentes ⭐
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TESTIMONIOS.map(t => (
            <div key={t.nombre} className="card p-5">
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="var(--marca)" stroke="none" />)}
              </div>
              <p className="text-sm mb-3 italic" style={{ color: "var(--texto-2)" }}>&ldquo;{t.texto}&rdquo;</p>
              <p className="text-xs font-semibold" style={{ color: "var(--texto)" }}>{t.nombre}</p>
              <p className="text-xs" style={{ color: "var(--texto-3)" }}>{t.ciudad}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-12 px-4 text-center" style={{ background: "var(--marca)", color: "white" }}>
        <h2 className="text-2xl font-bold mb-3">¿Lista para empezar?</h2>
        <p className="mb-6 opacity-90">Únete a TB Team y empieza a generar ingresos desde casa.</p>
        <a href="#formulario" className="inline-flex items-center gap-2 bg-white font-semibold px-6 py-3 rounded-xl" style={{ color: "var(--marca)" }}>
          Agenda tu cita gratis
        </a>
      </section>
    </div>
  )
}
