import { prisma } from "@/lib/prisma"

interface RegistrarAuditoriaParams {
  usuarioId?: string
  usuarioNombre?: string
  accion: string
  entidad: string
  entidadId?: string
  descripcion: string
  ip?: string
}

export async function registrarAuditoria(params: RegistrarAuditoriaParams) {
  try {
    await prisma.registroAuditoria.create({ data: params })
  } catch {
    // No romper el flujo si falla la auditoría
    console.error("Error registrando auditoría:", params.accion)
  }
}
