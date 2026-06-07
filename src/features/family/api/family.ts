import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { getHouseholdId } from '@/features/household/api/household'

// Fonte única das chaves de cache desta feature. Importe daqui em hooks/invalidações —
// nunca escreva as strings ['family_members'] / ['family_pending'] / ['my_invites'] soltas.
export const familyKeys = {
  members: ['family_members'] as const,
  pending: ['family_pending'] as const,
  invites: ['my_invites'] as const,
}

// Schema co-localizado (padrão de transactions.ts): valida o e-mail do convite
// antes de qualquer mutation, no client.
export const inviteSchema = z.object({
  invitee_email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
})

export type InviteInput = z.infer<typeof inviteSchema>

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

// Subconjuntos colunares: as queries abaixo selecionam só o necessário (não SELECT *),
// então o tipo de retorno reflete exatamente as colunas buscadas — não a linha inteira.
export type PendingInvite = Pick<HouseholdInvite, 'id' | 'inviter_email' | 'status' | 'created_at'>
export type HouseholdMember = Pick<UserProfile, 'id' | 'display_name'>
export type SentInvite = Pick<HouseholdInvite, 'id' | 'invitee_email' | 'status' | 'created_at'>

export async function sendInvite(rawEmail: string) {
  // Valida via Zod antes de tocar o banco (normaliza trim/lowercase).
  const { invitee_email } = inviteSchema.parse({ invitee_email: rawEmail })
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
export async function getMyPendingInvites(): Promise<PendingInvite[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return []

  const { data, error } = await supabase
    .from('household_invites')
    .select('id, inviter_email, status, created_at')
    .eq('status', 'pending')
    .eq('invitee_email', user.email)

  // Defesa em profundidade: o RLS de household_invites é permissivo por OR (destinatário
  // OU membro do household), então sem este filtro a query também traria convites que o
  // PRÓPRIO household enviou. Filtramos por invitee_email para devolver só os recebidos.
  if (error) throw new Error(error.message)
  return data || []
}

// Para o líder da Conta Conjunta ver quem faz parte dela
export async function getHouseholdMembers(): Promise<HouseholdMember[]> {
  const household_id = await getHouseholdId()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name')
    .eq('household_id', household_id)
  
  if (error) throw new Error(error.message)
  return data || []
}

// Para o líder da Conta Conjunta ver convites enviados que ainda não foram aceitos
export async function getHouseholdPendingInvites(): Promise<SentInvite[]> {
  const household_id = await getHouseholdId()
  const { data, error } = await supabase
    .from('household_invites')
    .select('id, invitee_email, status, created_at')
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
