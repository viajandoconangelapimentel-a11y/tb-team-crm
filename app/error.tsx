"use client"
import { useEffect } from "react"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--texto)", gap: "1rem", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", lineHeight: 1 }}>😬</div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "var(--marca)" }}>Algo salió mal</h1>
      <p style={{ color: "var(--texto-2)", maxWidth: "380px" }}>
        Ocurrió un error inesperado. Nuestro equipo ya fue notificado. Intenta de nuevo o regresa al dashboard.
      </p>
      {error?.digest && (
        <p style={{ fontSize: "0.75rem", color: "var(--texto-3)", fontFamily: "monospace" }}>Referencia: {error.digest}</p>
      )}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={reset} className="btn-marca">Intentar de nuevo</button>
        <a href="/dashboard" className="btn-secundario">Ir al dashboard</a>
      </div>
    </div>
  )
}
