import { useQuery } from "@tanstack/react-query"
import { getTransactions, transactionKeys } from "@/features/transactions/api/transactions"
import { getCategories, categoryKeys } from "@/features/categories/api/categories"
import { ChevronLeft } from "lucide-react"
import { SummaryCards } from "./SummaryCards"
import { ExpenseChart } from "./ExpenseChart"
import { useNavigate } from "react-router-dom"

export function BalanceDetailsView() {
  const navigate = useNavigate()
  const { data: transactions, isLoading: loadingTx } = useQuery({ queryKey: transactionKeys.all, queryFn: getTransactions })
  const { data: categories } = useQuery({ queryKey: categoryKeys.all, queryFn: getCategories })

  const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const expense = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0
  const balance = income - expense

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20">
      <div className="pt-2 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Análise de Saldo</h2>
          <p className="text-slate-400 text-sm">Seus números detalhados</p>
        </div>
      </div>

      <SummaryCards balance={balance} income={income} expense={expense} isLoading={loadingTx} minimal={false} />

      {!loadingTx && transactions && categories && (
        <ExpenseChart transactions={transactions} categories={categories} />
      )}
    </div>
  )
}
