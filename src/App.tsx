import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardView } from "@/features/dashboard/components/DashboardView"
import { GoalsView } from "@/features/goals/components/GoalsView"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()
  
  if (!isInitialized) return <div className="min-h-screen flex items-center justify-center">Carregando Sessão...</div>
  if (!user) return <Navigate to="/login" replace />
  
  return <>{children}</>
}

function LoginRoute() {
  const { user, isInitialized } = useAuthStore()
  
  if (!isInitialized) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  if (user) return <Navigate to="/" replace />
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <h1 className="text-xl font-medium text-muted-foreground">{title} em construção</h1>
    </div>
  )
}

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        
        {/* Rotas Protegidas envolvidas pelo AppLayout (Barra Inferior do Celular) */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Telas que serão renderizadas no miolo do aplicativo */}
          <Route index element={<DashboardView />} />
          <Route path="transactions" element={<Placeholder title="Extrato" />} />
          <Route path="goals" element={<GoalsView />} />
          <Route path="settings" element={<Placeholder title="Ajustes" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
