import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SummaryCardsProps {
  balance?: number
  income?: number
  expense?: number
  isLoading?: boolean
  minimal?: boolean
}

export function SummaryCards({ balance = 0, income = 0, expense = 0, isLoading = false, minimal = false }: SummaryCardsProps) {
  const navigate = useNavigate()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const displayValue = (val: number) => isLoading ? 'R$ --,--' : formatCurrency(val)

  // Minimal mode: compact, single-row, clicável → /balance (usado na home)
  if (minimal) {
    return (
      <Card
        onClick={() => navigate('/balance')}
        className="border-purple-500/30 shadow-xl shadow-purple-500/10 bg-gradient-to-br from-indigo-950 via-purple-900/40 to-slate-950 overflow-hidden relative cursor-pointer hover:ring-2 ring-purple-500/50 transition-all active:scale-[0.98]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-purple-200">Saldo</CardTitle>
          <ChevronRight className="h-5 w-5 text-purple-400" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white tracking-tight">
            {displayValue(balance)}
          </div>
          <p className="text-xs text-purple-300/70 mt-1">Disponível na conta conjunta</p>
        </CardContent>
      </Card>
    )
  }

  // Não-minimal: card único com saldo + barra proporcional + receita/despesa
  // Usado na /balance — mostra o todo sem cair no hero-metric template
  const incomeShare = income + expense > 0 ? (income / (income + expense)) * 100 : 0

  return (
    <Card className="border-purple-500/30 shadow-xl shadow-purple-500/10 bg-gradient-to-br from-indigo-950 via-purple-900/40 to-slate-950 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
      <CardContent className="relative z-10 pt-6 pb-6">
        <p className="text-sm font-medium text-purple-200 mb-1">Saldo acumulado</p>
        <p className="text-4xl font-bold text-white tracking-tight mb-5">
          {displayValue(balance)}
        </p>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-1.5 rounded-full bg-slate-800 animate-pulse" />
            <div className="h-4 w-3/4 rounded-md bg-slate-800 animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-slate-800 animate-pulse" />
          </div>
        )}

        {!isLoading && (income > 0 || expense > 0) && (
          <>
            {/* Barra proporcional: azul = receitas, resto = despesas */}
            <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden mb-4" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700"
                style={{ width: `${incomeShare}%` }}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-xs text-blue-300/80">Receitas totais</span>
                </div>
                <span className="text-sm font-semibold text-blue-300">{displayValue(income)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                  <span className="text-xs text-pink-300/80">Despesas totais</span>
                </div>
                <span className="text-sm font-semibold text-pink-300">{displayValue(expense)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
