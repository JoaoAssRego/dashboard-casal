import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { getHouseholdId } from '@/features/household/api/household'

// Fonte única das chaves de cache desta feature. Importe daqui em hooks/invalidações —
// nunca escreva a string ['goals'] solta.
export const goalKeys = {
  all: ['goals'] as const,
}

export const goalSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.'),
  target_amount: z.coerce.number().positive('O valor alvo deve ser maior que zero.'),
})

export type GoalInput = z.infer<typeof goalSchema>

export interface FinancialGoal extends GoalInput {
  id: string
  household_id: string
  status: 'active' | 'achieved' | 'paused'
  created_at: string
}

export async function createGoal(input: GoalInput) {
  const household_id = await getHouseholdId()

  const { data, error } = await supabase
    .from('financial_goals')
    .insert({
      ...input,
      household_id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getGoals(): Promise<FinancialGoal[]> {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function deleteGoal(id: string) {
  const { error } = await supabase
    .from('financial_goals')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateGoalStatus(id: string, status: FinancialGoal['status']) {
  const { data, error } = await supabase
    .from('financial_goals')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as FinancialGoal
}
