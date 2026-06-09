import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown, User } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { getTransactions, transactionKeys } from "@/features/transactions/api/transactions"
import { getGoals, goalKeys } from "@/features/goals/api/goals"
import { getCategories, categoryKeys } from "@/features/categories/api/categories"
import { SummaryCards } from "./SummaryCards"
import { ProfileDrawer } from "./ProfileDrawer"
import { MonthlyChart } from "./MonthlyChart"
import { ExpenseChart } from "./ExpenseChart"
import { BadgesSection } from "@/features/gamification/components/BadgesSection"
import { computeBadges } from "@/features/gamification/badges"

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function DashboardView() {
  const { user } = useAuthStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: transactionKeys.all,
    queryFn: getTransactions,
  })
  const { data: goals } = useQuery({ queryKey: goalKeys.all, queryFn: getGoals })
  const { data: categories } = useQuery({ queryKey: categoryKeys.all, queryFn: getCategories })

  // Saldo geral (todo o histórico)
  const income = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) ?? 0
  const expense = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) ?? 0
  const balance = income - expense

  // Resumo do mês corrente
  const now = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthTxs = transactions?.filter(t => t.transaction_date.startsWith(monthPrefix)) ?? []
  const monthIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const badges = computeBadges(transactions ?? [], goals ?? [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <ProfileDrawer open={isProfileOpen} onOpenChange={setIsProfileOpen} />

      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setIsProfileOpen(true)}
        >
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-sm group-hover:ring-2 ring-purple-500/50 transition-all">
            <User className="h-5 w-5 text-slate-300" />
          </div>
          <p className="text-white font-medium text-sm capitalize">
            Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </p>
        </div>
      </div>

      {/* Saldo geral — clicável para /balance */}
      <SummaryCards balance={balance} income={income} expense={expense} isLoading={loadingTx} minimal={true} />

      {/* Resumo do mês */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 capitalize">Este mês · {monthName}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/20 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">Receitas</span>
            </div>
            <p className="text-lg font-bold text-blue-100">
              {loadingTx ? 'R$ —' : fmt(monthIncome)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-500/20 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-pink-400" />
              <span className="text-xs text-pink-300 font-medium">Despesas</span>
            </div>
            <p className="text-lg font-bold text-pink-100">
              {loadingTx ? 'R$ —' : fmt(monthExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Conquistas */}
      {!loadingTx && <BadgesSection badges={badges} />}

      {/* Gráfico de evolução mensal */}
      {!loadingTx && transactions && transactions.length > 0 && (
        <MonthlyChart transactions={transactions} />
      )}

      {/* Gráfico de despesas por categoria do mês atual */}
      {!loadingTx && categories && monthTxs.some(t => t.type === 'expense') && (
        <ExpenseChart transactions={monthTxs} categories={categories} />
      )}
    </div>
  )
}
