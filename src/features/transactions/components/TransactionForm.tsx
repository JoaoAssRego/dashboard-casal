import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus } from "lucide-react"

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
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { transactionSchema, type TransactionInput, createTransaction } from "../api/transactions"

export function TransactionForm() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "" as unknown as number, // String vazia para o React entender que é controlado
      description: "",
      transaction_date: new Date().toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalida o cache e faz a Home se re-desenhar na mesma hora
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      alert("Erro ao salvar: " + error.message)
    }
  })

  function onSubmit(values: TransactionInput) {
    mutation.mutate(values)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {/* Botão Flutuante (FAB) Estilo Nativo posicionado acima da BottomBar */}
        <Button 
          size="lg" 
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-xl shadow-primary/20 z-40 bg-purple-600 hover:bg-purple-500 border-none text-white"
        >
          <Plus className="h-6 w-6 stroke-[3px]" />
        </Button>
      </DrawerTrigger>
      
      {/* O Conteúdo da Gaveta em Dark Premium */}
      <DrawerContent className="bg-slate-950 border-t border-purple-500/20">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white">Novo Lançamento</DrawerTitle>
            <DrawerDescription className="text-purple-200/50">Registre uma despesa, receita ou aporte.</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <Form {...form}>
              <form id="transaction-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Tipo de Movimentação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Valor (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" className="bg-slate-900 border-slate-800 text-white" {...field} />
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
              form="transaction-form" 
              disabled={mutation.isPending}
              className="rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lançar
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
