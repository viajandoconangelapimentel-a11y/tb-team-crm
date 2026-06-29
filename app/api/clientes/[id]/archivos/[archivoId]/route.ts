import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; archivoId: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id: clienteId, archivoId } = await params

  const archivo = await prisma.archivo.findUnique({
    where: { id: archivoId },
    include: { cliente: { select: { vendedorId: true } } },
  })
  if (!archivo || archivo.clienteId !== clienteId) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && archivo.cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  if (!archivo.datos) return NextResponse.json({ error: "Sin datos" }, { status: 404 })

  const [, base64] = archivo.datos.split(",")
  const buffer = Buffer.from(base64, "base64")

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": archivo.tipo,
      "Content-Disposition": `attachment; filename="${archivo.nombre}"`,
    },
  })
}
