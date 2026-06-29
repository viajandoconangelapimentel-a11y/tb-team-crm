import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  correo: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = (user as any).rol
        token.nombre = (user as any).nombre
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).rol = token.rol
        ;(session.user as any).nombre = token.nombre
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        correo: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { correo, password } = parsed.data

        const usuario = await prisma.usuario.findUnique({
          where: { correo },
        })

        if (!usuario || !usuario.activo) return null

        // Verificar si está bloqueado
        if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
          return null
        }

        const passwordOk = await bcrypt.compare(password, usuario.passwordHash)

        if (!passwordOk) {
          // Incrementar intentos fallidos
          const intentos = usuario.intentosFallidos + 1
          const bloqueado = intentos >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
              intentosFallidos: intentos,
              bloqueadoHasta: bloqueado,
            },
          })
          return null
        }

        // Resetear intentos fallidos al entrar bien
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { intentosFallidos: 0, bloqueadoHasta: null },
        })

        return {
          id: usuario.id,
          email: usuario.correo,
          name: usuario.nombre,
          rol: usuario.rol,
          nombre: usuario.nombre,
        }
      },
    }),
  ],
})
