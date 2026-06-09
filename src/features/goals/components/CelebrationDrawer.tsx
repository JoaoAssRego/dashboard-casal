import { Trophy, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

interface CelebrationDrawerProps {
  goalTitle: string
  open: boolean
  onClose: () => void
}

export function CelebrationDrawer({ goalTitle, open, onClose }: CelebrationDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-slate-950 border-t border-purple-500/30">
        <div className="mx-auto w-full max-w-sm text-center px-6 pt-8 pb-10 space-y-6">

          {/* Troféu com brilho */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-36 bg-purple-500/25 rounded-full blur-3xl" />
            </div>
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-bounce">
              <Trophy className="h-11 w-11 text-white" />
            </div>
          </div>

          {/* Estrelas */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Parabéns! 🎉</h2>
            <p className="text-slate-400 text-sm">Você realizou a meta</p>
            <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              "{goalTitle}"
            </p>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed">
            Um sonho realizado! Continue assim — cada meta concluída é um passo para a liberdade financeira. 💜
          </p>

          <Button
            onClick={onClose}
            className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold h-12"
          >
            Continuar
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
