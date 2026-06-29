import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1).max(100),
  correo: z.string().email(),
  password: z.string().min(8),
  rol: z.enum(["ADMIN", "VENDEDOR", "SOLO_LECTURA"]),
  metaMesClientes: z.number().int().min(1).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).rol !== "ADMIN")
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, correo: true, rol: true, activo: true, metaMesClientes: true, creadoEn: true },
    orderBy: { creadoEn: "asc" },
  })

  return NextResponse.json({ usuarios })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).rol !== "ADMIN")
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 })

  const body = await req.json()
  const parsed = crearUsuarioSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 })

  const existente = await prisma.usuario.findUnique({ where: { correo: parsed.data.correo } })
  if (existente) return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 409 })

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  const usuario = await prisma.usuario.create({
    data: {
      nombre: parsed.data.nombre,
      correo: parsed.data.correo,
      passwordHash,
      rol: parsed.data.rol,
      metaMesClientes: parsed.data.metaMesClientes ?? 10,
    },
    select: { id: true, nombre: true, correo: true, rol: true },
  })

  return NextResponse.json({ usuario }, { status: 201 })
}
