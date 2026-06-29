"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, Phone, Mail, MessageCircle, Edit3, Trophy,
  XCircle, Archive, Clock, AlertTriangle, Plus, Trash2,
  FileText, Upload, Download, Sparkles, Wallet, Calendar,
  Building2, Tag, CheckCircle2
} from "lucide-react"
import { BadgeEstado, BadgeTemperatura, BadgePago } from "@/components/ui/Badge"
import { useToast } from "@/components/ui/Toast"
import { ModalConfirmacion } from "@/components/ui/Modal"
import { InfoTooltip } from "@/components/ui/Tooltip"
import { formatoFechaHumana, diasDesde } from "@/lib/fechas"

interface Props {
  cliente: any
  config: any
  vendedores: { id: string; nombre: string }[]
  etiquetas: { id: string; nombre: string; color: string }[]
  plantillas: any[]
  usuarioId: string
  esAdmin: boolean
}

export function ExpedienteCliente({ cliente, config, vendedores, etiquetas, plantillas, usuarioId, esAdmin }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [cargando, setCargando] = useState<string | null>(null)
  const [modalGanado, setModalGanado] = useState(false)
  const [modalPerdido, setModalPerdido] = useState(false)
  const [modalArchivar, setModalArchivar] = useState(false)
  const [motivoPerdida, setMotivoPerdida] = useState(cliente.motivoPerdida ?? "")
  const [nuevaNota, setNuevaNota] = useState("")
  const [tab, setTab] = useState<"historial" | "pagos" | "archivos" | "empresa">("historial")

  const diasSinContacto = cliente.ultimoContacto ? diasDesde(new Date(cliente.ultimoContacto)) : null
  const accionVencida = cliente.proximaAccionFecha && new Date(cliente.proximaAccionFecha) < new Date()

  // Construir número de WhatsApp
  const telWA = (cliente.telefonoInternacional ?? cliente.telefono ?? "").replace(/\D/g, "")
  const msgWA = (config?.mensajeWhatsapp ?? "Hola {nombre}, mi nombre es Yazmín Leal...")
    .replace("{nombre}", cliente.nombre.split(" ")[0])
  const urlWA = `https://wa.me/${telWA}?text=${encodeURIComponent(msgWA)}`

  const motivosPerdida: string[] = config?.motivosPerdida ? JSON.parse(config.motivosPerdida) : ["Está caro", "No contestó", "Otro"]

  async function accion(tipo: string, extra?: any) {
    setCargando(tipo)
    try {
      const res = await fetch(`/api/clientes/${cliente.id}/${tipo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extra ?? {}),
      })
      if (!res.ok) throw new Error()
      toast(
        tipo === "ganado" ? `¡Cerraste a ${cliente.nombre}! 🎉` :
        tipo === "perdido" ? "Marcado como perdido" :
        tipo === "archivar" ? "Archivado correctamente" : "Listo",
        "exito"
      )
      router.refresh()
    } catch {
      toast("Algo falló. Inténtalo de nuevo.", "error")
    } finally {
      setCargando(null)
    }
  }

  async function guardarNota() {
    if (!nuevaNota.trim()) return
    setCargando("nota")
    await fetch(`/api/clientes/${cliente.id}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contenido: nuevaNota }),
    })
    setNuevaNota("")
    setCargando(null)
    toast("Nota guardada ✓", "exito")
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-4">
      {/* Volver */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-sm hover:underline"
        style={{ color: "var(--texto-3)" }}
      >
        <ChevronLeft size={16} /> Volver a clientes
      </Link>

      {/* Encabezado del cliente */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: "var(--marca)" }}
          >
            {cliente.nombre[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold" style={{ color: "var(--texto)" }}>{cliente.nombre}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <BadgeEstado estado={cliente.estado} />
              <BadgeTemperatura temp={cliente.temperatura} />
              <InfoTooltip
                texto="Temperatura del cliente"
                consejo="🔥 Caliente = atiéndelo hoy. 🔵 Frío = a futuro. Gasta tu energía primero en los calientes."
              />
            </div>
            {cliente.objecion && (
              <div className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: "var(--texto-3)" }}>
                <AlertTriangle size={14} style={{ color: "var(--ambar)" }} />
                <span>Objeción: <strong style={{ color: "var(--texto)" }}>{cliente.objecion}</strong></span>
                <InfoTooltip texto="Objeción principal" consejo="La razón por la que NO te ha comprado. Úsala para cerrar." />
              </div>
            )}
          </div>
        </div>

        {/* Última acción + días sin contacto */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm border-t pt-4" style={{ borderColor: "var(--border)", color: "var(--texto-2)" }}>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            {diasSinContacto === null
              ? "Sin contacto aún"
              : diasSinContacto === 0
              ? "Contactado hoy"
              : <span className={diasSinContacto > 7 ? "text-red-500 font-semibold" : ""}>{diasSinContacto} días sin contacto</span>
            }
          </div>
          {cliente.proximaAccion && (
            <div className={`flex items-center gap-1.5 ${accionVencida ? "text-red-500 font-semibold" : ""}`}>
              <CheckCircle2 size={14} />
              {accionVencida && "⚠️ "}{cliente.proximaAccion}
              {cliente.proximaAccionFecha && (
                <span className="opacity-70 font-normal">
                  — {new Date(cliente.proximaAccionFecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botones de contacto y estado */}
      <div className="flex flex-wrap gap-2">
        {cliente.telefono && (
          <a href={urlWA} target="_blank" rel="noopener noreferrer" className="btn-marca text-sm">
            <MessageCircle size={16} /> WhatsApp
          </a>
        )}
        {cliente.correo && (
          <a
            href={`mailto:${cliente.correo}?subject=Hola ${cliente.nombre.split(" ")[0]}&body=Hola ${cliente.nombre.split(" ")[0]}, `}
            className="btn-secundario text-sm"
          >
            <Mail size={16} /> Correo
          </a>
        )}
        {cliente.telefono && (
          <a href={`tel:${cliente.telefono}`} className="btn-secundario text-sm">
            <Phone size={16} /> Llamar
          </a>
        )}

        <div className="ml-auto flex gap-2">
          {cliente.estado === "ACTIVO" && (
            <>
              <button onClick={() => setModalGanado(true)} className="btn-secundario text-sm text-green-600">
                <Trophy size={14} /> Ganado 🎉
              </button>
              <button onClick={() => setModalPerdido(true)} className="btn-secundario text-sm">
                <XCircle size={14} /> Perdido
              </button>
            </>
          )}
          <button onClick={() => setModalArchivar(true)} className="btn-secundario text-sm">
            <Archive size={14} /> Archivar
          </button>
          <Link href={`/clientes/${cliente.id}/editar`} className="btn-secundario text-sm">
            <Edit3 size={14} /> Editar
          </Link>
        </div>
      </div>

      {/* Info básica */}
      <div className="card p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        {[
          { label: "Teléfono", valor: cliente.telefono },
          { label: "Correo", valor: cliente.correo },
          { label: "Origen", valor: cliente.origen },
          { label: "Etapa", valor: cliente.etapa },
          { label: "Valor estimado", valor: cliente.valorEstimado ? `$${cliente.valorEstimado.toLocaleString("es-MX")}` : null, tooltip: "Cuánto dinero representa este cliente si cierra. Sirve para saber a quién priorizar." },
          { label: "Zona", valor: cliente.zona },
        ].map(({ label, valor, tooltip }) => valor ? (
          <div key={label}>
            <p className="text-xs font-medium mb-0.5 flex items-center gap-1" style={{ color: "var(--texto-3)" }}>
              {label}
              {tooltip && <InfoTooltip texto={label} consejo={tooltip} />}
            </p>
            <p style={{ color: "var(--texto)" }}>{valor}</p>
          </div>
        ) : null)}
      </div>

      {/* Etiquetas */}
      {cliente.etiquetas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cliente.etiquetas.map(({ etiqueta: e }: any) => (
            <span
              key={e.nombre}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: e.color + "22", color: e.color }}
            >
              <Tag size={10} /> {e.nombre}
            </span>
          ))}
        </div>
      )}

      {/* Nota rápida */}
      <div className="card p-4">
        <label className="text-sm font-medium block mb-2" style={{ color: "var(--texto-2)" }}>Agregar nota</label>
        <div className="flex gap-2">
          <textarea
            value={nuevaNota}
            onChange={e => setNuevaNota(e.target.value)}
            placeholder="¿Qué pasó en esta interacción?"
            rows={2}
            className="flex-1 rounded-xl border px-3 py-2 text-sm resize-none outline-none"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
          />
          <button
            onClick={guardarNota}
            disabled={!nuevaNota.trim() || cargando === "nota"}
            className="btn-marca text-sm px-4 self-end"
          >
            {cargando === "nota" ? "…" : "Guardar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { key: "historial", label: "Historial", icono: Clock },
          { key: "pagos", label: "Pagos", icono: Wallet },
          { key: "archivos", label: "Archivos", icono: FileText },
          { key: "empresa", label: "Empresa", icono: Building2 },
        ].map(({ key, label, icono: Icono }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px"
            style={{
              borderColor: tab === key ? "var(--marca)" : "transparent",
              color: tab === key ? "var(--marca)" : "var(--texto-3)",
            }}
          >
            <Icono size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      {tab === "historial" && (
        <div className="space-y-2">
          {cliente.historial.length === 0 && cliente.notas_rel.length === 0 ? (
            <div className="card p-8 text-center text-sm" style={{ color: "var(--texto-3)" }}>
              Aún no hay historial. Agrega una nota para empezar.
            </div>
          ) : (
            [...cliente.historial, ...cliente.notas_rel.map((n: any) => ({
              tipo: "nota",
              descripcion: n.contenido,
              usuarioNombre: n.usuario.nombre,
              creadoEn: n.fechaReal,
            }))].sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()).map((e: any, i: number) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-1 rounded-full shrink-0 mt-1.5" style={{ background: "var(--marca)", minHeight: 16 }} />
                <div className="flex-1">
                  <p style={{ color: "var(--texto)" }}>{e.descripcion}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--texto-3)" }}>
                    {e.usuarioNombre && `${e.usuarioNombre} · `}{formatoFechaHumana(new Date(e.creadoEn))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "pagos" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: "var(--texto-2)" }}>Pagos registrados</p>
            <Link href={`/pagos/nuevo?clienteId=${cliente.id}`} className="btn-secundario text-xs">
              <Plus size={12} /> Registrar pago
            </Link>
          </div>
          {cliente.pagos.length === 0 ? (
            <div className="card p-6 text-center text-sm" style={{ color: "var(--texto-3)" }}>
              Sin pagos registrados aún.
            </div>
          ) : (
            cliente.pagos.map((p: any) => (
              <div key={p.id} className="card p-3 flex items-center gap-3">
                <Wallet size={16} style={{ color: "var(--acento-pagos)" }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--texto)" }}>${p.monto.toLocaleString("es-MX")} MXN</p>
                  <p className="text-xs" style={{ color: "var(--texto-3)" }}>{p.metodo} · {p.concepto ?? "Sin concepto"}</p>
                </div>
                <BadgePago estatus={p.estatus} />
                {p.fechaPago && (
                  <span className="text-xs" style={{ color: "var(--texto-3)" }}>
                    {new Date(p.fechaPago).toLocaleDateString("es-MX")}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "archivos" && (
        <div className="space-y-3">
          <div className="card border-2 border-dashed p-6 text-center cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors" style={{ borderColor: "var(--border-strong)" }}>
            <Upload size={20} className="mx-auto mb-2" style={{ color: "var(--texto-3)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--texto-2)" }}>Subir archivo</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--texto-3)" }}>PDF, JPG o PNG · máx 5 MB</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 5 * 1024 * 1024) { toast("El archivo es mayor a 5 MB", "error"); return }
                const fd = new FormData()
                fd.append("file", file)
                fd.append("etiqueta", "Otro")
                const r = await fetch(`/api/clientes/${cliente.id}/archivos`, { method: "POST", body: fd })
                if (r.ok) { toast("Archivo guardado ✓", "exito"); router.refresh() }
                else toast("No se pudo subir el archivo", "error")
              }}
            />
          </div>
          {cliente.archivos.map((a: any) => (
            <div key={a.id} className="card p-3 flex items-center gap-3">
              <FileText size={16} style={{ color: "var(--acento-ia)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--texto)" }}>{a.nombre}</p>
                <p className="text-xs" style={{ color: "var(--texto-3)" }}>{a.etiqueta} · {new Date(a.creadoEn).toLocaleDateString("es-MX")}</p>
              </div>
              <a
                href={`/api/clientes/${cliente.id}/archivos/${a.id}`}
                download={a.nombre}
                className="btn-secundario text-xs p-2"
                aria-label="Descargar archivo"
              >
                <Download size={14} />
              </a>
            </div>
          ))}
        </div>
      )}

      {tab === "empresa" && (
        <div className="card p-5 grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Empresa", valor: cliente.empresaNombre },
            { label: "Giro / industria", valor: cliente.empresaGiro },
            { label: "Puesto / cargo", valor: cliente.empresaPuesto },
            { label: "RFC / ID fiscal", valor: cliente.empresaRFC },
            { label: "Sitio web o redes", valor: cliente.empresaSitio },
            { label: "Dirección", valor: cliente.empresaDireccion },
            { label: "Notas de la empresa", valor: cliente.empresaNotas },
          ].map(({ label, valor }) => (
            <div key={label}>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--texto-3)" }}>{label}</p>
              <p style={{ color: "var(--texto)" }}>{valor ?? <span style={{ color: "var(--texto-3)" }}>—</span>}</p>
            </div>
          ))}
          <div className="col-span-2">
            <Link href={`/clientes/${cliente.id}/editar`} className="btn-secundario text-sm">
              <Edit3 size={14} /> Editar empresa
            </Link>
          </div>
        </div>
      )}

      {/* Asistente IA */}
      <div className="card p-4" style={{ background: "linear-gradient(135deg, var(--marca-light), var(--bg-card))" }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: "var(--acento-ia)" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--texto)" }}>Asistente IA</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { accion: "mensaje", label: "Redactar mensaje" },
            { accion: "temperatura", label: "Clasificar temperatura" },
            { accion: "proxima-accion", label: "Sugerir próxima acción" },
            { accion: "resumen", label: "Resumir expediente" },
            { accion: "objecion", label: "Manejar objeción" },
          ].map(({ accion, label }) => (
            <button
              key={accion}
              onClick={async () => {
                setCargando(accion)
                try {
                  const res = await fetch(`/api/ia/cliente/${cliente.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion }),
                  })
                  const data = await res.json()
                  if (data.resultado) {
                    alert(data.resultado) // En producción esto sería un modal elegante
                  }
                } catch {
                  toast("El asistente IA no está disponible en este momento.", "info")
                } finally {
                  setCargando(null)
                }
              }}
              disabled={!!cargando}
              className="btn-secundario text-xs"
            >
              <Sparkles size={12} /> {cargando === accion ? "Generando…" : label}
            </button>
          ))}
        </div>
      </div>

      {/* Modales de confirmación */}
      <ModalConfirmacion
        abierto={modalGanado}
        onCerrar={() => setModalGanado(false)}
        onConfirmar={() => { setModalGanado(false); accion("ganado") }}
        titulo="Marcar como Ganado 🎉"
        mensaje={`¿Confirmas que cerraste a ${cliente.nombre}? Esto lo moverá a "Clientes completados" y sumará su valor al mes.`}
        labelConfirmar="Sí, ¡lo cerré! 🎉"
        cargando={cargando === "ganado"}
      />

      <ModalConfirmacion
        abierto={modalArchivar}
        onCerrar={() => setModalArchivar(false)}
        onConfirmar={() => { setModalArchivar(false); accion("archivar") }}
        titulo={`Archivar a ${cliente.nombre}`}
        mensaje="Podrás restaurarlo cuando quieras desde la sección Archivados. No se pierde nada."
        labelConfirmar="Archivar"
        cargando={cargando === "archivar"}
      />

      {/* Modal Perdido con motivo */}
      {modalPerdido && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalPerdido(false)} />
          <div className="relative card-glass w-full max-w-sm p-6 z-10">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--texto)" }}>Marcar como perdido</h2>
            <label className="text-sm font-medium block mb-2" style={{ color: "var(--texto-2)" }}>¿Por qué se perdió?</label>
            <select
              value={motivoPerdida}
              onChange={e => setMotivoPerdida(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5 text-sm mb-4"
              style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto)" }}
            >
              <option value="">Selecciona un motivo</option>
              {["Está caro", "Se fue con la competencia", "No contestó", "No es buen momento", "No calificaba", "Otro"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalPerdido(false)} className="btn-secundario text-sm">Cancelar</button>
              <button
                onClick={() => {
                  setModalPerdido(false)
                  accion("perdido", { motivo: motivoPerdida })
                }}
                disabled={!motivoPerdida}
                className="btn-secundario text-sm"
                style={{ color: "var(--texto-2)" }}
              >
                Marcar como perdido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
