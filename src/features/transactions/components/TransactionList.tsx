import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTransactions, deleteTransaction, transactionKeys } from "../api/transactions"
import { Loader2, Trash2 } from "lucide-react"
import { TransactionEditDrawer } from "./TransactionEditDrawer"
import type { Transaction } from "../api/transactions"
export function TransactionList() {
  const queryClient = useQueryClient()
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const { data: transactions, isLoading, error } = useQuery({
    queryKey: transactionKeys.all,
    queryFn: getTransactions
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      // Força a lista e os cartões do dashboard a se atualizarem na hora
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
    onError: (error: Error) => {
      alert("Erro ao excluir: " + error.message)
    }
  })

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /></div>
  }

  if (error) {
    return <div className="text-pink-500 text-center p-4 bg-pink-500/10 rounded-xl">Erro ao carregar extrato: {error.message}</div>
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/50">
        <h3 className="text-sm font-medium text-white mb-1">Tudo limpo!</h3>
        <p className="text-xs text-slate-400">Nenhum lançamento foi registrado para este mês.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-8">
      <TransactionEditDrawer transaction={editingTx} open={!!editingTx} onOpenChange={(o) => !o && setEditingTx(null)} />
      {transactions.map((tx) => (
        <div 
          key={tx.id} 
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm backdrop-blur-md cursor-pointer hover:bg-slate-800/80 transition-colors"
          onClick={() => setEditingTx(tx)}
        >
          <div className="flex flex-col flex-1">
            <span className="font-medium text-white text-sm">{tx.description}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {new Date(tx.transaction_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`font-semibold text-sm ${tx.type === 'expense' ? 'text-pink-400' : tx.type === 'income' ? 'text-blue-400' : 'text-purple-400'}`}>
              {tx.type === 'expense' ? '- ' : '+ '}
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm("Deseja apagar este lançamento?")) {
                  deleteMutation.mutate(tx.id)
                }
              }}
              className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
