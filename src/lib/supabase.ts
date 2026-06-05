import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Exporta o cliente único para todo o PWA
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
