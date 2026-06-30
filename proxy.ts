import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Rutas públicas
  const publicas = ["/login", "/agenda/", "/landing", "/api/leads", "/api/auth"]
  if (publicas.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // La raíz redirige al dashboard o al login
  if (pathname === "/") {
    return NextResponse.redirect(new URL(isLoggedIn ? "/dashboard" : "/login", req.url))
  }

  // Cualquier otra ruta privada requiere login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|manifest|apple-icon|.*\\.(?:png|jpg|svg|ico|webp)$).*)"],
}
