"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

export function RestaurarBoton({ clienteId }: { clienteId: string }) {
  const [cargando, setCargando] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function restaurar() {
    setCargando(true)
    try {
      await fetch(`/api/clientes/${clienteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "ACTIVO" }),
      })
      toast("Cliente restaurado ✓", "exito")
      router.refresh()
    } catch {
      toast("No se pudo restaurar", "error")
    } finally {
      setCargando(false)
    }
  }

  return (
    <button onClick={restaurar} disabled={cargando} className="btn-secundario text-xs py-1.5 px-3 shrink-0">
      {cargando ? "…" : "Restaurar"}
    </button>
  )
}
