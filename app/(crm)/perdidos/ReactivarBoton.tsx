"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

export function ReactivarBoton({ clienteId }: { clienteId: string }) {
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function reactivar() {
    setCargando(true)
    try {
      await fetch(`/api/clientes/${clienteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "ACTIVO", etapa: "Lista de contactos", motivoPerdida: null, proximaAccion: "Reenganche — contactar de nuevo" }),
      })
      toast("Cliente reactivado ✓", "exito")
      router.refresh()
    } catch {
      toast("No se pudo reactivar", "error")
    } finally {
      setCargando(false)
    }
  }

  return (
    <button onClick={reactivar} disabled={cargando} className="btn-secundario text-xs py-1.5 px-3 shrink-0">
      {cargando ? "…" : "Reactivar"}
    </button>
  )
}
