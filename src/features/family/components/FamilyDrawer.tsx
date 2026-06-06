import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getHouseholdMembers, getHouseholdPendingInvites, sendInvite } from "@/features/family/api/family"
import { Loader2, Users, Send, Mail, UserCheck, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

export function FamilyDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: members, isLoading: loadingMembers } = useQuery({ 
    queryKey: ['family_members'], 
    queryFn: getHouseholdMembers,
    enabled: open
  })

  const { data: pending } = useQuery({ 
    queryKey: ['family_pending'], 
    queryFn: getHouseholdPendingInvites,
    enabled: open
  })

  const mutation = useMutation({
    mutationFn: sendInvite,
    onSuccess: () => {
      setEmail('')
      setErrorMsg('')
      queryClient.invalidateQueries({ queryKey: ['family_pending'] })
    },
    onError: (error: Error) => {
      setErrorMsg(error.message)
    }
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setErrorMsg('')
    mutation.mutate(email)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-slate-950 border-t border-purple-500/20 max-h-[90vh]">
        <div className="mx-auto w-full max-w-md flex flex-col h-full" data-vaul-no-drag>
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-500" />
              Minha Família
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-6 overflow-y-auto">
            
            {/* Seção de Envio de Convite */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Convidar Parceiro(a)</h3>
              <form onSubmit={handleSend} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <Input 
                    type="email"
                    placeholder="E-mail da pessoa..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-700 text-white h-12 rounded-xl"
                  />
                </div>
                {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
                
                <Button 
                  type="submit" 
                  disabled={mutation.isPending || !email}
                  className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Enviar Convite</>}
                </Button>
              </form>
            </div>

            {/* Lista de Membros Ativos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Quem está na conta
              </h3>
              {loadingMembers ? (
                <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-purple-500" /></div>
              ) : (
                <div className="space-y-2">
                  {members?.map(m => {
                    const isMe = m.id === user?.id
                    const name = m.display_name || 'Usuário'
                    return (
                      <div key={m.id} className="flex items-center gap-3 bg-slate-900/30 border border-slate-800 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                          <Users className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{name} {isMe && <span className="text-xs text-purple-400 font-normal ml-1">(Você)</span>}</p>
                          <p className="text-xs text-slate-500">Membro ativo</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Lista de Convites Pendentes */}
            {pending && pending.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Convites Pendentes
                </h3>
                <div className="space-y-2">
                  {pending.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-slate-900/30 border border-slate-800 border-dashed p-3 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{p.invitee_email}</p>
                        <p className="text-xs text-yellow-500">Aguardando aceite...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
