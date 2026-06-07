import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getTransactions, transactionKeys } from "@/features/transactions/api/transactions"
import { User } from "lucide-react"
import { SummaryCards } from "./SummaryCards"
import { ProfileDrawer } from "./ProfileDrawer"

export function DashboardView() {
  const { user } = useAuthStore()
  
  // Busca e soma transações
  const { data: transactions, isLoading: loadingTx } = useQuery({ 
    queryKey: transactionKeys.all,
    queryFn: getTransactions
  })

  // Cálculos em tempo real para os cartões
  const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const expense = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0
  
  // Por enquanto, o seu saldo considera Receitas - Despesas. (Futuramente incluiremos Saldo Inicial / Aportes)
  const balance = income - expense

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <ProfileDrawer open={isProfileOpen} onOpenChange={setIsProfileOpen} />

      {/* Header Estilo Banco Inter */}
      <div className="pt-2 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setIsProfileOpen(true)}
        >
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-sm group-hover:ring-2 ring-purple-500/50 transition-all">
            <User className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-white font-medium text-sm capitalize">Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
          </div>
        </div>
      </div>

      {/* Cartões de Resumo (Apenas Saldo Clicável) */}
      <SummaryCards balance={balance} income={income} expense={expense} isLoading={loadingTx} minimal={true} />
    </div>
  )
}
