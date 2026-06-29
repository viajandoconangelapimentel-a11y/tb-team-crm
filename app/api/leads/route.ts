import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const leadSchema = z.object({
  nombre: z.string().min(1).max(120),
  whatsapp: z.string().min(8).max(20),
  correo: z.string().email().optional().or(z.literal("")),
  utmSource: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

    const { nombre, whatsapp, correo, utmSource } = parsed.data

    // Guardar lead en la tabla de leads
    const lead = await prisma.leadLanding.create({
      data: { nombre, whatsapp, correo: correo || undefined, utmSource: utmSource ?? "Landing" },
    })

    // Crear cliente automáticamente como "Nuevo" en el embudo
    const adminUser = await prisma.usuario.findFirst({ where: { rol: "ADMIN", activo: true } })

    if (adminUser) {
      await prisma.$transaction(async (tx) => {
        const cliente = await tx.cliente.create({
          data: {
            nombre,
            telefono: whatsapp,
            telefonoInternacional: `52${whatsapp.replace(/\D/g, "")}`,
            correo: correo || undefined,
            origen: utmSource ?? "Landing",
            utmSource: utmSource ?? "Landing",
            etapa: "Lista de contactos",
            estado: "ACTIVO",
            temperatura: "CALIENTE",
            proximaAccion: "Contactar en menos de 24 h",
            proximaAccionFecha: new Date(Date.now() + 24 * 60 * 60 * 1000),
            vendedorId: adminUser.id,
          },
        })

        // Actualizar lead con el clienteId
        await tx.leadLanding.update({
          where: { id: lead.id },
          data: { clienteId: cliente.id, procesado: true },
        })

        await tx.eventoHistorial.create({
          data: {
            clienteId: cliente.id,
            tipo: "creacion",
            descripcion: `Lead capturado desde ${utmSource ?? "Landing"}. Próxima acción: contactar en menos de 24 h.`,
            usuarioNombre: "Sistema",
          },
        })
      })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error("Error guardando lead:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
