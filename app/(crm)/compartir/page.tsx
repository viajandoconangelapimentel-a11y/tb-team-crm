"use client"
import { useState, useEffect } from "react"
import { Share2, Copy, Check, Download, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import QRCode from "qrcode"

const CANALES = [
  { key: "instagram", label: "Instagram", emoji: "📸" },
  { key: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { key: "facebook", label: "Facebook", emoji: "👍" },
  { key: "volante", label: "Volante", emoji: "📄" },
]

export default function CompartirPage() {
  const { toast } = useToast()
  const [copiado, setCopiado] = useState<string | null>(null)
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})

  const base = typeof window !== "undefined" ? window.location.origin : ""
  const urlBase = `${base}/landing`

  const ligas = CANALES.reduce((acc, c) => ({
    ...acc,
    [c.key]: `${urlBase}?utm_source=${c.key}&utm_medium=share`,
  }), {} as Record<string, string>)

  useEffect(() => {
    async function generarQRs() {
      const resultado: Record<string, string> = {}
      for (const c of CANALES) {
        try {
          resultado[c.key] = await QRCode.toDataURL(ligas[c.key], {
            width: 300,
            margin: 2,
            color: { dark: "#e07ba8", light: "#ffffff" },
          })
        } catch { /* skip */ }
      }
      setQrUrls(resultado)
    }
    generarQRs()
  }, [])

  async function copiar(texto: string, id: string) {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(id)
      toast("Liga copiada ✓", "exito")
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      toast("No se pudo copiar. Copia manualmente.", "error")
    }
  }

  function compartirWA(url: string) {
    const msg = encodeURIComponent(`¡Empieza tu propia agencia de viajes desde casa! 🌴 ${url}`)
    window.open(`https://wa.me/?text=${msg}`, "_blank")
  }

  function descargarQR(canal: string) {
    const url = qrUrls[canal]
    if (!url) return
    const a = document.createElement("a")
    a.href = url
    a.download = `qr-tbteam-${canal}.png`
    a.click()
    toast("QR descargado ✓", "exito")
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Share2 size={24} style={{ color: "var(--marca)" }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--texto)" }}>Comparte y crece</h1>
          <p className="text-sm" style={{ color: "var(--texto-3)" }}>Difunde tu landing y mide qué canal vende más</p>
        </div>
      </div>

      {/* Liga principal */}
      <div className="card p-5">
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--texto-2)" }}>Tu landing pública</p>
        <div className="flex gap-2">
          <div
            className="flex-1 px-3 py-2.5 rounded-xl border text-sm font-mono truncate"
            style={{ background: "var(--bg)", borderColor: "var(--border-strong)", color: "var(--texto-2)" }}
          >
            {urlBase}
          </div>
          <button onClick={() => copiar(urlBase, "principal")} className="btn-marca text-sm px-4 shrink-0">
            {copiado === "principal" ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
          <a href="/landing" target="_blank" rel="noopener noreferrer" className="btn-secundario text-sm px-3 shrink-0" aria-label="Ver landing">
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Ligas por canal */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold px-1" style={{ color: "var(--texto)" }}>Ligas por canal (con seguimiento)</h2>
        {CANALES.map(canal => (
          <div key={canal.key} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{canal.emoji}</span>
                <p className="font-semibold text-sm" style={{ color: "var(--texto)" }}>{canal.label}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => compartirWA(ligas[canal.key])}
                  className="btn-secundario text-xs py-1.5 px-3"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => copiar(ligas[canal.key], canal.key)}
                  className="btn-marca text-xs py-1.5 px-3"
                >
                  {copiado === canal.key ? <><Check size={12} /> Copiada</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>
            </div>

            {/* QR */}
            {qrUrls[canal.key] && (
              <div className="flex items-center gap-4">
                <img
                  src={qrUrls[canal.key]}
                  alt={`QR para ${canal.label}`}
                  className="w-20 h-20 rounded-lg"
                />
                <div>
                  <p className="text-xs mb-2" style={{ color: "var(--texto-3)" }}>
                    Escanea o descarga el QR para volantes y eventos
                  </p>
                  <button
                    onClick={() => descargarQR(canal.key)}
                    className="btn-secundario text-xs py-1.5 px-3"
                  >
                    <Download size={12} /> Descargar QR
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="card p-4" style={{ background: "var(--marca-light)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--marca-dark)" }}>💡 Tip de seguimiento</p>
        <p className="text-sm" style={{ color: "var(--texto-2)" }}>
          Usa una liga diferente en cada canal (Instagram, WhatsApp, Facebook, volante). Así sabrás exactamente de dónde viene cada interesada en el tablero de &ldquo;¿De dónde llegan mis clientes?&rdquo;
        </p>
      </div>
    </div>
  )
}
