import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { registrarAuditoria } from "@/lib/auditoria"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).rol !== "ADMIN")
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })
  const usuario = session.user as any

  const [clientes, pagos, citas, notas, usuarios, etiquetas, config] = await Promise.all([
    prisma.cliente.findMany({ include: { etiquetas: true } }),
    prisma.pago.findMany(),
    prisma.cita.findMany(),
    prisma.nota.findMany(),
    // NUNCA incluir contraseñas en el respaldo
    prisma.usuario.findMany({ select: { id: true, nombre: true, correo: true, rol: true, activo: true, metaMesClientes: true, creadoEn: true } }),
    prisma.etiqueta.findMany(),
    prisma.configNegocio.findUnique({ where: { id: "1" } }),
  ])

  await registrarAuditoria({
    usuarioId: usuario.id,
    usuarioNombre: usuario.nombre ?? usuario.name,
    accion: "exportar",
    entidad: "Sistema",
    descripcion: "Generó un respaldo completo del sistema",
  })

  const respaldo = {
    version: "1.0",
    fecha: new Date().toISOString(),
    negocio: config?.nombreNegocio ?? "TB Team Agentes Yaz",
    clientes,
    pagos,
    citas,
    notas,
    usuarios,
    etiquetas,
    config,
  }

  return new NextResponse(JSON.stringify(respaldo, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="respaldo-tb-team-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
