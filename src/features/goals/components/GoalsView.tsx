import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getGoals, deleteGoal } from "../api/goals"
import { getTransactions } from "@/features/transactions/api/transactions"
import { GoalForm } from "./GoalForm"
import { GoalDetailsDrawer } from "./GoalDetailsDrawer"
import { Loader2, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { FinancialGoal } from "../api/goals"

export function GoalsView() {
  const queryClient = useQueryClient()
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null)

  const { data: goals, isLoading: loadingGoals } = useQuery({ queryKey: ['goals'], queryFn: getGoals })
  const { data: transactions, isLoading: loadingTx } = useQuery({ queryKey: ['transactions'], queryFn: getTransactions })

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] })
  })

  const isLoading = loadingGoals || loadingTx

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Metas Financeiras</h2>
          <p className="text-slate-400 text-sm">Acompanhe os sonhos do casal</p>
        </div>
      </div>

      <GoalForm />

      <GoalDetailsDrawer 
        goal={selectedGoal} 
        transactions={transactions} 
        open={!!selectedGoal} 
        onOpenChange={(isOpen) => !isOpen && setSelectedGoal(null)} 
      />

      {(!goals || goals.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/50">
          <h3 className="text-sm font-medium text-white mb-1">Nenhum sonho cadastrado</h3>
          <p className="text-xs text-slate-400">Crie uma meta para começarem a guardar dinheiro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            // Calcula o valor atual somando os aportes direcionados a esta meta
            const currentAmount = transactions
              ?.filter(tx => tx.goal_id === goal.id && tx.type === 'investment')
              .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

            const percentage = Math.min(100, Math.max(0, (currentAmount / goal.target_amount) * 100))

            return (
              <div 
                key={goal.id} 
                onClick={() => setSelectedGoal(goal)}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative group overflow-hidden cursor-pointer hover:bg-slate-800/80 transition-colors"
              >
                {/* Efeito de brilho sutil no topo do card */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white group-hover:text-indigo-300 transition-colors">{goal.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentAmount)}
                      <span className="text-slate-500 mx-1">de</span>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full z-10"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => {
                      e.stopPropagation() // Evita abrir o modal ao clicar na lixeira
                      if(window.confirm("Apagar esta meta não apagará os aportes já feitos, mas eles perderão o destino. Tem certeza?")) {
                        deleteMutation.mutate(goal.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-indigo-400">Progresso</span>
                    <span className="text-white">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2.5 bg-slate-800" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
