import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { getHouseholdId } from '@/features/household/api/household'

// Fonte única das chaves de cache desta feature. Importe daqui em hooks/invalidações —
// nunca escreva a string ['transactions'] solta.
export const transactionKeys = {
  all: ['transactions'] as const,
}

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'investment']),
  amount: z.coerce.number().positive('O valor deve ser maior que zero.'),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres.'),
  transaction_date: z.string().min(1, 'A data é obrigatória.'), 
  goal_id: z.string().uuid('Meta inválida').optional().nullable(),
  category_id: z.string().uuid('Categoria inválida').optional().nullable(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

export interface Transaction extends TransactionInput {
  id: string
  household_id: string
  created_by: string
  created_at: string
}

export async function createTransaction(input: TransactionInput) {
  const household_id = await getHouseholdId()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...input,
      household_id,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(error.message)
}

export async function updateTransaction({ id, input }: { id: string, input: TransactionInput }) {
  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createTransactionsBatch(transactions: TransactionInput[]) {
  const household_id = await getHouseholdId()
  const { data: { user } } = await supabase.auth.getUser()

  const insertData = transactions.map(t => ({
    ...t,
    household_id,
    created_by: user?.id,
  }))

  const { data, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select()

  if (error) throw new Error(error.message)
  return data
}
