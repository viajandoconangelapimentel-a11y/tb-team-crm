export function formatoFechaHumana(fecha: Date): string {
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(ayer.getDate() - 1)

  const mismoAnio = fecha.getFullYear() === hoy.getFullYear()
  const mismoDia = fecha.toDateString() === hoy.toDateString()
  const diaAyer = fecha.toDateString() === ayer.toDateString()

  const hora = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })

  if (mismoDia) return `Hoy ${hora}`
  if (diaAyer) return `Ayer ${hora}`

  const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 7) return `Hace ${diff} días`

  return fecha.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: mismoAnio ? undefined : "numeric" }) + ` ${hora}`
}

export function diasDesde(fecha: Date): number {
  const hoy = new Date()
  return Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24))
}

export function moneda(monto: number, simbolo = "$", locale = "es-MX"): string {
  return `${simbolo}${monto.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
