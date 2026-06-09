import { useEffect, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2, Trophy } from "lucide-react"
import { getGoals, deleteGoal, updateGoalStatus, goalKeys } from "../api/goals"
import { getTransactions, transactionKeys } from "@/features/transactions/api/transactions"
import { GoalForm } from "./GoalForm"
import { GoalDetailsDrawer } from "./GoalDetailsDrawer"
import { CelebrationDrawer } from "./CelebrationDrawer"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FinancialGoal } from "../api/goals"

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function GoalsView() {
  const queryClient = useQueryClient()
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null)
  const [celebratingGoal, setCelebratingGoal] = useState<FinancialGoal | null>(null)
  const celebratedRef = useRef<Set<string>>(new Set())

  const { data: goals, isLoading: loadingGoals } = useQuery({ queryKey: goalKeys.all, queryFn: getGoals })
  const { data: transactions, isLoading: loadingTx } = useQuery({ queryKey: transactionKeys.all, queryFn: getTransactions })

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
  })

  const achieveMutation = useMutation({
    mutationFn: (id: string) => updateGoalStatus(id, 'achieved'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: goalKeys.all }),
  })

  // Detecta metas ativas que atingiram 100% e ainda não foram celebradas nesta sessão
  useEffect(() => {
    if (!goals || !transactions) return

    for (const goal of goals) {
      if (goal.status !== 'active') continue
      if (celebratedRef.current.has(goal.id)) continue

      const current = transactions
        .filter(tx => tx.goal_id === goal.id && tx.type === 'investment')
        .reduce((acc, tx) => acc + Number(tx.amount), 0)

      if (current >= goal.target_amount) {
        celebratedRef.current.add(goal.id)
        setCelebratingGoal(goal)
        achieveMutation.mutate(goal.id)
        break
      }
    }
  }, [goals, transactions]) // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = loadingGoals || loadingTx

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      {/* Celebração de meta conquistada */}
      <CelebrationDrawer
        goalTitle={celebratingGoal?.title ?? ''}
        open={!!celebratingGoal}
        onClose={() => setCelebratingGoal(null)}
      />

      <GoalDetailsDrawer
        goal={selectedGoal}
        transactions={transactions}
        open={!!selectedGoal}
        onOpenChange={(isOpen) => !isOpen && setSelectedGoal(null)}
      />

      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Metas Financeiras</h2>
          <p className="text-slate-400 text-sm">Acompanhe os seus sonhos</p>
        </div>
      </div>

      <GoalForm />

      {(!goals || goals.length === 0) ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/50">
          <h3 className="text-sm font-medium text-white mb-1">Nenhum sonho cadastrado</h3>
          <p className="text-xs text-slate-400">Crie uma meta para começarem a guardar dinheiro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const currentAmount = transactions
              ?.filter(tx => tx.goal_id === goal.id && tx.type === 'investment')
              .reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

            const percentage = Math.min(100, Math.max(0, (currentAmount / goal.target_amount) * 100))
            const isAchieved = goal.status === 'achieved'

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={cn(
                  "p-5 rounded-2xl border shadow-lg relative group overflow-hidden cursor-pointer transition-colors",
                  isAchieved
                    ? "bg-purple-950/30 border-purple-500/30 hover:bg-purple-900/30"
                    : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80"
                )}
              >
                {/* Barra de cor no topo */}
                <div
                  className={cn(
                    "absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-60",
                    isAchieved
                      ? "from-purple-400 to-pink-400 opacity-100"
                      : "from-indigo-500 to-purple-500 opacity-50"
                  )}
                />

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {isAchieved && <Trophy className="h-4 w-4 text-yellow-400 shrink-0" />}
                      <h3 className={cn(
                        "font-semibold text-lg transition-colors",
                        isAchieved
                          ? "text-purple-200 group-hover:text-purple-100"
                          : "text-white group-hover:text-indigo-300"
                      )}>
                        {goal.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {fmt(currentAmount)}
                      <span className="text-slate-500 mx-1">de</span>
                      {fmt(goal.target_amount)}
                    </p>
                  </div>

                  {!isAchieved && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full z-10"
                      disabled={deleteMutation.isPending}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm("Apagar esta meta não apagará os aportes já feitos, mas eles perderão o destino. Tem certeza?")) {
                          deleteMutation.mutate(goal.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  {isAchieved && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full shrink-0">
                      Conquistada
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className={isAchieved ? "text-purple-400" : "text-indigo-400"}>Progresso</span>
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
