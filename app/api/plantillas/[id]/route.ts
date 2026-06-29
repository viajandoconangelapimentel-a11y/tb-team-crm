import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params
  const p = await prisma.plantilla.findUnique({ where: { id } })
  if (!p || (p.usuarioId !== usuario.id && usuario.rol !== "ADMIN")) return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  const body = await req.json()
  const actualizada = await prisma.plantilla.update({ where: { id }, data: body })
  return NextResponse.json({ plantilla: actualizada })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params
  const p = await prisma.plantilla.findUnique({ where: { id } })
  if (!p || (p.usuarioId !== usuario.id && usuario.rol !== "ADMIN")) return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  await prisma.plantilla.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
