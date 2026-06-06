import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { AppLayout } from "@/components/layout/AppLayout"
import { DashboardView } from "@/features/dashboard/components/DashboardView"
import { BalanceDetailsView } from "@/features/dashboard/components/BalanceDetailsView"
import { GoalsView } from "@/features/goals/components/GoalsView"
import { TransactionsView } from "@/features/transactions/components/TransactionsView"
import { SettingsView } from "@/features/settings/components/SettingsView"

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
          <Route path="balance" element={<BalanceDetailsView />} />
          <Route path="transactions" element={<TransactionsView />} />
          <Route path="goals" element={<GoalsView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
