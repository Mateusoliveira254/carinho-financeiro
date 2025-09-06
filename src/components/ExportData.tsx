import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { useFinanceData } from '@/hooks/useFinanceData'
import { useAuth } from '@/contexts/AuthContext'

const ExportData = () => {
  const { transactions, accountsPayable, accountsReceivable, categories } = useFinanceData()
  const { user } = useAuth()

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportAllData = () => {
    const allData = {
      usuario: user?.name,
      perfil: user?.profile_type,
      data_exportacao: new Date().toISOString(),
      transacoes: transactions,
      contas_a_pagar: accountsPayable,
      contas_a_receber: accountsReceivable,
      categorias: categories
    }

    const jsonString = JSON.stringify(allData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportToCSV(transactions, 'transacoes')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Transações (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToCSV(accountsPayable, 'contas_a_pagar')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Contas a Pagar (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToCSV(accountsReceivable, 'contas_a_receber')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Contas a Receber (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAllData}>
          <FileText className="h-4 w-4 mr-2" />
          Backup Completo (JSON)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ExportData