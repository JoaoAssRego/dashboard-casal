import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { getTransactions, transactionKeys } from "@/features/transactions/api/transactions"
import { getGoals, goalKeys } from "@/features/goals/api/goals"
import { getCategories, categoryKeys } from "@/features/categories/api/categories"
import { SummaryCards } from "./SummaryCards"
import { ProfileDrawer } from "./ProfileDrawer"
import { ExpenseChart } from "./ExpenseChart"
import { BadgesSection } from "@/features/gamification/components/BadgesSection"
import { computeBadges, computeStreak, computeNextHint } from "@/features/gamification/badges"

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
  const monthBalance = monthIncome - monthExpense
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const txList = transactions ?? []
  const goalList = goals ?? []
  const badges = computeBadges(txList, goalList)
  const streak = computeStreak(txList)
  const nextHint = computeNextHint(txList, goalList)

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

      {/* Saldo geral — compacto, clicável → /balance */}
      <SummaryCards balance={balance} income={income} expense={expense} isLoading={loadingTx} minimal={true} />

      {/* Bloco do mês */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 capitalize">{monthName}</p>

        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
          {/* Saldo mensal */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Saldo do mês</p>
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  loadingTx ? "text-slate-600" : monthBalance >= 0 ? "text-white" : "text-pink-300"
                )}
              >
                {loadingTx
                  ? "R$ —"
                  : (monthBalance > 0 ? "+" : "") + fmt(monthBalance)}
              </p>
            </div>
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                monthBalance >= 0 ? "bg-blue-500/15" : "bg-pink-500/15"
              )}
            >
              {monthBalance >= 0
                ? <TrendingUp className="h-5 w-5 text-blue-400" />
                : <TrendingDown className="h-5 w-5 text-pink-400" />}
            </div>
          </div>

          {/* Gráfico de despesas por categoria */}
          {!loadingTx && categories && monthTxs.some(t => t.type === 'expense') && (
            <div className="border-t border-slate-800/60">
              <ExpenseChart transactions={monthTxs} categories={categories} compact />
            </div>
          )}

          {/* Empty state */}
          {!loadingTx && monthTxs.length === 0 && (
            <p className="text-xs text-slate-600 text-center px-5 pb-5">
              Nenhum lançamento este mês ainda
            </p>
          )}

          {/* Receita / Despesa footer */}
          {!loadingTx && (monthIncome > 0 || monthExpense > 0) && (
            <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">Receita</span>
                <span className="text-xs font-semibold text-blue-300">{fmt(monthIncome)}</span>
              </div>
              <div className="w-px h-3 bg-slate-800 flex-shrink-0" />
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">Despesa</span>
                <span className="text-xs font-semibold text-pink-300">{fmt(monthExpense)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conquistas */}
      {!loadingTx && (
        <BadgesSection badges={badges} streak={streak} nextHint={nextHint} />
      )}
    </div>
  )
}
