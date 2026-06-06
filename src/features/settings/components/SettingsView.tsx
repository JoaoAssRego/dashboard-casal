import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getCategories, type Category } from "@/features/categories/api/categories"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { CategoryFormDrawer } from "./CategoryFormDrawer"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SettingsView() {
  const { user, signOut } = useAuthStore()
  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  function handleAdd() {
    setEditingCat(null)
    setIsDrawerOpen(true)
  }

  function handleEdit(cat: Category) {
    setEditingCat(cat)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <CategoryFormDrawer 
        category={editingCat} 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
      />

      <div className="pt-2">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Menu Principal
        </h2>
        <p className="text-slate-400 text-sm">Todos os serviços e configurações</p>
      </div>

      {/* Seção de Categorias */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Categorias Personalizadas</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-300 rounded-full"
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4 mr-1" /> Nova
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {isLoading ? (
            <div className="text-center p-4 text-slate-500">Carregando...</div>
          ) : categories?.length === 0 ? (
            <div className="text-center p-4 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Nenhuma categoria criada.
            </div>
          ) : (
            categories?.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => handleEdit(cat)}
                className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-200">{cat.name}</span>
                </div>
                <span className="text-xs text-slate-500">Toque para editar</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
