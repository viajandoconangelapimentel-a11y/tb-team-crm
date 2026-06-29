"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { Users, CalendarDays, Wallet, ListChecks, Trophy, AlertTriangle, TrendingUp, TrendingDown, Target, Zap } from "lucide-react"

interface DatosDashboard {
  totalActivos: number
  clientesMesActual: number
  clientesMesPasado: number
  ingresosMes: number
  ingresosMesPasado: number
  citasHoy: number
  citasMes: number
  tareasVencidas: number
  pagosVencidos: number
  clientesSinAccion: number
  leadsNuevos: number
  metaClientes: number
  pctMeta: number
  meses6: { mes: string; clientes: number; ingresos: number }[]
  nombreUsuario: string
}

function variacion(actual: number, anterior: number) {
  if (anterior === 0) return { pct: 0, sube: true }
  const pct = Math.round(((actual - anterior) / anterior) * 100)
  return { pct: Math.abs(pct), sube: actual >= anterior }
}

function NumeroGrande({ valor, label, icono: Icono, acento, href, variacion: v }: {
  valor: number | string
  label: string
  icono: React.ElementType
  acento: string
  href?: string
  variacion?: { pct: number; sube: boolean }
}) {
  const contenido = (
    <div className="card p-5 hover:shadow-[var(--sombra-hover)] transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${acento} 15%, transparent)` }}>
          <Icono size={18} style={{ color: acento }} />
        </div>
        {v && (
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: v.sube ? "var(--verde)" : "var(--rojo)" }}>
            {v.sube ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {v.pct}%
          </div>
        )}
      </div>
      <p className="text-3xl font-extrabold" style={{ color: "var(--texto)" }}>{valor}</p>
      <p className="text-sm mt-0.5" style={{ color: "var(--texto-3)" }}>{label}</p>
    </div>
  )
  return href ? <Link href={href} className="block">{contenido}</Link> : contenido
}

