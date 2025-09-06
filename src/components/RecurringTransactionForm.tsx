import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { RepeatIcon, Calendar } from 'lucide-react'
import { useFinanceData, Category } from '@/hooks/useFinanceData'

interface RecurringTransactionFormProps {
  categories: Category[]
}

const RecurringTransactionForm = ({ categories }: RecurringTransactionFormProps) => {
  const { addTransaction } = useFinanceData()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'entrada' | 'saida'>('saida')
  const [categoryId, setCategoryId] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [months, setMonths] = useState('12')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount || !categoryId) return

    setLoading(true)
    try {
      const numericAmount = parseFloat(amount)
      const totalMonths = parseInt(months)
      const dayNum = parseInt(dayOfMonth)

      // Generate recurring transactions for the specified number of months
      const today = new Date()
      for (let i = 0; i < totalMonths; i++) {
        const transactionDate = new Date(today.getFullYear(), today.getMonth() + i, dayNum)
        
        await addTransaction({
          description: `${description} (${i + 1}/${totalMonths})`,
          amount: numericAmount,
          type,
          category_id: categoryId,
          date: transactionDate.toISOString().split('T')[0],
        })
      }

      // Reset form
      setDescription('')
      setAmount('')
      setCategoryId('')
      setDayOfMonth('1')
      setMonths('12')
      setOpen(false)
    } catch (error) {
      console.error('Error creating recurring transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => cat.type === type)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RepeatIcon className="h-4 w-4 mr-2" />
          Transação Recorrente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Criar Transação Recorrente
          </DialogTitle>
          <DialogDescription>
            Crie transações que se repetem mensalmente por um período determinado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Aluguel, Salário..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: 'entrada' | 'saida') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">Dia do Mês</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Dia" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="months">Quantidade de Meses</Label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger>
                  <SelectValue placeholder="Meses" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month} {month === 1 ? 'mês' : 'meses'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Transações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RecurringTransactionForm