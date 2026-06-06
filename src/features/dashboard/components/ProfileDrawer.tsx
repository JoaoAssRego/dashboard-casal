import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface ProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDrawer({ open, onOpenChange }: ProfileDrawerProps) {
  const { user, signOut } = useAuthStore()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-slate-950 border-t border-slate-800">
        <div className="mx-auto w-full max-w-md h-full flex flex-col pb-6">
          <DrawerHeader className="border-b border-slate-800 pb-4">
            <DrawerTitle className="text-xl font-bold text-white text-center">Meu Perfil</DrawerTitle>
          </DrawerHeader>
          
          <div className="p-4 space-y-6">
             <div className="flex flex-col items-center justify-center space-y-3 py-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center border-[6px] border-slate-900 shadow-xl relative">
                  <User className="h-12 w-12 text-slate-300" />
                </div>
                <div className="text-center mt-2">
                  <h3 className="text-xl font-bold text-white capitalize">{user?.email?.split('@')[0]}</h3>
                  <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
                </div>
             </div>

             <div className="pt-4">
               <Button 
                  variant="destructive" 
                  className="w-full h-12 rounded-full font-bold bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 transition-all"
                  onClick={() => {
                    onOpenChange(false)
                    signOut()
                  }}
               >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sair do Aplicativo
               </Button>
             </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
