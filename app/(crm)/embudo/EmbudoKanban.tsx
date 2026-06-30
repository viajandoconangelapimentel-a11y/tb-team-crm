"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DndContext, DragOverlay, closestCenter,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Clock, AlertTriangle } from "lucide-react"
import { BadgeTemperatura } from "@/components/ui/Badge"
import { diasDesde } from "@/lib/fechas"

interface Cliente {
  id: string
  nombre: string
  etapa: string
  temperatura: string
  valorEstimado: number
  proximaAccionFecha: string | null
  actualizadoEn: string
  etiquetas: { etiqueta: { nombre: string; color: string } }[]
}

interface Props {
  clientes: Cliente[]
  etapas: string[]
  umbralDias: number
}

const COLORES_TARJETA = [
  { bg: "#fce8f1", border: "#e07ba8", texto: "#b85580" },
  { bg: "#e8f4ff", border: "#4f88e3", texto: "#2563c0" },
  { bg: "#f0ebff", border: "#7c5cbf", texto: "#5b3fa0" },
  { bg: "#e8faf2", border: "#22a85a", texto: "#16803d" },
  { bg: "#fff8e8", border: "#e8a012", texto: "#b57800" },
  { bg: "#ffe8e8", border: "#e05a5a", texto: "#b83030" },
  { bg: "#e8f8ff", border: "#0891b2", texto: "#0670a0" },
  { bg: "#f5ffe8", border: "#6abf22", texto: "#4a8f0f" },
]

function colorCliente(nombre: string) {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  return COLORES_TARJETA[Math.abs(hash) % COLORES_TARJETA.length]
}

function TarjetaCliente({ cliente, umbralDias, overlay = false }: { cliente: Cliente; umbralDias: number; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cliente.id })
  const accionVencida = cliente.proximaAccionFecha && new Date(cliente.proximaAccionFecha) < new Date()
  const diasEtapa = diasDesde(new Date(cliente.actualizadoEn))
  const estancado = diasEtapa >= umbralDias

  const color = colorCliente(cliente.nombre)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: color.bg, borderColor: color.border, borderWidth: 1, borderStyle: "solid" }}
      {...attributes}
      {...listeners}
      className={`rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all ${overlay ? "rotate-1 shadow-lg" : "hover:shadow-md"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <Link
          href={`/clientes/${cliente.id}`}
          className="text-sm font-semibold leading-tight hover:underline"
          style={{ color: color.texto }}
          onClick={e => e.stopPropagation()}
        >
          {cliente.nombre}
        </Link>
        <BadgeTemperatura temp={cliente.temperatura} />
      </div>

      {cliente.valorEstimado > 0 && (
        <p className="text-xs font-medium mb-1.5" style={{ color: "var(--acento-pagos)" }}>
          ${cliente.valorEstimado.toLocaleString("es-MX")}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {accionVencida && (
          <span className="text-[10px] font-semibold flex items-center gap-0.5 text-red-500">
            <AlertTriangle size={10} /> Vencida
          </span>
        )}
        {estancado && (
          <span className="text-[10px] font-medium flex items-center gap-0.5" style={{ color: "var(--ambar)" }}>
            <Clock size={10} /> {diasEtapa}d sin avanzar
          </span>
        )}
        {cliente.etiquetas.slice(0, 2).map(({ etiqueta: e }) => (
          <span key={e.nombre} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: e.color + "22", color: e.color }}>
            {e.nombre}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EmbudoKanban({ clientes, etapas, umbralDias }: Props) {
  const router = useRouter()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [clientesLocales, setClientesLocales] = useState(clientes)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  )

  const draggingCliente = clientesLocales.find(c => c.id === draggingId)

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDraggingId(null)
    if (!over || active.id === over.id) return

    // over.id puede ser un clienteId o un etapaId (columna vacía)
    const etapaDestino = etapas.includes(over.id as string)
      ? over.id as string
      : clientesLocales.find(c => c.id === over.id)?.etapa

    if (!etapaDestino) return

    // Actualizar local inmediatamente
    setClientesLocales(prev => prev.map(c => c.id === active.id ? { ...c, etapa: etapaDestino } : c))

    // Sincronizar con el servidor
    try {
      await fetch(`/api/clientes/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etapa: etapaDestino }),
      })
      router.refresh()
    } catch {
      // Revertir si falla
      setClientesLocales(clientes)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e: DragStartEvent) => setDraggingId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      {/* Scroll horizontal en mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {etapas.map(etapa => {
            const clientesEtapa = clientesLocales.filter(c => c.etapa === etapa)
            const totalEtapa = clientesEtapa.reduce((s, c) => s + c.valorEstimado, 0)

            return (
              <SortableContext
                key={etapa}
                id={etapa}
                items={clientesEtapa.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-col w-60 shrink-0"
                  style={{ minHeight: 200 }}
                >
                  {/* Encabezado de columna */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--texto-2)" }} title={etapa}>
                        {etapa}
                      </p>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 shrink-0"
                        style={{ background: "var(--marca-light)", color: "var(--marca-dark)" }}
                      >
                        {clientesEtapa.length}
                      </span>
                    </div>
                    {totalEtapa > 0 && (
                      <p className="text-[10px]" style={{ color: "var(--acento-pagos)" }}>
                        ${totalEtapa.toLocaleString("es-MX")} en esta etapa
                      </p>
                    )}
                  </div>

                  {/* Área de tarjetas */}
                  <div
                    className="flex-1 space-y-2 p-2 rounded-xl min-h-[120px]"
                    style={{ background: "var(--border)" }}
                    data-droppable-id={etapa}
                  >
                    {clientesEtapa.length === 0 ? (
                      <div className="flex items-center justify-center h-16 text-xs" style={{ color: "var(--texto-3)" }}>
                        Sin clientes
                      </div>
                    ) : (
                      clientesEtapa.map(c => (
                        <TarjetaCliente key={c.id} cliente={c} umbralDias={umbralDias} />
                      ))
                    )}
                  </div>
                </div>
              </SortableContext>
            )
          })}
        </div>
      </div>

      <DragOverlay>
        {draggingCliente && (
          <TarjetaCliente cliente={draggingCliente} umbralDias={umbralDias} overlay />
        )}
      </DragOverlay>
    </DndContext>
  )
}
