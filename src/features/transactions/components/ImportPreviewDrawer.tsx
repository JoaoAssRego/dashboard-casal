import { useState, useEffect } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { getCategories } from "@/features/categories/api/categories"
import { createTransactionsBatch, type TransactionInput } from "../api/transactions"
import { Loader2, ArrowRight } from "lucide-react"
import Papa from "papaparse"

import { Button } from "@/components/ui/button"
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

interface ImportPreviewDrawerProps {
  csvFile: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportPreviewDrawer({ csvFile, open, onOpenChange }: ImportPreviewDrawerProps) {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  
  const [parsedRows, setParsedRows] = useState<TransactionInput[]>([])
  const [isParsing, setIsParsing] = useState(false)

  const mutation = useMutation({
    mutationFn: createTransactionsBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      onOpenChange(false)
      setParsedRows([])
    },
    onError: (error: any) => {
      alert("Erro ao importar: " + error.message)
    }
  })

  useEffect(() => {
    if (csvFile && open) {
      setIsParsing(true)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (!text) {
          setIsParsing(false)
          return
        }

        // Procura a linha que contém o cabeçalho (ignorando lixo acima)
        const lines = text.split(/\r?\n/)
        const headerIndex = lines.findIndex(line => line.includes('Lançamento') && line.includes('Valor'))
        
        if (headerIndex === -1) {
          alert("Padrão de CSV não reconhecido. O arquivo precisa conter as colunas 'Lançamento' e 'Valor'.")
          setIsParsing(false)
          return
        }

        const cleanCsv = lines.slice(headerIndex).join('\n')

        Papa.parse(cleanCsv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
          const rows: TransactionInput[] = []
          
          results.data.forEach((row: any) => {
            // Verifica o formato Inter: "Data","Lançamento","Detalhes","N° documento","Valor","Tipo Lançamento"
            const lancamento = (row['Lançamento'] || '').toLowerCase()
            const tipo = (row['Tipo Lançamento'] || '').trim()
            
            // Ignorar Saldos do dia ou Saldo Anterior
            if (lancamento.includes('saldo') || tipo === '') {
              return
            }

            // Converter Valor ("20,00" -> 20.00) e (-20,00 -> 20.00)
            const rawValue = (row['Valor'] || '0').replace(/\./g, '').replace(',', '.')
            const amount = Math.abs(parseFloat(rawValue))

            if (isNaN(amount) || amount === 0) return

            // Tipo Lançamento
            let type: 'income' | 'expense' | 'investment' = 'expense'
            if (tipo === 'Entrada') type = 'income'

            // Data (DD/MM/YYYY -> YYYY-MM-DD)
            const rawDate = row['Data'] || ''
            let transaction_date = new Date().toISOString().split('T')[0]
            if (rawDate.includes('/')) {
              const [d, m, y] = rawDate.split('/')
              transaction_date = `${y}-${m}-${d}`
            }

            // Descrição (Juntar Lançamento com os Detalhes do Pix)
            const description = row['Lançamento'] + (row['Detalhes'] ? ` - ${row['Detalhes']}` : '')

            rows.push({
              type,
              amount,
              description: description.substring(0, 255), // Limite do banco
              transaction_date,
              category_id: null,
              goal_id: null
            })
          })

          setParsedRows(rows)
          setIsParsing(false)
        }
      })
      }
      reader.readAsText(csvFile)
    }
  }, [csvFile, open])

  function handleCategoryChange(index: number, category_id: string | null) {
    setParsedRows(prev => {
      const newRows = [...prev]
      newRows[index].category_id = category_id
      return newRows
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-slate-950 border-t border-purple-500/20 max-h-[90vh]">
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-white">Revisar Importação</DrawerTitle>
            <DrawerDescription className="text-purple-200/50">
              Encontramos {parsedRows.length} lançamentos no CSV. Você pode categorizá-los agora ou apenas salvar como estão.
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 overflow-y-auto space-y-3 max-h-[55vh]" data-vaul-no-drag>
            {isParsing ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-purple-500" /></div>
            ) : parsedRows.map((tx, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{tx.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(tx.transaction_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                  </div>
                  <p className={`font-bold whitespace-nowrap ml-2 ${tx.type === 'income' ? 'text-blue-500' : 'text-pink-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                  </p>
                </div>
                
                {categories && categories.length > 0 && (
                  <Select 
                    onValueChange={(val) => handleCategoryChange(idx, val === 'none' ? null : val)} 
                    value={tx.category_id || 'none'}
                  >
                    <SelectTrigger className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-300 w-full mt-1">
                      <SelectValue placeholder="Sem categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 z-[100]">
                      <SelectItem value="none" className="text-slate-500 italic">Sem categoria</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-white text-xs">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
          
          <DrawerFooter className="pt-4 border-t border-slate-800 bg-slate-950 z-10">
            <Button 
              onClick={() => mutation.mutate(parsedRows)}
              disabled={mutation.isPending || parsedRows.length === 0}
              className="rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold w-full h-12"
            >
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
              Salvar {parsedRows.length} Lançamentos
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
