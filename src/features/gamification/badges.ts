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

export function computeStreak(transactions: Transaction[]): number {
  const now = new Date()
  let streak = 0
  let offset = 0
  while (true) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const txs = transactions.filter(t => t.transaction_date.startsWith(prefix))
    if (txs.length === 0) break
    const inc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const exp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    if (inc > 0 && inc > exp) { streak++; offset++ } else break
  }
  return streak
}

export function computeNextHint(transactions: Transaction[], goals: FinancialGoal[]): string | null {
  const investments = transactions.filter(t => t.type === 'investment')
  if (investments.length > 0 && investments.length < 3) {
    const remaining = 3 - investments.length
    return `Falta ${remaining} aporte${remaining > 1 ? 's' : ''} para Poupador`
  }
  if (investments.length === 0 && transactions.length > 0) {
    return 'Registre o primeiro investimento para Investidor Iniciante'
  }
  if (goals.length === 0 && transactions.length > 0) {
    return 'Crie uma meta financeira para Caçador de Metas'
  }
  return null
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
