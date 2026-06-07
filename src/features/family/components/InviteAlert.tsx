import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getMyPendingInvites, acceptInvite, rejectInvite, familyKeys, type PendingInvite } from "@/features/family/api/family"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { Loader2, MailOpen, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"

export function InviteAlert() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [currentInvite, setCurrentInvite] = useState<PendingInvite | null>(null)

  const { data: invites } = useQuery({
    queryKey: familyKeys.invites,
    queryFn: getMyPendingInvites,
    enabled: !!user,
    refetchInterval: 15000 // A cada 15 segundos ele busca convites novos!
  })

  useEffect(() => {
    if (invites && invites.length > 0 && !currentInvite) {
      setCurrentInvite(invites[0])
      setOpen(true)
    }
  }, [invites, currentInvite])

  const acceptMutation = useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      setOpen(false)
      setCurrentInvite(null)
      // Recarrega a página inteira para o app ler a nova Household ID do banco
      window.location.reload()
    }
  })

  const rejectMutation = useMutation({
    mutationFn: rejectInvite,
    onSuccess: () => {
      setOpen(false)
      setCurrentInvite(null)
      queryClient.invalidateQueries({ queryKey: familyKeys.invites })
    }
  })

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="bg-slate-950 border-t border-purple-500/20 max-h-[90vh]">
        <div className="mx-auto w-full max-w-md flex flex-col items-center text-center space-y-4 p-6" data-vaul-no-drag>
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500/50 mt-4">
            <MailOpen className="h-8 w-8 text-purple-400" />
          </div>
          
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-xl text-white text-center">Convite Especial!</DrawerTitle>
            <DrawerDescription className="text-slate-400 mt-2 text-base text-center">
              <strong className="text-white">{currentInvite?.inviter_email}</strong> convidou você para dividir as finanças na Conta Conjunta.
            </DrawerDescription>
          </DrawerHeader>

          <div className="w-full space-y-3 pt-4">
            <Button 
              className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              onClick={() => currentInvite && acceptMutation.mutate(currentInvite.id)}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              {acceptMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="mr-2 h-5 w-5" /> Aceitar e Unir Contas</>}
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-12 rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => currentInvite && rejectMutation.mutate(currentInvite.id)}
              disabled={acceptMutation.isPending || rejectMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Recusar
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
