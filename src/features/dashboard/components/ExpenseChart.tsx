import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { Transaction } from '@/features/transactions/api/transactions'
import type { Category } from '@/features/categories/api/categories'

// Design system tokens (DESIGN.md)
const TOOLTIP_BG = 'oklch(0.07 0.01 267)'
const TOOLTIP_BORDER = 'oklch(0.22 0.01 267)'

interface ExpenseChartProps {
  transactions: Transaction[]
  categories: Category[]
  compact?: boolean
  periodLabel?: string
}

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function ExpenseChart({ transactions, categories, compact = false, periodLabel }: ExpenseChartProps) {
  const expenses = transactions.filter(t => t.type === 'expense')

  if (expenses.length === 0) return null

  const dataMap: Record<string, { name: string, value: number, color: string }> = {}
  expenses.forEach(tx => {
    const cat = categories.find(c => c.id === (tx.category_id || ''))
    const name = cat ? cat.name : 'Outros'
    const color = cat ? cat.color : '#64748b'
    if (!dataMap[name]) dataMap[name] = { name, value: 0, color }
    dataMap[name].value += Number(tx.amount)
  })
  const data = Object.values(dataMap).sort((a, b) => b.value - a.value)

  const srSummary = data.map(d => `${d.name}: ${fmt(d.value)}`).join(', ')
  const ariaLabel = periodLabel
    ? `Gráfico de pizza: despesas por categoria — ${periodLabel}`
    : 'Gráfico de pizza: despesas por categoria do mês'

  const chartHeight = compact ? 210 : 250

  const chart = (
    <div className={compact ? 'px-4 pt-1 pb-2' : 'p-5'}>
      {!compact && (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white">
            {periodLabel ? periodLabel : 'Onde seu dinheiro foi parar'}
          </h3>
          {periodLabel && (
            <p className="text-xs text-slate-500 mt-0.5">Distribuição total de despesas</p>
          )}
        </div>
      )}
      <div role="img" aria-label={ariaLabel}>
        <p className="sr-only">
          {`Despesas por categoria${periodLabel ? ` — ${periodLabel}` : ''}. ${srSummary}`}
        </p>
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={compact ? 55 : 65}
                outerRadius={compact ? 75 : 85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => fmt(Number(value))}
                contentStyle={{ backgroundColor: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: '12px' }}
                itemStyle={{ color: 'oklch(0.985 0 0)', fontWeight: 500 }}
                labelStyle={{ display: 'none' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: compact ? '12px' : '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  if (compact) return chart

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl shadow-lg mt-6">
      {chart}
    </div>
  )
}
