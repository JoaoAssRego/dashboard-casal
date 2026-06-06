import { supabase } from '@/lib/supabase'

export interface Category {
  id: string
  household_id: string
  name: string
  color: string
  icon: string
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
