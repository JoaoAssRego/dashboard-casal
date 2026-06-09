import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '@/features/transactions/api/transactions'

// Design system tokens (DESIGN.md)
const INCOME_COLOR = 'oklch(0.707 0.154 238)'   // income-sky
const EXPENSE_COLOR = 'oklch(0.720 0.179 338)'  // expense-blush
const TOOLTIP_BG = 'oklch(0.07 0.01 267)'       // near-black, brand-tinted
const TOOLTIP_BORDER = 'oklch(0.22 0.01 267)'   // surface border
const AXIS_COLOR = 'oklch(0.60 0.01 253)'        // foreground-secondary

interface MonthlyChartProps {
  transactions: Transaction[]
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const now = new Date()

  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthTxs = transactions.filter(t => t.transaction_date.startsWith(prefix))
    return {
      mes: MONTH_NAMES[d.getMonth()],
      Receitas: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      Despesas: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  if (!data.some(d => d.Receitas > 0 || d.Despesas > 0)) return null

  const srSummary = data
    .filter(d => d.Receitas > 0 || d.Despesas > 0)
    .map(d => `${d.mes}: receita ${fmt(d.Receitas)}, despesa ${fmt(d.Despesas)}`)
    .join('. ')

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg">
      <h3 className="text-base font-semibold text-white mb-5">Últimos 6 Meses</h3>
      <div role="img" aria-label="Gráfico de barras: receitas e despesas dos últimos 6 meses">
        <p className="sr-only">Receitas e despesas dos últimos 6 meses. {srSummary}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="30%" barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke={TOOLTIP_BORDER} vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: AXIS_COLOR, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => fmt(value)}
              contentStyle={{ backgroundColor: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: '12px' }}
              itemStyle={{ color: 'oklch(0.985 0 0)', fontWeight: 500 }}
              labelStyle={{ color: AXIS_COLOR, marginBottom: 4 }}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
            />
            <Bar dataKey="Receitas" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Despesas" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
