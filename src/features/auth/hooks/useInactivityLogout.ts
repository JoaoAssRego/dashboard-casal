import { useEffect, useRef } from "react"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

// Tempo ocioso até o logout automático (apps bancários costumam usar 15-30 min).
const INACTIVITY_LIMIT_MS = 20 * 60 * 1000 // 20 minutos
const STORAGE_KEY = "last_activity_at"

// Eventos que contam como "usuário ativo".
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "click"] as const

/**
 * Desloga o usuário após INACTIVITY_LIMIT_MS sem interação.
 * Mantém o refresh token do Supabase (conveniência), mas encerra a sessão por segurança
 * num app de finanças. Como o signOut zera o user na store, o ProtectedRoute redireciona
 * sozinho para /login.
 *
 * Persiste o último timestamp de atividade em localStorage para também cobrir o caso de o
 * app ficar em segundo plano / aba fechada: ao voltar, se o tempo ocioso estourou, desloga.
 */
export function useInactivityLogout() {
  const signOut = useAuthStore((s) => s.signOut)
  const user = useAuthStore((s) => s.user)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastWriteRef = useRef(0)

  useEffect(() => {
    // Só monitora quando há alguém logado.
    if (!user) return

    function logout() {
      localStorage.removeItem(STORAGE_KEY)
      signOut()
    }

    function scheduleLogout() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(logout, INACTIVITY_LIMIT_MS)
    }

    function registerActivity() {
      const now = Date.now()
      // Throttle da escrita em localStorage (no máx. uma vez por segundo).
      if (now - lastWriteRef.current > 1000) {
        localStorage.setItem(STORAGE_KEY, String(now))
        lastWriteRef.current = now
      }
      scheduleLogout()
    }

    function checkIdleOnReturn() {
      if (document.visibilityState !== "visible") return
      const last = Number(localStorage.getItem(STORAGE_KEY) || 0)
      if (last && Date.now() - last >= INACTIVITY_LIMIT_MS) {
        logout()
      } else {
        registerActivity()
      }
    }

    // Estado inicial: se a sessão restaurada já está ociosa há tempo demais, desloga já.
    const last = Number(localStorage.getItem(STORAGE_KEY) || 0)
    if (last && Date.now() - last >= INACTIVITY_LIMIT_MS) {
      logout()
      return
    }
    registerActivity()

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, registerActivity, { passive: true })
    )
    document.addEventListener("visibilitychange", checkIdleOnReturn)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, registerActivity))
      document.removeEventListener("visibilitychange", checkIdleOnReturn)
    }
  }, [user, signOut])
}
