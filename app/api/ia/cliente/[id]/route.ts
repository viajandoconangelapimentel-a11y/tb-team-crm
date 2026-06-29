import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ID del modelo de Anthropic — cambiar aquí si hay nueva versión
const MODELO_ANTHROPIC = "claude-haiku-4-5-20251001"

// Plantillas locales para cuando no hay llave de IA
function plantillaLocal(accion: string, cliente: any): string {
  const nombre = cliente.nombre.split(" ")[0]
  const objecion = cliente.objecion ?? "no está seguro"
  const etapa = cliente.etapa

  switch (accion) {
    case "mensaje":
      return `Hola ${nombre}, mi nombre es Yazmín Leal. Te escribo porque vi tu interés y quisiera platicarte cómo puedes generar ingresos desde casa con tu propia agencia de viajes. ¿Te late si coordinamos una llamada de 15 minutos esta semana? 🌴`

    case "temperatura":
      if (cliente.ultimoContacto) {
        const dias = Math.floor((Date.now() - new Date(cliente.ultimoContacto).getTime()) / 86400000)
        if (dias < 2) return `🔥 CALIENTE — Tuviste contacto hace ${dias} día(s). ¡Atiéndelo hoy!`
        if (dias < 7) return `🟡 TIBIO — Hace ${dias} días sin contacto. Escríbele hoy.`
        return `🔵 FRÍO — Hace ${dias} días sin contacto. Reactívalo con algo de valor.`
      }
      return `🟡 TIBIO — Aún no hay historial de contacto. Dale seguimiento pronto.`

    case "proxima-accion":
      if (etapa === "Lista de contactos" || etapa === "Información") return `Llama o escríbele hoy para presentarte y agendar una llamada de 15 minutos. Fecha sugerida: ${new Date(Date.now() + 86400000).toLocaleDateString("es-MX")}`
      if (etapa === "Presentación") return `Envíale el link de la presentación de Zoom y confirma su asistencia. Fecha sugerida: ${new Date(Date.now() + 2 * 86400000).toLocaleDateString("es-MX")}`
      return `Da seguimiento personalizado a ${nombre} y pregunta si tiene dudas. Fecha sugerida: ${new Date(Date.now() + 3 * 86400000).toLocaleDateString("es-MX")}`

    case "resumen":
      return `Cliente: ${cliente.nombre} — Etapa: ${etapa} — Temperatura: ${cliente.temperatura} — Objeción: ${objecion}. Último contacto: ${cliente.ultimoContacto ? new Date(cliente.ultimoContacto).toLocaleDateString("es-MX") : "Nunca"}. Próxima acción: ${cliente.proximaAccion ?? "Por definir"}.`

    case "objecion":
      if (objecion.includes("caro")) return `"Entiendo que el precio es importante para ti. Justamente por eso te quiero platicar que esta oportunidad tiene un retorno de inversión muy rápido — muchas personas recuperan su inversión desde el primer mes. ¿Quieres que te cuente cómo lo hacen? ¿Lo platicamos en una llamada de 10 minutos?"`
      if (objecion.includes("pensar")) return `"¡Claro que sí, tómate el tiempo! ¿Qué es lo que necesitas para tomar la decisión? Así yo puedo darte justo la información que te ayude. ¿Agendamos una llamada corta esta semana?"`
      if (objecion.includes("pareja") || objecion.includes("socio")) return `"Perfecto, es importante que lo platiquen juntos. ¿Qué te parece si coordinamos una llamada con tu pareja para que yo les explique a los dos y resuelvan todas sus dudas? Así toman la decisión juntos con información completa."`
      if (objecion.includes("momento")) return `"Entiendo perfectamente. Precisamente por eso quería platicarte que muchas personas empezaron en un momento similar y hoy ya generan ingresos desde casa. ¿Cuándo sería un buen momento para platicar 15 minutos?"`
      return `Escucha con atención su objeción y responde con empatía. Pregunta: "¿Qué necesitarías para sentirte más segura/o con esta decisión?"`

    default:
      return "Información no disponible en este momento."
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const usuario = session.user as any
  const { id } = await params
  const { accion } = await req.json()

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      notas_rel: { orderBy: { fechaReal: "desc" }, take: 5 },
      historial: { orderBy: { creadoEn: "desc" }, take: 5 },
    },
  })
  if (!cliente) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (usuario.rol !== "ADMIN" && cliente.vendedorId !== usuario.id)
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })

  const llaveIA = process.env.ANTHROPIC_API_KEY

  // Sin llave: usar plantilla local
  if (!llaveIA) {
    return NextResponse.json({
      resultado: plantillaLocal(accion, cliente),
      fuente: "plantilla",
      aviso: "Activa el asistente de IA poniendo tu ANTHROPIC_API_KEY para respuestas más personalizadas.",
    })
  }

  // Con llave: llamar a Claude
  try {
    const contexto = `
Cliente: ${cliente.nombre}
Etapa: ${cliente.etapa}
Temperatura: ${cliente.temperatura}
Objeción principal: ${cliente.objecion ?? "no registrada"}
Valor estimado: $${cliente.valorEstimado}
Último contacto: ${cliente.ultimoContacto ? new Date(cliente.ultimoContacto).toLocaleDateString("es-MX") : "Nunca"}
Notas recientes: ${cliente.notas_rel.slice(0, 3).map((n: any) => n.contenido).join(" | ")}
Próxima acción: ${cliente.proximaAccion ?? "Sin definir"}
`

    const prompts: Record<string, string> = {
      mensaje: `Basándote en este expediente de cliente, redacta un mensaje de WhatsApp corto (máx 4 oraciones) que lo mueva a la siguiente etapa del embudo. Tono cálido, personal y orientado a vender. Comienza con su nombre. ${contexto}`,
      temperatura: `Lee este expediente y clasifica la temperatura del cliente como 🔥 CALIENTE, 🟡 TIBIO o 🔵 FRÍO. Explica en una frase por qué. ${contexto}`,
      "proxima-accion": `Basándote en este expediente, sugiere UNA acción concreta que el vendedor debe hacer con este cliente en los próximos días, con fecha sugerida. Sé específico. ${contexto}`,
      resumen: `Resume este expediente en 3-5 líneas para que el vendedor recuerde todo antes de contactar al cliente. Incluye etapa, objeción y dónde quedó la última conversación. ${contexto}`,
      objecion: `El cliente tiene esta objeción: "${cliente.objecion ?? "no está seguro"}". Redacta una respuesta empática y persuasiva de 2-3 oraciones que maneje la objeción y proponga el siguiente paso. ${contexto}`,
    }

    const { Anthropic } = await import("@anthropic-ai/sdk")
    const anthropic = new Anthropic({ apiKey: llaveIA })

    const mensaje = await anthropic.messages.create({
      model: MODELO_ANTHROPIC,
      max_tokens: 300,
      messages: [{ role: "user", content: prompts[accion] ?? `Ayuda con: ${accion}. ${contexto}` }],
    })

    const texto = mensaje.content[0].type === "text" ? mensaje.content[0].text : plantillaLocal(accion, cliente)
    return NextResponse.json({ resultado: texto, fuente: "ia" })
  } catch (error) {
    // Si falla la IA, degradar a plantilla local sin romper la app
    console.error("Error de IA:", error)
    return NextResponse.json({
      resultado: plantillaLocal(accion, cliente),
      fuente: "plantilla",
      aviso: "El asistente de IA tuvo un problema. Usando plantilla de respaldo.",
    })
  }
}
