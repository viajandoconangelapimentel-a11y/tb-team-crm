import { requireAuth } from "@/lib/permisos"
import { prisma } from "@/lib/prisma"
import { DashboardCliente } from "./DashboardCliente"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Tablero" }

export default async function DashboardPage() {
  const session = await requireAuth()
  const usuario = session.user as any
  const esAdmin = usuario.rol === "ADMIN"
  const filtro = esAdmin ? {} : { vendedorId: usuario.id }
  const hoy = new Date()
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const inicioMesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const finMesPasado = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59)

  const [
    totalActivos,
    clientesMesActual,
    clientesMesPasado,
    ingresosMes,
    ingresosMesPasado,
    citasHoy,
    citasMes,
    tareasVencidas,
    pagosVencidos,
    clientesSinAccion,
    leadsNuevos,
    config,
    usuarioDB,
    residualesAnio,
    historial6meses,
  ] = await Promise.all([
    // Total activos
    prisma.cliente.count({ where: { ...filtro, estado: "ACTIVO", eliminadoEn: null } }),
    // Clientes ganados este mes
    prisma.cliente.count({ where: { ...filtro, estado: "GANADO", ganadoEn: { gte: inicioMes }, eliminadoEn: null } }),
    // Clientes ganados mes pasado
    prisma.cliente.count({ where: { ...filtro, estado: "GANADO", ganadoEn: { gte: inicioMesPasado, lte: finMesPasado }, eliminadoEn: null } }),
    // Ingresos este mes
    prisma.pago.aggregate({ where: { ...filtro, estatus: "pagado", fechaPago: { gte: inicioMes }, eliminadoEn: null }, _sum: { monto: true } }),
    // Ingresos mes pasado
    prisma.pago.aggregate({ where: { ...filtro, estatus: "pagado", fechaPago: { gte: inicioMesPasado, lte: finMesPasado }, eliminadoEn: null }, _sum: { monto: true } }),
    // Citas hoy
    prisma.cita.count({ where: { ...(esAdmin ? {} : { vendedorId: usuario.id }), inicio: { gte: new Date(hoy.toDateString()), lte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59) }, eliminadoEn: null } }),
    // Citas este mes
    prisma.cita.count({ where: { ...(esAdmin ? {} : { vendedorId: usuario.id }), inicio: { gte: inicioMes }, eliminadoEn: null } }),
    // Tareas vencidas
    prisma.tarea.count({ where: { usuarioId: usuario.id, completada: false, eliminadoEn: null, fechaVence: { lte: hoy } } }),
    // Pagos vencidos
    prisma.pago.count({ where: { ...filtro, estatus: "pendiente", fechaVencimiento: { lte: hoy }, eliminadoEn: null } }),
    // Clientes sin próxima acción
    prisma.cliente.count({ where: { ...filtro, estado: "ACTIVO", eliminadoEn: null, proximaAccion: null } }),
    // Leads nuevos sin contactar
    prisma.cliente.count({ where: { ...filtro, estado: "ACTIVO", etapa: "Lista de contactos", ultimoContacto: null, eliminadoEn: null } }),
    // Configuración del negocio
    prisma.configNegocio.findUnique({ where: { id: "1" } }),
    // Usuario con su meta
    prisma.usuario.findUnique({ where: { id: usuario.id }, select: { metaMesClientes: true, metaMesDinero: true, nombre: true } }),
    // Residuales del año actual
    prisma.residual.findMany({ where: { anio: hoy.getFullYear() }, orderBy: { mes: "asc" } }),
    // Historial de 6 meses
    prisma.cliente.findMany({
      where: { ...filtro, estado: "GANADO", ganadoEn: { gte: new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1) }, eliminadoEn: null },
      select: { ganadoEn: true, valorEstimado: true },
    }),
  ])

  // Procesar datos de 6 meses para la gráfica
  const meses6: { mes: string; clientes: number; ingresos: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const mesNombre = d.toLocaleString("es-MX", { month: "short" })
    const mesNum = d.getMonth()
    const anioNum = d.getFullYear()
    const clientesMes = historial6meses.filter(c => {
      const f = c.ganadoEn ? new Date(c.ganadoEn) : null
      return f && f.getMonth() === mesNum && f.getFullYear() === anioNum
    })
    meses6.push({
      mes: mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1),
      clientes: clientesMes.length,
      ingresos: clientesMes.reduce((s, c) => s + c.valorEstimado, 0),
    })
  }

  const residualMesActual = residualesAnio.find((r: any) => r.mes === hoy.getMonth() + 1)?.monto ?? 0
  const residualAnual = residualesAnio.reduce((s: number, r: any) => s + r.monto, 0)
  const metaClientes = usuarioDB?.metaMesClientes ?? config?.metaMesClientes ?? 10
  const pctMeta = Math.round((clientesMesActual / metaClientes) * 100)

  return (
    <DashboardCliente
      datos={{
        totalActivos,
        clientesMesActual,
        clientesMesPasado,
        ingresosMes: ingresosMes._sum.monto ?? 0,
        ingresosMesPasado: ingresosMesPasado._sum.monto ?? 0,
        citasHoy,
        citasMes,
        tareasVencidas,
        pagosVencidos,
        clientesSinAccion,
        leadsNuevos,
        metaClientes,
        pctMeta,
        meses6,
        residualMes: residualMesActual,
        residualAnual,
        mesActual: hoy.getMonth() + 1,
        anioActual: hoy.getFullYear(),
        nombreUsuario: usuarioDB?.nombre ?? usuario.nombre,
      }}
    />
  )
}
