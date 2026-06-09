import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '@/features/transactions/api/transactions'

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

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg">
      <h3 className="text-base font-semibold text-white mb-5">Últimos 6 Meses</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="mes"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => fmt(value)}
            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ color: '#fff', fontWeight: 500 }}
            labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
          />
          <Legend
            verticalAlign="bottom"
            height={32}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
          />
          <Bar dataKey="Receitas" fill="#60a5fa" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="Despesas" fill="#f472b6" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
