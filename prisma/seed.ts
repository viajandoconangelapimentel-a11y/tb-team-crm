import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Verificar si ya hay datos
  const totalUsuarios = await prisma.usuario.count()
  if (totalUsuarios > 0) {
    console.log("⚠️  Ya hay datos en la base. El seed no pisa datos reales. Usa --force si quieres resiembrar.")
    process.exit(0)
  }

  console.log("🌱 Sembrando datos iniciales…")

  // ─── CONFIG DEL NEGOCIO ───────────────────────────────────────────────────
  await prisma.configNegocio.upsert({
    where: { id: "1" },
    update: {},
    create: {
      id: "1",
      nombreNegocio: "TB Team Agentes Yaz",
      colorMarca: "#e07ba8",
      moneda: "MXN",
      husoHorario: "America/Cancun",
      horarioInicio: "09:00",
      horarioFin: "12:00",
      duracionCitaMin: 30,
      metaMesClientes: 10,
      mensajeWhatsapp: "Hola {nombre}, mi nombre es Yazmín Leal, gracias por tu interés. ¿Te late si agendamos una llamada para platicarte cómo te puedo ayudar?",
      numeroWhatsapp: "5219981234567",
    },
  })

  // ─── USUARIOS ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("TBTeam2026!", 12)
  const vendHash = await bcrypt.hash("Vendedor2026!", 12)

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Yazmín Leal (Admin)",
      correo: "admin@tbteam.mx",
      passwordHash: adminHash,
      rol: "ADMIN",
      metaMesClientes: 10,
      onboardingCompletado: false,
    },
  })

  const vendedora = await prisma.usuario.create({
    data: {
      nombre: "Karla Pérez",
      correo: "karla@tbteam.mx",
      passwordHash: vendHash,
      rol: "VENDEDOR",
      metaMesClientes: 5,
      onboardingCompletado: false,
    },
  })

  console.log("✅ Usuarios creados")

  // ─── ETIQUETAS ───────────────────────────────────────────────────────────
  const [etVIP, etReferido, etAnticipoP] = await Promise.all([
    prisma.etiqueta.create({ data: { nombre: "VIP", color: "#e07ba8" } }),
    prisma.etiqueta.create({ data: { nombre: "Referido", color: "#22a85a" } }),
    prisma.etiqueta.create({ data: { nombre: "Pagó anticipo", color: "#e8a012" } }),
  ])
  console.log("✅ Etiquetas creadas")

  // ─── PLANTILLAS DE MENSAJES ───────────────────────────────────────────────
  const plantillasGlobales = [
    {
      nombre: "Primer contacto (caliente)",
      tipo: "whatsapp",
      cuerpo: "Hola {nombre} 👋, mi nombre es Yazmín Leal. Vi tu interés en empezar tu propia agencia de viajes desde casa. Me encantaría platicarte cómo lo puedes lograr sin experiencia. ¿Tienes 15 minutos esta semana para una llamada rápida?",
      etapa: "Lista de contactos",
      esGlobal: true,
    },
    {
      nombre: "Seguimiento — 'está caro'",
      tipo: "whatsapp",
      cuerpo: "Hola {nombre}, quería retomar nuestra plática. Entiendo que el precio es importante y por eso quiero mostrarte cómo muchas agentes recuperan su inversión en el primer mes con solo 2-3 ventas. ¿Te cuento cómo? ¿Tienes 10 minutos hoy?",
      objecion: "Está caro",
      esGlobal: true,
    },
    {
      nombre: "Seguimiento — 'lo voy a pensar'",
      tipo: "whatsapp",
      cuerpo: "Hola {nombre}! Solo quería saber si tuviste chance de pensar en la propuesta. ¿Qué es lo que necesitas para tomar la decisión? Así puedo darte exactamente la información que te ayude. 😊",
      objecion: "Lo voy a pensar",
      esGlobal: true,
    },
    {
      nombre: "Confirmar cita",
      tipo: "whatsapp",
      cuerpo: "Hola {nombre} 😊, te escribo para confirmar nuestra llamada de mañana. ¿Seguimos bien? Tengo muchas ganas de contarte cómo puedes empezar tu agencia de viajes. ¡Nos vemos!",
      etapa: "Presentación",
      esGlobal: true,
    },
    {
      nombre: "Pedir referidos (post-venta)",
      tipo: "whatsapp",
      cuerpo: "Hola {nombre}! ¿Cómo te está yendo con tu agencia? 🌴 Oye, ¿tienes alguna amiga o familiar que quiera hacer lo mismo que tú y generar ingresos desde casa? Con gusto la orientamos sin ningún costo.",
      etapa: "Alta en ESCALA",
      esGlobal: true,
    },
    {
      nombre: "Reactivar a un frío",
      tipo: "whatsapp",
      cuerpo: "Hola {nombre}! Han pasado unos días y quería saber cómo estás. ¿Sigues interesada en lo de la agencia de viajes? Tenemos una novedad que creo que te va a interesar mucho. ¿Tienes un momento esta semana?",
      esGlobal: true,
    },
  ]

  for (const p of plantillasGlobales) {
    await prisma.plantilla.create({ data: p as any })
  }
  console.log("✅ Plantillas creadas")

  // ─── CLIENTES CON HISTORIAL DE 6 MESES ───────────────────────────────────
  const hoy = new Date()
  const hace = (meses: number, dias = 0) => {
    const d = new Date(hoy)
    d.setMonth(d.getMonth() - meses)
    d.setDate(d.getDate() - dias)
    return d
  }

  const clientesData = [
    // ── ACTIVOS (variedad de etapas) ──
    {
      nombre: "Valentina Sosa Aguilar",
      telefono: "9981234567",
      telefonoInternacional: "529981234567",
      correo: "valentina.sosa@ejemplo.mx",
      origen: "Instagram",
      utmSource: "instagram",
      etapa: "Seguimiento 1 resolver dudas",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      objecion: "Está caro",
      valorEstimado: 3500,
      proximaAccion: "Llamar y resolver sus dudas de precio",
      proximaAccionFecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Vencida
      zona: "Cancún, Q. Roo",
      notas: "Muy interesada pero le preocupa el costo inicial. Tiene 2 hijos y quiere trabajo desde casa.",
      vendedorId: admin.id,
    },
    {
      nombre: "Maricruz Hernández",
      telefono: "9989876543",
      telefonoInternacional: "529989876543",
      correo: "maricruz.h@ejemplo.mx",
      origen: "Facebook",
      utmSource: "facebook",
      etapa: "Presentación",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      objecion: "Lo voy a pensar",
      valorEstimado: 3500,
      proximaAccion: "Enviar presentación Zoom y confirmar fecha",
      proximaAccionFecha: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      zona: "Playa del Carmen, Q. Roo",
      notas: "Le interesó mucho la oportunidad. Dijo que lo pensaría, pero está muy cálida.",
      vendedorId: admin.id,
    },
    {
      nombre: "Daniela Ruiz Castro",
      telefono: "9984445678",
      telefonoInternacional: "529984445678",
      correo: "daniela.ruiz@ejemplo.mx",
      origen: "Recomendado",
      etapa: "Seguimiento 2 envío de link de registro e instrucciones",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 3500,
      proximaAccion: "Enviar link de registro",
      proximaAccionFecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      zona: "Cancún, Q. Roo",
      notas: "La refirió Valentina. Está muy interesada y motivada.",
      vendedorId: admin.id,
    },
    {
      nombre: "Karina Sánchez Morales",
      telefono: "9981112233",
      telefonoInternacional: "529981112233",
      origen: "Landing",
      utmSource: "Landing",
      etapa: "Invitación",
      estado: "ACTIVO",
      temperatura: "TIBIO",
      objecion: "No es buen momento",
      valorEstimado: 3500,
      proximaAccion: "Invitar al siguiente Zoom de presentación",
      proximaAccionFecha: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      zona: "Cancún, Q. Roo",
      notas: "Llegó por la landing de Instagram. Dice que no es buen momento pero sigue leyendo.",
      vendedorId: admin.id,
    },
    {
      nombre: "Patricia Leal Ortiz",
      telefono: "9983334455",
      telefonoInternacional: "529983334455",
      correo: "patricia.leal@ejemplo.mx",
      origen: "WhatsApp",
      etapa: "Alta en ESCALA",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 3500,
      proximaAccion: "Acompañar proceso de alta en ESCALA",
      proximaAccionFecha: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      zona: "Cancún, Q. Roo",
      notas: "Ya está en proceso de alta. Va muy bien.",
      vendedorId: vendedora.id,
    },
    {
      nombre: "Rosa Elena Pérez",
      telefono: "9985556677",
      origen: "Instagram",
      utmSource: "instagram",
      etapa: "Información",
      estado: "ACTIVO",
      temperatura: "TIBIO",
      objecion: "Tengo que consultarlo con mi pareja/socio",
      valorEstimado: 3500,
      proximaAccion: "Dar seguimiento — preguntar si platicó con su esposo",
      proximaAccionFecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Vencida
      zona: "Mérida, Yucatán",
      vendedorId: vendedora.id,
    },
    {
      nombre: "Fernanda Gutiérrez",
      telefono: "9987778899",
      origen: "Facebook",
      utmSource: "facebook",
      etapa: "Lista de contactos",
      estado: "ACTIVO",
      temperatura: "FRIO",
      valorEstimado: 3500,
      proximaAccion: "Primer contacto",
      proximaAccionFecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      zona: "Cancún, Q. Roo",
      notas: "Recién captada. No ha tenido contacto aún.",
      vendedorId: admin.id,
    },
    {
      nombre: "Sofía Ramírez Vargas",
      telefono: "9986665544",
      correo: "sofia.ramirez@ejemplo.mx",
      origen: "Instagram",
      utmSource: "instagram",
      etapa: "Seguimiento 3 Certificación PTA",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 3500,
      proximaAccion: "Acompañar en proceso de certificación PTA",
      proximaAccionFecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      zona: "Cancún, Q. Roo",
      vendedorId: admin.id,
    },
  ]

  const clientesCreados = []
  for (const c of clientesData) {
    const cliente = await prisma.cliente.create({ data: c as any })
    clientesCreados.push(cliente)
  }

  // ── GANADOS (historial de 6 meses para la gráfica) ──
  const ganados = [
    { mes: 5, nombre: "Carmen Vega Domínguez", valor: 3500 },
    { mes: 5, nombre: "Lucía Torres Acosta", valor: 3500 },
    { mes: 4, nombre: "Rebeca Méndez Santos", valor: 3500 },
    { mes: 4, nombre: "Ana Flor Jiménez", valor: 3500 },
    { mes: 3, nombre: "Mónica Reyes Canul", valor: 3500 },
    { mes: 2, nombre: "Gloria Sánchez Luna", valor: 3500 },
    { mes: 2, nombre: "Teresa Ayala Balam", valor: 3500 },
    { mes: 1, nombre: "Ingrid Palma Castillo", valor: 3500 },
    { mes: 1, nombre: "Vanessa Cruz Domínguez", valor: 3500 },
    { mes: 1, nombre: "Norma Ávila Torres", valor: 3500 },
    { mes: 0, nombre: "Beatriz Leal García", valor: 3500 },
  ]

  for (const g of ganados) {
    const fechaGanado = hace(g.mes, Math.floor(Math.random() * 15))
    await prisma.cliente.create({
      data: {
        nombre: g.nombre,
        origen: ["Instagram", "Facebook", "Recomendado", "Landing"][Math.floor(Math.random() * 4)],
        etapa: "Alta en grupos de difusión",
        estado: "GANADO",
        temperatura: "CALIENTE",
        valorEstimado: g.valor,
        ganadoEn: fechaGanado,
        zona: "Cancún, Q. Roo",
        vendedorId: admin.id,
      },
    })
  }

  // ── PERDIDO ──
  await prisma.cliente.create({
    data: {
      nombre: "Alejandra Flores Ríos",
      telefono: "9989990011",
      origen: "Instagram",
      etapa: "Presentación",
      estado: "PERDIDO",
      temperatura: "FRIO",
      objecion: "Está caro",
      motivoPerdida: "Está caro",
      valorEstimado: 3500,
      perdidoEn: hace(1, 10),
      zona: "Cancún, Q. Roo",
      vendedorId: admin.id,
    },
  })

  // ── ARCHIVADO ──
  await prisma.cliente.create({
    data: {
      nombre: "Margarita Quiñones Cab",
      origen: "Facebook",
      etapa: "Información",
      estado: "ARCHIVADO",
      temperatura: "FRIO",
      valorEstimado: 3500,
      archivaEn: hace(2, 5),
      zona: "Mérida, Yucatán",
      vendedorId: admin.id,
    },
  })

  console.log("✅ Clientes creados")

  // ─── PAGOS ───────────────────────────────────────────────────────────────
  const clienteActivo = clientesCreados.find(c => c.nombre.includes("Valentina"))!
  const clienteActivo2 = clientesCreados.find(c => c.nombre.includes("Maricruz"))!

  if (clienteActivo) {
    await prisma.pago.create({
      data: {
        clienteId: clienteActivo.id,
        vendedorId: admin.id,
        monto: 1750,
        metodo: "Transferencia",
        estatus: "pagado",
        concepto: "Anticipo afiliación TB Team",
        esParcialidad: true,
        totalContrato: 3500,
        fechaPago: hace(0, 3),
        folioConsecutivo: 1,
      },
    })

    await prisma.pago.create({
      data: {
        clienteId: clienteActivo.id,
        vendedorId: admin.id,
        monto: 1750,
        metodo: "Transferencia",
        estatus: "pendiente",
        concepto: "Segunda parcialidad afiliación TB Team",
        esParcialidad: true,
        totalContrato: 3500,
        fechaVencimiento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Vencido
        folioConsecutivo: 2,
      },
    })
  }

  if (clienteActivo2) {
    await prisma.pago.create({
      data: {
        clienteId: clienteActivo2.id,
        vendedorId: admin.id,
        monto: 3500,
        metodo: "Liga de pago",
        estatus: "pagado",
        concepto: "Afiliación TB Team — pago completo",
        fechaPago: hace(0, 1),
        folioConsecutivo: 3,
      },
    })
  }

  // Pagos históricos de los ganados (para el dashboard)
  const ganadosDB = await prisma.cliente.findMany({ where: { estado: "GANADO" }, select: { id: true, ganadoEn: true, vendedorId: true } })
  let folio = 4
  for (const g of ganadosDB) {
    await prisma.pago.create({
      data: {
        clienteId: g.id,
        vendedorId: g.vendedorId!,
        monto: 3500,
        metodo: ["Transferencia", "Tarjeta", "Liga de pago"][Math.floor(Math.random() * 3)],
        estatus: "pagado",
        concepto: "Afiliación TB Team",
        fechaPago: g.ganadoEn ? new Date(g.ganadoEn) : hoy,
        folioConsecutivo: folio++,
      },
    })
  }

  console.log("✅ Pagos creados")

  // ─── CITAS ───────────────────────────────────────────────────────────────
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  const pasado = new Date(hoy)
  pasado.setDate(pasado.getDate() - 3)

  await prisma.cita.createMany({
    data: [
      {
        titulo: `Llamada con ${clientesCreados[0]?.nombre ?? "cliente"}`,
        clienteId: clientesCreados[0]?.id,
        vendedorId: admin.id,
        inicio: new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 10, 0),
        fin: new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 10, 30),
        origen: "Manual",
      },
      {
        titulo: `Presentación Zoom con ${clientesCreados[1]?.nombre ?? "cliente"}`,
        clienteId: clientesCreados[1]?.id,
        vendedorId: admin.id,
        inicio: new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 11, 0),
        fin: new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 11, 30),
        origen: "Manual",
      },
      {
        titulo: "Llamada de seguimiento — Patricia",
        clienteId: clientesCreados[4]?.id,
        vendedorId: vendedora.id,
        inicio: new Date(pasado.getFullYear(), pasado.getMonth(), pasado.getDate(), 9, 30),
        fin: new Date(pasado.getFullYear(), pasado.getMonth(), pasado.getDate(), 10, 0),
        confirmada: true,
        origen: "Manual",
      },
    ],
  })

  console.log("✅ Citas creadas")

  // ─── NOTAS ───────────────────────────────────────────────────────────────
  if (clientesCreados[0]) {
    await prisma.nota.createMany({
      data: [
        {
          clienteId: clientesCreados[0].id,
          usuarioId: admin.id,
          contenido: "Primera llamada realizada. Muy interesada pero le preocupa el precio. Le expliqué el ROI y quedó más tranquila.",
          tipo: "llamada",
          fechaReal: hace(0, 7),
        },
        {
          clienteId: clientesCreados[0].id,
          usuarioId: admin.id,
          contenido: "Segundo contacto. Dijo que ya habló con su esposo y le parece bien. Quiere saber más detalles antes de decidir.",
          tipo: "mensaje",
          fechaReal: hace(0, 4),
        },
      ],
    })
  }

  // ─── HISTORIAL DE EVENTOS ─────────────────────────────────────────────────
  for (const c of clientesCreados.slice(0, 4)) {
    await prisma.eventoHistorial.create({
      data: {
        clienteId: c.id,
        tipo: "creacion",
        descripcion: "Cliente creado",
        usuarioNombre: "Yazmín Leal (Admin)",
        creadoEn: hace(0, 14),
      },
    })
  }

  console.log("✅ Historial creado")
  console.log("")
  console.log("🎉 ¡Seed completado! Tu CRM está listo.")
  console.log("")
  console.log("╔══════════════════════════════════════════╗")
  console.log("║        CREDENCIALES DE ACCESO            ║")
  console.log("║                                          ║")
  console.log("║  ADMIN:                                  ║")
  console.log("║    Correo: admin@tbteam.mx               ║")
  console.log("║    Password: TBTeam2026!                 ║")
  console.log("║                                          ║")
  console.log("║  VENDEDORA:                              ║")
  console.log("║    Correo: karla@tbteam.mx               ║")
  console.log("║    Password: Vendedor2026!               ║")
  console.log("╚══════════════════════════════════════════╝")
  console.log("")
  console.log("  Corre: npm run dev")
  console.log("  Abre:  http://localhost:3000")
}

main()
  .catch(e => { console.error("Error en seed:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