export function DashboardCliente({ datos }: { datos: DatosDashboard }) {
  const hora = new Date().getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"
  const vClientes = variacion(datos.clientesMesActual, datos.clientesMesPasado)
  const vIngresos = variacion(datos.ingresosMes, datos.ingresosMesPasado)

  const semaforo = datos.pctMeta >= 80 ? "🟢" : datos.pctMeta >= 50 ? "🟡" : "🔴"

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>
          {saludo}, {datos.nombreUsuario.split(" ")[0]} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--texto-3)" }}>¿Vas a cerrar el mes?</p>
      </div>

      {/* Alertas críticas */}
      {(datos.tareasVencidas > 0 || datos.leadsNuevos > 0 || datos.clientesSinAccion > 0) && (
        <div className="space-y-2">
          {datos.leadsNuevos > 0 && (
            <Link href="/seguimiento" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90" style={{ background: "rgba(224,123,168,0.12)", color: "var(--marca-dark)" }}>
              <Zap size={16} />
              ⚠️ Tienes {datos.leadsNuevos} nuevo{datos.leadsNuevos > 1 ? "s" : ""} interesado{datos.leadsNuevos > 1 ? "s" : ""} sin contactar — ¡el primero que contacta gana!
            </Link>
          )}
          {datos.tareasVencidas > 0 && (
            <Link href="/seguimiento" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:opacity-90" style={{ background: "rgba(220,38,38,0.08)", color: "var(--rojo)" }}>
              <AlertTriangle size={16} />
              {datos.tareasVencidas} acción{datos.tareasVencidas > 1 ? "es" : ""} vencida{datos.tareasVencidas > 1 ? "s" : ""} — revísalas ahora
            </Link>
          )}
          {datos.clientesSinAccion > 0 && (
            <Link href="/clientes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors hover:opacity-90" style={{ background: "rgba(234,179,8,0.08)", color: "#854d0e" }}>
              <AlertTriangle size={16} />
              {datos.clientesSinAccion} cliente{datos.clientesSinAccion > 1 ? "s" : ""} sin próxima acción definida
            </Link>
          )}
        </div>
      )}

      {/* META DEL MES */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} style={{ color: "var(--marca)" }} />
            <h2 className="font-semibold" style={{ color: "var(--texto)" }}>Meta del mes</h2>
          </div>
          <span className="text-lg">{semaforo}</span>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-extrabold" style={{ color: "var(--texto)" }}>{datos.clientesMesActual}</span>
          <span className="text-lg mb-1" style={{ color: "var(--texto-3)" }}>/ {datos.metaClientes} clientes</span>
        </div>
        <div className="w-full rounded-full overflow-hidden h-3 mb-1" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, datos.pctMeta)}%`, background: "var(--marca)" }}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--texto-3)" }}>
          {datos.pctMeta}% — {datos.pctMeta >= 100 ? "¡Meta cumplida! 🎉" : `faltan ${datos.metaClientes - datos.clientesMesActual} cierres`}
        </p>
      </div>

      {/* BENTO GRID de números */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NumeroGrande
          valor={datos.clientesMesActual}
          label="Clientes ganados este mes"
          icono={Trophy}
          acento="var(--acento-completados)"
          href="/completados"
          variacion={vClientes}
        />
        <NumeroGrande
          valor={`$${(datos.ingresosMes / 1000).toFixed(0)}k`}
          label="Ingresos del mes"
          icono={Wallet}
          acento="var(--acento-pagos)"
          href="/pagos"
          variacion={vIngresos}
        />
        <NumeroGrande
          valor={datos.citasHoy}
          label="Citas hoy"
          icono={CalendarDays}
          acento="var(--acento-agenda)"
          href="/agenda"
        />
        <NumeroGrande
          valor={datos.totalActivos}
          label="Clientes activos en embudo"
          icono={Users}
          acento="var(--acento-clientes)"
          href="/embudo"
        />
      </div>

      {/* Alertas de pagos vencidos */}
      {datos.pagosVencidos > 0 && (
        <Link href="/pagos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "rgba(220,38,38,0.08)", color: "var(--rojo)" }}>
          <Wallet size={16} />
          {datos.pagosVencidos} pago{datos.pagosVencidos > 1 ? "s" : ""} vencido{datos.pagosVencidos > 1 ? "s" : ""} por cobrar — cobrar esto es la venta más fácil
        </Link>
      )}

      {/* GRÁFICA 6 MESES */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: "var(--texto)" }}>
            <TrendingUp size={16} style={{ color: "var(--marca)" }} />
            Crecimiento mes a mes
          </h2>
          <p className="text-xs" style={{ color: "var(--texto-3)" }}>Últimos 6 meses</p>
        </div>
        {datos.meses6.every(m => m.clientes === 0) ? (
          <div className="text-center py-8 text-sm" style={{ color: "var(--texto-3)" }}>
            <TrendingUp size={24} className="mx-auto mb-2 opacity-30" />
            <p>Aún juntando historial — esta gráfica se llena sola al cerrar tus primeras ventas.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={datos.meses6} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--texto-3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--texto-3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--texto)", fontWeight: 600 }}
              />
              <Bar dataKey="clientes" fill="var(--marca)" radius={[4, 4, 0, 0]} name="Clientes ganados" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link href="/seguimiento" className="card p-4 flex items-center gap-3 hover:shadow-[var(--sombra-hover)] transition-all">
          <ListChecks size={20} style={{ color: "var(--acento-seguimiento)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Hoy te toca</p>
            <p className="text-xs" style={{ color: "var(--texto-3)" }}>A quién contactar</p>
          </div>
        </Link>
        <Link href="/agenda" className="card p-4 flex items-center gap-3 hover:shadow-[var(--sombra-hover)] transition-all">
          <CalendarDays size={20} style={{ color: "var(--acento-agenda)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>{datos.citasMes} citas este mes</p>
            <p className="text-xs" style={{ color: "var(--texto-3)" }}>Ver agenda</p>
          </div>
        </Link>
        <Link href="/clientes/nuevo" className="btn-marca justify-center text-sm">
          + Agregar cliente
        </Link>
      </div>
    </div>
  )
}
