import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--texto)", gap: "1rem", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "4rem", lineHeight: 1 }}>🗺️</div>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--marca)" }}>404 — Página no encontrada</h1>
      <p style={{ color: "var(--texto-2)", maxWidth: "360px" }}>
        Parece que esta ruta no existe en el CRM. Puede que el enlace esté desactualizado.
      </p>
      <Link href="/dashboard" className="btn-marca" style={{ marginTop: "1rem" }}>
        Ir al dashboard →
      </Link>
    </div>
  )
}
