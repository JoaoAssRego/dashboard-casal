import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { Transaction } from '@/features/transactions/api/transactions'
import type { Category } from '@/features/categories/api/categories'

interface ExpenseChartProps {
  transactions: Transaction[]
  categories: Category[]
}

export function ExpenseChart({ transactions, categories }: ExpenseChartProps) {
  // Filtramos apenas as despesas para fazer o gráfico de gastos
  const expenses = transactions.filter(t => t.type === 'expense')
  
  if (expenses.length === 0) return null

  // Agrupa os valores por categoria
  const dataMap: Record<string, { name: string, value: number, color: string }> = {}

  expenses.forEach(tx => {
    const catId = tx.category_id || 'none'
    const cat = categories.find(c => c.id === catId)
    
    // Se a categoria não existir mais ou não foi selecionada, cai em "Outros"
    const name = cat ? cat.name : 'Outros'
    const color = cat ? cat.color : '#64748b' // Slate-500

    if (!dataMap[name]) {
      dataMap[name] = { name, value: 0, color }
    }
    dataMap[name].value += Number(tx.amount)
  })

  // Transforma em array e ordena do maior para o menor gasto
  const data = Object.values(dataMap).sort((a, b) => b.value - a.value)

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 shadow-lg mt-6">
      <h3 className="text-lg font-semibold text-white mb-6">Onde seu dinheiro foi parar</h3>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
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
              formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontWeight: 500 }}
              labelStyle={{ display: 'none' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
