import { useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTransactions, deleteTransaction } from "../api/transactions"
import { getCategories } from "@/features/categories/api/categories"
import { Loader2, Trash2, ArrowUpRight, ArrowDownRight, Target, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TransactionEditDrawer } from "./TransactionEditDrawer"
import { ImportPreviewDrawer } from "./ImportPreviewDrawer"
import { TransactionForm } from "./TransactionForm"
import type { Transaction } from "../api/transactions"

export function TransactionsView() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'investment'>('all')
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  
  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) setCsvFile(file)
    event.target.value = '' // reset
  }

  const { data: transactions, isLoading: loadingTx } = useQuery({ queryKey: ['transactions'], queryFn: getTransactions })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })

  if (loadingTx) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  const filteredTransactions = transactions?.filter(tx => filter === 'all' || tx.type === filter) || []

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative">
      <TransactionEditDrawer transaction={editingTx} open={!!editingTx} onOpenChange={(o) => !o && setEditingTx(null)} />
      <ImportPreviewDrawer csvFile={csvFile} open={!!csvFile} onOpenChange={(o) => !o && setCsvFile(null)} />
      <TransactionForm />

      <div className="pt-2 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Extrato Completo</h2>
          <p className="text-slate-400 text-sm">Todo o seu histórico financeiro</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white rounded-full h-9"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          CSV
        </Button>
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
      </div>

      {/* Filtros */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          className={cn("rounded-full", filter === 'all' ? "bg-primary text-white" : "border-slate-800 text-slate-300")}
          onClick={() => setFilter('all')}
        >
          Tudo
        </Button>
        <Button 
          variant={filter === 'expense' ? 'default' : 'outline'} 
          className={cn("rounded-full", filter === 'expense' ? "bg-pink-600 text-white hover:bg-pink-500" : "border-slate-800 text-slate-300")}
          onClick={() => setFilter('expense')}
        >
          Despesas
        </Button>
        <Button 
          variant={filter === 'income' ? 'default' : 'outline'} 
          className={cn("rounded-full", filter === 'income' ? "bg-blue-600 text-white hover:bg-blue-500" : "border-slate-800 text-slate-300")}
          onClick={() => setFilter('income')}
        >
          Receitas
        </Button>
        <Button 
          variant={filter === 'investment' ? 'default' : 'outline'} 
          className={cn("rounded-full", filter === 'investment' ? "bg-purple-600 text-white hover:bg-purple-500" : "border-slate-800 text-slate-300")}
          onClick={() => setFilter('investment')}
        >
          Aportes
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center p-8 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            Nenhuma movimentação encontrada.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isExpense = tx.type === 'expense'
            const isIncome = tx.type === 'income'
            const isInvestment = tx.type === 'investment'

            const category = categories?.find(c => c.id === tx.category_id)

            return (
              <div 
                key={tx.id} 
                onClick={() => setEditingTx(tx)}
                className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 shadow-sm cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    isExpense ? "bg-pink-500/10 text-pink-500" : 
                    isIncome ? "bg-blue-500/10 text-blue-500" : 
                    "bg-purple-500/10 text-purple-500"
                  )}>
                    {isExpense ? <ArrowDownRight className="h-5 w-5" /> : 
                     isIncome ? <ArrowUpRight className="h-5 w-5" /> : 
                     <Target className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{tx.description}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        {new Date(tx.transaction_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      {category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300" style={{ color: category.color }}>
                          {category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "font-bold",
                    isExpense ? "text-pink-500" : isIncome ? "text-blue-500" : "text-purple-500"
                  )}>
                    {isExpense ? "-" : "+"}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      if(window.confirm('Tem certeza que deseja apagar?')) {
                        deleteMutation.mutate(tx.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
