import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getTransactions, transactionKeys } from "@/features/transactions/api/transactions"
import { getCategories, categoryKeys } from "@/features/categories/api/categories"
import { ChevronLeft } from "lucide-react"
import { SummaryCards } from "./SummaryCards"
import { ExpenseChart } from "./ExpenseChart"
import { MonthlyChart } from "./MonthlyChart"
import { useNavigate } from "react-router-dom"

export function BalanceDetailsView() {
  const navigate = useNavigate()
  const { data: transactions, isLoading: loadingTx } = useQuery({ queryKey: transactionKeys.all, queryFn: getTransactions })
  const { data: categories } = useQuery({ queryKey: categoryKeys.all, queryFn: getCategories })

  const { income, expense, balance } = useMemo(() => {
    const inc = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) ?? 0
    const exp = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) ?? 0
    return { income: inc, expense: exp, balance: inc - exp }
  }, [transactions])

  return (
    <div
      className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-20"
      aria-busy={loadingTx}
    >
      <div className="pt-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Análise de Saldo</h1>
          <p className="text-sm text-muted-foreground">Todo o histórico do casal</p>
        </div>
      </div>

      <SummaryCards balance={balance} income={income} expense={expense} isLoading={loadingTx} minimal={false} />

      {loadingTx ? (
        <>
          <div className="h-[268px] rounded-3xl bg-slate-900/30 animate-pulse" />
          <div className="h-[330px] rounded-3xl bg-slate-900/30 animate-pulse" />
        </>
      ) : (
        <>
          {transactions && <MonthlyChart transactions={transactions} />}

          {transactions && categories && (
            <ExpenseChart
              transactions={transactions}
              categories={categories}
              periodLabel="Todo o histórico do casal"
            />
          )}
        </>
      )}
    </div>
  )
}
