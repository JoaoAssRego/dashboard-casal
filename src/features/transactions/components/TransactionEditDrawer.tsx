import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { getGoals, goalKeys } from "@/features/goals/api/goals"
import { getCategories, categoryKeys } from "@/features/categories/api/categories"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { transactionSchema, transactionKeys, type TransactionInput, type Transaction, updateTransaction } from "../api/transactions"

interface TransactionEditDrawerProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionEditDrawer({ transaction, open, onOpenChange }: TransactionEditDrawerProps) {
  const queryClient = useQueryClient()

  // 3 genéricos: entrada (campo cru, amount como string) → contexto → saída coagida (TransactionInput).
  const form = useForm<z.input<typeof transactionSchema>, unknown, TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      transaction_date: new Date().toISOString().split('T')[0],
      goal_id: null,
      category_id: null,
    },
  })

  // Preenche o formulário quando a transação selecionada mudar
  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description,
        transaction_date: new Date(transaction.transaction_date).toISOString().split('T')[0],
        goal_id: transaction.goal_id,
        category_id: transaction.category_id,
      })
    }
  }, [transaction, form])

  const txType = form.watch("type")
  const { data: goals } = useQuery({ queryKey: goalKeys.all, queryFn: getGoals })
  const { data: categories } = useQuery({ queryKey: categoryKeys.all, queryFn: getCategories })

  const mutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: goalKeys.all }) // Pode afetar metas se for investimento
      onOpenChange(false)
    },
    onError: (error: Error) => {
      alert("Erro ao editar: " + error.message)
    }
  })

  function onSubmit(values: TransactionInput) {
    if (!transaction) return
    mutation.mutate({ id: transaction.id, input: values })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-slate-950 border-t border-purple-500/20">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white">Editar Lançamento</DrawerTitle>
            <DrawerDescription className="text-purple-200/50">Veja ou edite os detalhes desta movimentação.</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <Form {...form}>
              <form id="transaction-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Tipo de Movimentação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          <SelectItem value="expense" className="text-pink-400 font-medium">Despesa</SelectItem>
                          <SelectItem value="income" className="text-blue-400 font-medium">Receita</SelectItem>
                          <SelectItem value="investment" className="text-purple-400 font-medium">Aporte (Guardar)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {categories && categories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Categoria</FormLabel>
                        <Select 
                          onValueChange={(val) => field.onChange(val === 'none' ? null : val)} 
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="none" className="text-slate-500 italic">Sem categoria</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="text-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {txType === 'investment' && goals && goals.length > 0 && (
                  <FormField
                    control={form.control}
                    name="goal_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Para qual Meta?</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                              <SelectValue placeholder="Selecione a meta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            {goals.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id} className="text-indigo-300 font-medium">
                                {goal.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Valor (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" className="bg-slate-900 border-slate-800 text-white" {...field} value={field.value as string | number} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transaction_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Data</FormLabel>
                        <FormControl>
                          <Input type="date" className="bg-slate-900 border-slate-800 text-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Conta de Luz, Mercado..." className="bg-slate-900 border-slate-800 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </form>
            </Form>
          </div>
          
          <DrawerFooter className="pt-6">
            <Button 
              type="submit" 
              form="transaction-edit-form" 
              disabled={mutation.isPending}
              className="rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Edição
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
