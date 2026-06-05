import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Esquema de Defesa Extrema: Zod garantindo a integridade dos dados ANTES de chegarem no Supabase
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
})

export type LoginCredentials = z.infer<typeof loginSchema>

export async function loginWithEmail({ email, password }: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUpWithEmail({ email, password }: LoginCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}
