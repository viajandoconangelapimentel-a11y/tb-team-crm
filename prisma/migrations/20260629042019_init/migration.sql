-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "metaMesClientes" INTEGER NOT NULL DEFAULT 10,
    "metaMesDinero" REAL NOT NULL DEFAULT 0,
    "comisionPorcentaje" REAL,
    "tema" TEXT NOT NULL DEFAULT 'automatico',
    "vistaDensa" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompletado" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetPasswordExpira" DATETIME,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "telefonoInternacional" TEXT,
    "correo" TEXT,
    "origen" TEXT,
    "utmSource" TEXT,
    "etapa" TEXT NOT NULL DEFAULT 'Lista de contactos',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "temperatura" TEXT NOT NULL DEFAULT 'TIBIO',
    "objecion" TEXT,
    "motivoPerdida" TEXT,
    "valorEstimado" REAL NOT NULL DEFAULT 0,
    "proximaAccion" TEXT,
    "proximaAccionFecha" DATETIME,
    "ultimoContacto" DATETIME,
    "vendedorId" TEXT,
    "cumpleanos" DATETIME,
    "zona" TEXT,
    "documentosRecibidos" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "duplicadoDe" TEXT,
    "eliminadoEn" DATETIME,
    "empresaNombre" TEXT,
    "empresaGiro" TEXT,
    "empresaPuesto" TEXT,
    "empresaRFC" TEXT,
    "empresaSitio" TEXT,
    "empresaDireccion" TEXT,
    "empresaTamano" TEXT,
    "empresaNotas" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "archivaEn" DATETIME,
    "ganadoEn" DATETIME,
    "perdidoEn" DATETIME,
    CONSTRAINT "clientes_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "clienteId" TEXT,
    "vendedorId" TEXT,
    "inicio" DATETIME NOT NULL,
    "fin" DATETIME NOT NULL,
    "googleEventId" TEXT,
    "meetLink" TEXT,
    "confirmada" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "origen" TEXT,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "citas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "citas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT,
    "monto" REAL NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "metodo" TEXT NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'pendiente',
    "concepto" TEXT,
    "folioConsecutivo" INTEGER,
    "fechaPago" DATETIME,
    "fechaVencimiento" DATETIME,
    "esParcialidad" BOOLEAN NOT NULL DEFAULT false,
    "totalContrato" REAL,
    "notas" TEXT,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "pagos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pagos_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'nota',
    "fechaReal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "eventos_historial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "usuarioNombre" TEXT,
    "metadata" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "eventos_historial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "archivos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL DEFAULT 'Otro',
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "datos" TEXT,
    "urlExterno" TEXT,
    "subidoPor" TEXT,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "archivos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaVence" DATETIME,
    "horaVence" TEXT,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "completadaEn" DATETIME,
    "tipo" TEXT NOT NULL DEFAULT 'recordatorio',
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tareas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tareas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "etiquetas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#e07ba8',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cliente_etiquetas" (
    "clienteId" TEXT NOT NULL,
    "etiquetaId" TEXT NOT NULL,

    PRIMARY KEY ("clienteId", "etiquetaId"),
    CONSTRAINT "cliente_etiquetas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cliente_etiquetas_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "etiquetas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plantillas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'whatsapp',
    "asunto" TEXT,
    "cuerpo" TEXT NOT NULL,
    "etapa" TEXT,
    "objecion" TEXT,
    "esFavorita" BOOLEAN NOT NULL DEFAULT false,
    "esGlobal" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plantillas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favoritos" (
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,

    PRIMARY KEY ("usuarioId", "clienteId"),
    CONSTRAINT "favoritos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favoritos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "config_negocio" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '1',
    "nombreNegocio" TEXT NOT NULL DEFAULT 'TB Team Agentes Yaz',
    "colorMarca" TEXT NOT NULL DEFAULT '#e07ba8',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "husoHorario" TEXT NOT NULL DEFAULT 'America/Cancun',
    "horarioInicio" TEXT NOT NULL DEFAULT '09:00',
    "horarioFin" TEXT NOT NULL DEFAULT '12:00',
    "duracionCitaMin" INTEGER NOT NULL DEFAULT 30,
    "mensajeWhatsapp" TEXT NOT NULL DEFAULT 'Hola {nombre}, mi nombre es Yazmín Leal, gracias por tu interés. ¿Te late si agendamos una llamada para platicarte cómo te puedo ayudar?',
    "metaMesClientes" INTEGER NOT NULL DEFAULT 10,
    "comisionGlobal" REAL,
    "umbralEstancamientoDias" INTEGER NOT NULL DEFAULT 7,
    "motivosPerdida" TEXT NOT NULL DEFAULT '["Está caro","Se fue con la competencia","No contestó","No es buen momento","No calificaba","Otro"]',
    "metodosPago" TEXT NOT NULL DEFAULT '["Transferencia","Tarjeta","Liga de pago"]',
    "etapasEmbudo" TEXT NOT NULL DEFAULT '["Lista de contactos","Información","Invitación","Presentación","Seguimiento 1 resolver dudas","Seguimiento 2 envío de link de registro e instrucciones","Seguimiento 3 Certificación PTA","Alta en ESCALA","Alta en grupos de difusión","Sesión Presentación Zoom","Contacto semana 1","Contacto semana 2","Contacto semana 3","Contacto semana 4"]',
    "logoUrl" TEXT,
    "numeroWhatsapp" TEXT NOT NULL DEFAULT '5219981234567',
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "registros_auditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "descripcion" TEXT NOT NULL,
    "ip" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "registros_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "columnas_vistas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "vista" TEXT NOT NULL,
    "columnas" TEXT NOT NULL,
    CONSTRAINT "columnas_vistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leads_landing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "correo" TEXT,
    "utmSource" TEXT,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "clientes_nombre_idx" ON "clientes"("nombre");

-- CreateIndex
CREATE INDEX "clientes_telefono_idx" ON "clientes"("telefono");

-- CreateIndex
CREATE INDEX "clientes_correo_idx" ON "clientes"("correo");

-- CreateIndex
CREATE INDEX "clientes_etapa_idx" ON "clientes"("etapa");

-- CreateIndex
CREATE INDEX "clientes_estado_idx" ON "clientes"("estado");

-- CreateIndex
CREATE INDEX "clientes_vendedorId_idx" ON "clientes"("vendedorId");

-- CreateIndex
CREATE INDEX "clientes_eliminadoEn_idx" ON "clientes"("eliminadoEn");

-- CreateIndex
CREATE INDEX "citas_clienteId_idx" ON "citas"("clienteId");

-- CreateIndex
CREATE INDEX "citas_vendedorId_idx" ON "citas"("vendedorId");

-- CreateIndex
CREATE INDEX "citas_inicio_idx" ON "citas"("inicio");

-- CreateIndex
CREATE INDEX "pagos_clienteId_idx" ON "pagos"("clienteId");

-- CreateIndex
CREATE INDEX "pagos_estatus_idx" ON "pagos"("estatus");

-- CreateIndex
CREATE INDEX "notas_clienteId_idx" ON "notas"("clienteId");

-- CreateIndex
CREATE INDEX "eventos_historial_clienteId_idx" ON "eventos_historial"("clienteId");

-- CreateIndex
CREATE INDEX "eventos_historial_creadoEn_idx" ON "eventos_historial"("creadoEn");

-- CreateIndex
CREATE INDEX "archivos_clienteId_idx" ON "archivos"("clienteId");

-- CreateIndex
CREATE INDEX "tareas_usuarioId_idx" ON "tareas"("usuarioId");

-- CreateIndex
CREATE INDEX "tareas_fechaVence_idx" ON "tareas"("fechaVence");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nombre_key" ON "etiquetas"("nombre");

-- CreateIndex
CREATE INDEX "plantillas_usuarioId_idx" ON "plantillas"("usuarioId");

-- CreateIndex
CREATE INDEX "registros_auditoria_usuarioId_idx" ON "registros_auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "registros_auditoria_creadoEn_idx" ON "registros_auditoria"("creadoEn");

-- CreateIndex
CREATE UNIQUE INDEX "columnas_vistas_usuarioId_vista_key" ON "columnas_vistas"("usuarioId", "vista");
