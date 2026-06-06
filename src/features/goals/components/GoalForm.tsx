import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Target } from "lucide-react"

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

import { goalSchema, type GoalInput, createGoal } from "../api/goals"

export function GoalForm() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: {
      title: "",
      target_amount: "" as any,
    },
  })

  const mutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      alert("Erro ao salvar meta: " + error.message)
    }
  })

  function onSubmit(values: GoalInput) {
    mutation.mutate(values)
  }

  function handleOpen() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setOpen(true)
  }

  return (
    <>
      <Button 
        onClick={handleOpen}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl h-12 shadow-lg shadow-indigo-600/20"
      >
        <Target className="mr-2 h-5 w-5" />
        Criar Nova Meta
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-slate-950 border-t border-indigo-500/20">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white">Novo Sonho</DrawerTitle>
            <DrawerDescription className="text-indigo-200/50">Crie um objetivo para guardarem juntos.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Form {...form}>
              <form id="goal-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Viagem para Paris" className="bg-slate-900 border-slate-800 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="target_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Qual o valor alvo? (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 5000.00" className="bg-slate-900 border-slate-800 text-white" {...field} />
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
              form="goal-form" 
              disabled={mutation.isPending}
              className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Meta
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
      </Drawer>
    </>
  )
}
