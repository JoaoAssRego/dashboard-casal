import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategory, updateCategory, categorySchema, categoryKeys, type Category, type CategoryInput } from "@/features/categories/api/categories"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
]

interface CategoryFormDrawerProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryFormDrawer({ category, open, onOpenChange }: CategoryFormDrawerProps) {
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      color: COLORS[0],
      icon: 'Tag'
    }
  })

  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
        color: category.color,
        icon: category.icon
      })
    } else if (open && !category) {
      reset({
        name: '',
        color: COLORS[0],
        icon: 'Tag'
      })
    }
  }, [category, open, reset])

  const mutation = useMutation({
    mutationFn: (data: CategoryInput) => {
      if (category) return updateCategory({ id: category.id, input: data })
      return createCategory(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      onOpenChange(false)
    }
  })

  const selectedColor = watch('color')

  const onSubmit = (data: CategoryInput) => {
    mutation.mutate(data)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-slate-950 border-t border-purple-500/20">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white">
              {category ? 'Editar Categoria' : 'Nova Categoria'}
            </DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nome da Categoria</Label>
              <Input 
                id="name" 
                placeholder="Ex: Assinaturas" 
                className="bg-slate-900 border-slate-800 text-white h-12"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Cor</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setValue('color', hex)}
                    className={cn(
                      "w-10 h-10 rounded-full transition-transform",
                      selectedColor === hex ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-white scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-full font-bold bg-purple-600 hover:bg-purple-500 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Categoria
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
