import type { Transaction } from '@/features/transactions/api/transactions'
import type { FinancialGoal } from '@/features/goals/api/goals'

export interface Badge {
  id: string
  title: string
  description: string
  emoji: string
  color: string
  unlocked: boolean
}

export function computeBadges(
  transactions: Transaction[],
  goals: FinancialGoal[]
): Badge[] {
  const now = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthTxs = transactions.filter(t => t.transaction_date.startsWith(monthPrefix))
  const monthIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const investments = transactions.filter(t => t.type === 'investment')

  return [
    {
      id: 'primeiro_lancamento',
      title: 'Primeiro Passo',
      description: 'Registrou o primeiro lançamento',
      emoji: '🚀',
      color: '#818cf8',
      unlocked: transactions.length > 0,
    },
    {
      id: 'investidor_iniciante',
      title: 'Investidor Iniciante',
      description: 'Realizou o primeiro aporte',
      emoji: '💰',
      color: '#a78bfa',
      unlocked: investments.length > 0,
    },
    {
      id: 'cacador_de_metas',
      title: 'Caçador de Metas',
      description: 'Criou a primeira meta',
      emoji: '🎯',
      color: '#c084fc',
      unlocked: goals.length > 0,
    },
    {
      id: 'sonho_realizado',
      title: 'Sonho Realizado',
      description: 'Concluiu uma meta financeira',
      emoji: '⭐',
      color: '#f472b6',
      unlocked: goals.some(g => g.status === 'achieved'),
    },
    {
      id: 'mes_no_azul',
      title: 'Mês no Azul',
      description: 'Receitas superaram as despesas este mês',
      emoji: '✨',
      color: '#60a5fa',
      unlocked: monthTxs.length > 0 && monthIncome > 0 && monthIncome > monthExpense,
    },
    {
      id: 'poupador',
      title: 'Poupador',
      description: 'Realizou 3 ou mais aportes',
      emoji: '🏦',
      color: '#e879f9',
      unlocked: investments.length >= 3,
    },
  ]
}
