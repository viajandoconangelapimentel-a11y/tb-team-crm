import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  anio: z.number().int(),
  mes: z.number().int().min(1).max(12),
  monto: z.number().min(0),
  notas: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const residuales = await prisma.residual.findMany({ orderBy: [{ anio: "desc" }, { mes: "desc" }], take: 24 })
  return NextResponse.json({ residuales })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const residual = await prisma.residual.upsert({
    where: { anio_mes: { anio: parsed.data.anio, mes: parsed.data.mes } },
    update: { monto: parsed.data.monto, notas: parsed.data.notas },
    create: parsed.data,
  })

  return NextResponse.json({ residual })
}
