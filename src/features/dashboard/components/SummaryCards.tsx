import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingDown, TrendingUp } from "lucide-react"

interface SummaryCardsProps {
  balance?: number
  income?: number
  expense?: number
  isLoading?: boolean
}

export function SummaryCards({ balance = 0, income = 0, expense = 0, isLoading = false }: SummaryCardsProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const displayValue = (val: number) => isLoading ? "R$ --,--" : formatCurrency(val)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Saldo Atual - Roxo e Azul Marinho (Deep Premium Gradient) */}
      <Card className="border-purple-500/30 shadow-xl shadow-purple-500/10 bg-gradient-to-br from-indigo-950 via-purple-900/40 to-slate-950 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-purple-200">Saldo do Casal</CardTitle>
          <Wallet className="h-5 w-5 text-purple-400" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white tracking-tight">
            {displayValue(balance)}
          </div>
          <p className="text-xs text-purple-300/70 mt-1">Disponível na conta conjunta</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:col-span-2">
        {/* Receitas - Azul (Blue Premium) */}
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-slate-950 shadow-lg shadow-blue-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-blue-200">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg font-bold text-blue-100">
              {displayValue(income)}
            </div>
          </CardContent>
        </Card>

        {/* Despesas - Rosa (Pink Premium) */}
        <Card className="border-pink-500/30 bg-gradient-to-br from-pink-950/40 to-slate-950 shadow-lg shadow-pink-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs font-medium text-pink-200">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg font-bold text-pink-100">
              {displayValue(expense)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
