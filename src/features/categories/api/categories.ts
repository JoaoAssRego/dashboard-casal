import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { getHouseholdId } from '@/features/household/api/household'

// Fonte única das chaves de cache desta feature. Importe daqui em hooks/invalidações —
// nunca escreva a string ['categories'] solta.
export const categoryKeys = {
  all: ['categories'] as const,
}

export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  color: z.string().min(4, 'Cor é obrigatória.'),
  icon: z.string(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export interface Category extends CategoryInput {
  id: string
  household_id: string
  created_at: string
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const household_id = await getHouseholdId()
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...input, household_id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateCategory({ id, input }: { id: string, input: CategoryInput }): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
