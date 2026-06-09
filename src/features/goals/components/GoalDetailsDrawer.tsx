import { Trophy, TrendingUp, X } from "lucide-react"
import type { FinancialGoal } from "../api/goals"
import type { Transaction } from "@/features/transactions/api/transactions"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

interface GoalDetailsDrawerProps {
  goal: FinancialGoal | null
  transactions: Transaction[] | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalDetailsDrawer({ goal, transactions, open, onOpenChange }: GoalDetailsDrawerProps) {
  if (!goal) return null

  const goalTransactions = transactions?.filter(tx => tx.goal_id === goal.id && tx.type === 'investment') || []
  const currentAmount = goalTransactions.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const percentage = Math.min(100, Math.max(0, (currentAmount / goal.target_amount) * 100))
  const remaining = Math.max(0, goal.target_amount - currentAmount)
  const isAchieved = goal.status === 'achieved'

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-slate-950 border-t border-indigo-500/20 max-h-[85vh]">
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          <DrawerHeader className="relative">
            <DrawerTitle className="text-2xl font-bold text-white">{goal.title}</DrawerTitle>
            <DrawerDescription className="text-indigo-200/60">
              {isAchieved ? 'Meta realizada com sucesso!' : 'Acompanhamento detalhado do seu sonho'}
            </DrawerDescription>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-slate-400 hover:text-white rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            {/* Card de Resumo Principal */}
            <div className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden ${isAchieved ? 'bg-purple-950/30 border-purple-500/20' : 'bg-indigo-950/30 border-indigo-500/20'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 ${isAchieved ? 'bg-purple-500/15' : 'bg-indigo-500/10'}`} />

              {isAchieved ? (
                /* Estado de conquista */
                <div className="flex flex-col items-center py-4 gap-3 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-300 mb-1">Meta conquistada!</p>
                    <h3 className="text-3xl font-bold text-white">{fmt(currentAmount)}</h3>
                    <p className="text-sm text-slate-400 mt-1">de {fmt(goal.target_amount)} guardados</p>
                  </div>
                  <div className="w-full mt-2">
                    <Progress value={100} className="h-2.5 bg-slate-900/50" />
                  </div>
                </div>
              ) : (
                /* Estado ativo */
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm text-indigo-300 font-medium mb-1">Guardado até agora</p>
                      <h3 className="text-3xl font-bold text-white">{fmt(currentAmount)}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Alvo</p>
                      <span className="text-sm font-semibold text-slate-300">{fmt(goal.target_amount)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-indigo-400">{percentage.toFixed(1)}% Concluído</span>
                      <span className="text-pink-400">Faltam {fmt(remaining)}</span>
                    </div>
                    <Progress value={percentage} className="h-3 bg-slate-900/50" />
                  </div>
                </div>
              )}
            </div>

            {/* Histórico de Aportes */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Histórico de Aportes
              </h4>

              {goalTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center bg-slate-900/30">
                  <p className="text-xs text-slate-400">Ainda não há dinheiro guardado para esta meta.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goalTransactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{tx.description}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(tx.transaction_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-indigo-400">
                        + {fmt(Number(tx.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="pt-2 pb-6 border-t border-slate-800/50 mt-auto">
            <DrawerClose asChild>
              <Button className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white">Fechar Detalhes</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
