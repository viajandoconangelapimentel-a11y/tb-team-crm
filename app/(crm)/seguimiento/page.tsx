import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Zap, Clock, CalendarDays } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Hoy te toca" }

export default async function SeguimientoPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }
  const hoy = new Date()
  const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
  const inicioManana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
  const finManana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 23, 59, 59)

  const [
    accionesVencidas,
    accionesHoy,
    accionesManana,
    leadsNuevos24h,
    clientesSinAccion,
    citasHoy,
  ] = await Promise.all([
    // Acciones vencidas
    prisma.cliente.findMany({
      where: { ...filtro, estado: "ACTIVO", eliminadoEn: null, proximaAccionFecha: { lt: hoy } },
      orderBy: [{ temperatura: "asc" }, { proximaAccionFecha: "asc" }],
      take: 20,
    }),
    // Acciones de hoy
    prisma.cliente.findMany({
      where: { ...filtro, estado: "ACTIVO", eliminadoEn: null, proximaAccionFecha: { gte: hoy, lte: finDia } },
      orderBy: [{ temperatura: "asc" }, { valorEstimado: "desc" }],
      take: 20,
    }),
    // Acciones de mañana
    prisma.cliente.findMany({
      where: { ...filtro, estado: "ACTIVO", eliminadoEn: null, proximaAccionFecha: { gte: inicioManana, lte: finManana } },
      orderBy: { valorEstimado: "desc" },
      take: 10,
    }),
    // Leads sin contactar hace más de 24h
    prisma.cliente.findMany({
      where: {
        ...filtro,
        estado: "ACTIVO",
        etapa: "Lista de contactos",
        eliminadoEn: null,
        ultimoContacto: null,
        creadoEn: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      take: 10,
    }),
    // Clientes sin próxima acción
    prisma.cliente.count({ where: { ...filtro, estado: "ACTIVO", eliminadoEn: null, proximaAccion: null } }),
    // Citas de hoy
    prisma.cita.findMany({
      where: {
        ...(!esAdmin ? { vendedorId: usuario.id } : {}),
        eliminadoEn: null,
        inicio: { gte: new Date(hoy.toDateString()), lte: finDia },
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { inicio: "asc" },
    }),
  ])

  const ordenTemperatura = { "CALIENTE": 0, "TIBIO": 1, "FRIO": 2 }

  function ClienteFila({ c, badge }: { c: any; badge?: string }) {
    const telWA = (c.telefonoInternacional ?? c.telefono ?? "").replace(/\D/g, "")
    const urlWA = telWA ? `https://wa.me/${telWA}` : null
    const tempEmoji = { CALIENTE: "🔥", TIBIO: "🟡", FRIO: "🔵" }[c.temperatura as string] ?? "🟡"

    return (
      <div className="card flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
        <span className="text-lg shrink-0">{tempEmoji}</span>
        <div className="flex-1 min-w-0">
          <Link href={`/clientes/${c.id}`} className="link-cliente text-sm font-semibold">{c.nombre}</Link>
          {c.proximaAccion && (
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--texto-3)" }}>{c.proximaAccion}</p>
          )}
        </div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: "rgba(220,38,38,0.1)", color: "var(--rojo)" }}>
            {badge}
          </span>
        )}
        {urlWA && (
          <a href={urlWA} target="_blank" rel="noopener noreferrer" className="btn-marca text-xs py-1.5 px-3 shrink-0">
            WhatsApp
          </a>
        )}
        <Link href={`/clientes/${c.id}`} className="btn-secundario text-xs py-1.5 px-3 shrink-0">
          Ver ficha
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Hoy te toca 📋</h1>
        <p className="text-sm" style={{ color: "var(--texto-3)" }}>A quién contactar hoy — empieza por los 🔥</p>
      </div>

      {/* Leads fríos por demora */}
      {leadsNuevos24h.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Zap size={16} style={{ color: "var(--rojo)" }} />
            <h2 className="text-sm font-bold text-red-500">⚠️ Leads fríos por demora ({leadsNuevos24h.length})</h2>
          </div>
          <div className="space-y-2">
            {leadsNuevos24h.map(c => <ClienteFila key={c.id} c={c} badge="Más de 24h sin contactar" />)}
          </div>
        </section>
      )}

      {/* Acciones vencidas */}
      {accionesVencidas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <AlertTriangle size={16} style={{ color: "var(--rojo)" }} />
            <h2 className="text-sm font-bold text-red-500">Acciones vencidas ({accionesVencidas.length})</h2>
          </div>
          <div className="space-y-2">
            {[...accionesVencidas].sort((a, b) => (ordenTemperatura[a.temperatura as keyof typeof ordenTemperatura] ?? 1) - (ordenTemperatura[b.temperatura as keyof typeof ordenTemperatura] ?? 1)).map(c => (
              <ClienteFila key={c.id} c={c} badge="Vencida" />
            ))}
          </div>
        </section>
      )}

      {/* Para hoy */}
      {accionesHoy.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <CheckCircle2 size={16} style={{ color: "var(--acento-seguimiento)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Para hoy ({accionesHoy.length})</h2>
          </div>
          <div className="space-y-2">
            {accionesHoy.map(c => <ClienteFila key={c.id} c={c} />)}
          </div>
        </section>
      )}

      {/* Citas de hoy */}
      {citasHoy.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <CalendarDays size={16} style={{ color: "var(--acento-agenda)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Citas de hoy ({citasHoy.length})</h2>
          </div>
          <div className="space-y-2">
            {citasHoy.map((c: any) => (
              <div key={c.id} className="card flex items-center gap-3 px-4 py-3">
                <CalendarDays size={16} style={{ color: "var(--acento-agenda)" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--texto)" }}>{c.titulo}</p>
                  {c.cliente && (
                    <Link href={`/clientes/${c.cliente.id}`} className="link-cliente text-xs">{c.cliente.nombre}</Link>
                  )}
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--acento-agenda)" }}>
                  {new Date(c.inicio).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Para mañana */}
      {accionesManana.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Clock size={16} style={{ color: "var(--texto-3)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--texto-2)" }}>Mañana ({accionesManana.length})</h2>
          </div>
          <div className="space-y-2 opacity-70">
            {accionesManana.map(c => <ClienteFila key={c.id} c={c} />)}
          </div>
        </section>
      )}

      {/* Sin pendientes */}
      {accionesVencidas.length === 0 && accionesHoy.length === 0 && leadsNuevos24h.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-lg font-semibold" style={{ color: "var(--texto)" }}>¡Hoy no tienes pendientes!</p>
          <p className="text-sm mt-1" style={{ color: "var(--texto-3)" }}>Aprovecha para prospectar más clientes.</p>
          <Link href="/clientes/nuevo" className="btn-marca mt-4 text-sm inline-flex">+ Agregar cliente</Link>
        </div>
      )}

      {/* Contador de sin acción */}
      {clientesSinAccion > 0 && (
        <div className="card p-4 flex items-center gap-3" style={{ background: "rgba(234,179,8,0.06)" }}>
          <AlertTriangle size={16} style={{ color: "var(--ambar)" }} />
          <p className="text-sm" style={{ color: "var(--texto-2)" }}>
            <strong>{clientesSinAccion} clientes</strong> activos sin próxima acción definida.{" "}
            <Link href="/clientes" className="link-cliente">Defíneles una acción →</Link>
          </p>
        </div>
      )}
    </div>
  )
}
