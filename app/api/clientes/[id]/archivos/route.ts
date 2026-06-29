import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TIPOS_PERMITIDOS = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id: clienteId } = await params

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId }, select: { vendedorId: true } })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const etiqueta = formData.get("etiqueta") as string ?? "Otro"

  if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 })
  if (!TIPOS_PERMITIDOS.includes(file.type)) return NextResponse.json({ error: "Tipo de archivo no permitido. Solo PDF, JPG o PNG." }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "El archivo es mayor a 5 MB" }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString("base64")
  const dataUrl = `data:${file.type};base64,${base64}`

  const archivo = await prisma.archivo.create({
    data: {
      clienteId,
      nombre: file.name,
      etiqueta,
      tipo: file.type,
      tamano: file.size,
      datos: dataUrl,
      subidoPor: usuario.nombre ?? usuario.name,
    },
  })

  return NextResponse.json({ archivo }, { status: 201 })
}
