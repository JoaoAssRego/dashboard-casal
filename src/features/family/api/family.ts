import { supabase } from '@/lib/supabase'
import { getHouseholdId } from '@/features/transactions/api/transactions'

export interface HouseholdInvite {
  id: string
  household_id: string
  inviter_id: string
  inviter_email: string
  invitee_email: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface UserProfile {
  id: string
  household_id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export async function sendInvite(invitee_email: string) {
  const household_id = await getHouseholdId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não logado.")

  if (user.email === invitee_email) {
    throw new Error("Você não pode convidar a si mesmo.")
  }

  // Verificar se já existe um convite pendente para este email
  const { data: existing } = await supabase
    .from('household_invites')
    .select('id')
    .eq('household_id', household_id)
    .eq('invitee_email', invitee_email)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) throw new Error("Já existe um convite pendente para este e-mail na sua conta.")

  const { error } = await supabase
    .from('household_invites')
    .insert({
      household_id,
      inviter_id: user.id,
      inviter_email: user.email,
      invitee_email,
      status: 'pending'
    })

  if (error) throw new Error(error.message)
}

// Para quem está logado e precisa ver se alguém o convidou
export async function getMyPendingInvites(): Promise<HouseholdInvite[]> {
  const { data, error } = await supabase
    .from('household_invites')
    .select('*')
    .eq('status', 'pending')
  
  // A segurança RLS garante que o Supabase só retorne onde invitee_email = email_logado
  if (error) throw new Error(error.message)
  return data || []
}

// Para o líder da Conta Conjunta ver quem faz parte dela
export async function getHouseholdMembers(): Promise<UserProfile[]> {
  const household_id = await getHouseholdId()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('household_id', household_id)
  
  if (error) throw new Error(error.message)
  return data || []
}

// Para o líder da Conta Conjunta ver convites enviados que ainda não foram aceitos
export async function getHouseholdPendingInvites(): Promise<HouseholdInvite[]> {
  const household_id = await getHouseholdId()
  const { data, error } = await supabase
    .from('household_invites')
    .select('*')
    .eq('household_id', household_id)
    .eq('status', 'pending')

  if (error) throw new Error(error.message)
  return data || []
}

// Aceitar um convite (Roda a função segura do banco de dados)
export async function acceptInvite(invite_id: string) {
  const { error } = await supabase.rpc('accept_household_invite', { invite_id })
  if (error) throw new Error("Erro ao aceitar convite: " + error.message)
}

// Recusar um convite
export async function rejectInvite(invite_id: string) {
  const { error } = await supabase
    .from('household_invites')
    .update({ status: 'rejected' })
    .eq('id', invite_id)

  if (error) throw new Error(error.message)
}
