import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { useQuery } from "@tanstack/react-query"
import { getTransactions } from "@/features/transactions/api/transactions"
import { SummaryCards } from "./SummaryCards"
import { TransactionList } from "@/features/transactions/components/TransactionList"
import { TransactionForm } from "@/features/transactions/components/TransactionForm"

export function DashboardView() {
  const { user } = useAuthStore()

  // O React Query busca os dados da API de transações automaticamente.
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions
  })

  // Cálculos em tempo real para os cartões
  const income = transactions?.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  const expense = transactions?.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
  
  // Por enquanto, o Saldo do Casal considera Receitas - Despesas. (Futuramente incluiremos Saldo Inicial / Aportes)
  const balance = income - expense

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Resumo Geral</h2>
          <p className="text-slate-400 text-sm">
            Bem-vindo de volta, <span className="text-purple-400 font-medium">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
          </p>
        </div>
      </div>

      <SummaryCards 
        balance={balance} 
        income={income} 
        expense={expense} 
        isLoading={isLoading} 
      />

      <div className="pt-2">
        <h3 className="text-base font-semibold text-slate-300 mb-3">Últimos Lançamentos</h3>
        <TransactionList />
      </div>

      {/* Botão Flutuante (Gaveta) posicionado de forma fixa */}
      <TransactionForm />
    </div>
  )
}
