import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TemaProvider } from "@/components/TemaProvider"
import { ToastProvider } from "@/components/ui/Toast"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "TB Team Agentes Yaz",
    template: "%s · TB Team Agentes Yaz",
  },
  description: "Ayudamos a otras mujeres y trabajadores a comenzar su agencia de viajes desde cero y generar ingresos desde casa.",
  openGraph: {
    title: "TB Team Agentes Yaz",
    description: "Empieza tu agencia de viajes desde casa. Sin experiencia, con apoyo total.",
    type: "website",
    siteName: "TB Team Agentes Yaz",
  },
  twitter: {
    card: "summary_large_image",
    title: "TB Team Agentes Yaz",
    description: "Empieza tu agencia de viajes desde casa. Sin experiencia, con apoyo total.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh">
        <TemaProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TemaProvider>
      </body>
    </html>
  )
}
