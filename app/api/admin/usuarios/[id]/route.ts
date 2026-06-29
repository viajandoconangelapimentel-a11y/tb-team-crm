import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const patchSchema = z.object({
  activo: z.boolean().optional(),
  rol: z.enum(["ADMIN", "VENDEDOR", "SOLO_LECTURA"]).optional(),
  metaMesClientes: z.number().int().min(1).optional(),
  nombre: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user as any).rol !== "ADMIN")
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const data: any = { ...parsed.data }
  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 12)
    delete data.password
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data,
    select: { id: true, nombre: true, correo: true, rol: true, activo: true },
  })

  return NextResponse.json({ usuario })
}
