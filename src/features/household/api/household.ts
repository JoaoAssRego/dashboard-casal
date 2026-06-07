import { supabase } from '@/lib/supabase'

// Núcleo do multi-tenancy. Household é a entidade soberana (a conta conjunta do casal).
// Esta é a forma CANÔNICA de resolver o household do usuário atual — reutilize-a em vez de
// re-consultar user_profiles em outras features.
//
// Lógica inteligente: pega a conta conjunta e, se for o primeiro acesso da vida do usuário,
// cria uma na hora via função segura no banco (RPC).
export async function getHouseholdId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Sessão expirada. Faça login novamente.")

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (profile?.household_id) return profile.household_id

  // Geração automática do Household (conta) via função segura no banco
  const { data: newHouseholdId, error: hError } = await supabase.rpc('create_household_for_user', {
    household_name: 'Suas Finanças'
  })

  if (hError || !newHouseholdId) throw new Error("Erro ao gerar sua conta: " + hError?.message)

  return newHouseholdId
}
