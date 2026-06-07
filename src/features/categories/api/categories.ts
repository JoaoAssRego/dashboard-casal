import { supabase } from '@/lib/supabase'
import { getHouseholdId } from '@/features/household/api/household'

export interface CategoryInput {
  name: string
  color: string
  icon: string
}

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
    .insert({ household_id, ...input })
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
