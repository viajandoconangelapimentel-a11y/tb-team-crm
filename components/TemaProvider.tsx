"use client"
import { createContext, useContext, useEffect, useState } from "react"

type Tema = "claro" | "oscuro" | "automatico"

const TemaContext = createContext<{
  tema: Tema
  setTema: (t: Tema) => void
}>({ tema: "automatico", setTema: () => {} })

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<Tema>("automatico")

  useEffect(() => {
    // Leer localStorage primero para evitar parpadeo
    const guardado = (localStorage.getItem("tema") as Tema) || "automatico"
    setTemaState(guardado)
    document.documentElement.setAttribute("data-theme", guardado)
  }, [])

  function setTema(t: Tema) {
    setTemaState(t)
    localStorage.setItem("tema", t)
    document.documentElement.setAttribute("data-theme", t)
    // Si oscuro explícito, agregar clase .dark también
    if (t === "oscuro") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <TemaContext.Provider value={{ tema, setTema }}>
      {children}
    </TemaContext.Provider>
  )
}

export function useTema() {
  return useContext(TemaContext)
}
