import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

// Types for financial data (structured to be easily replaced with Supabase later)
export interface Category {
  id: string
  user_id: string
  name: string
  type: 'entrada' | 'saida'
  profile_type: 'empresa' | 'pessoal'
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'entrada' | 'saida'
  category_id: string
  date: string
  created_at: string
  updated_at: string
}

export interface AccountPayable {
  id: string
  user_id: string
  description: string
  category_id: string
  due_date: string
  amount: number
  status: 'pendente' | 'pago' | 'vencido'
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface AccountReceivable {
  id: string
  user_id: string
  client_name: string
  description: string
  amount: number
  due_date: string
  status: 'pendente' | 'recebido'
  created_at: string
  updated_at: string
}

// Mock data generator (will be replaced with Supabase later)
const generateMockData = (userId: string, profileType: 'empresa' | 'pessoal') => {
  const mockCategories: Category[] = profileType === 'empresa' 
    ? [
        { id: '1', user_id: userId, name: 'Impostos', type: 'saida', profile_type: 'empresa', created_at: new Date().toISOString() },
        { id: '2', user_id: userId, name: 'Aluguel', type: 'saida', profile_type: 'empresa', created_at: new Date().toISOString() },
        { id: '3', user_id: userId, name: 'Fornecedores', type: 'saida', profile_type: 'empresa', created_at: new Date().toISOString() },
        { id: '4', user_id: userId, name: 'Energia', type: 'saida', profile_type: 'empresa', created_at: new Date().toISOString() },
        { id: '5', user_id: userId, name: 'Vendas', type: 'entrada', profile_type: 'empresa', created_at: new Date().toISOString() },
        { id: '6', user_id: userId, name: 'Clientes', type: 'entrada', profile_type: 'empresa', created_at: new Date().toISOString() },
      ]
    : [
        { id: '7', user_id: userId, name: 'Alimentação', type: 'saida', profile_type: 'pessoal', created_at: new Date().toISOString() },
        { id: '8', user_id: userId, name: 'Saúde', type: 'saida', profile_type: 'pessoal', created_at: new Date().toISOString() },
        { id: '9', user_id: userId, name: 'Lazer', type: 'saida', profile_type: 'pessoal', created_at: new Date().toISOString() },
        { id: '10', user_id: userId, name: 'Transporte', type: 'saida', profile_type: 'pessoal', created_at: new Date().toISOString() },
        { id: '11', user_id: userId, name: 'Salário', type: 'entrada', profile_type: 'pessoal', created_at: new Date().toISOString() },
      ]

  // Generate some sample transactions for demo
  const sampleTransactions: Transaction[] = profileType === 'empresa' ? [
    { id: '1', user_id: userId, description: 'Venda de produtos', amount: 15000, type: 'entrada', category_id: '5', date: '2024-01-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', user_id: userId, description: 'Pagamento de impostos', amount: 2500, type: 'saida', category_id: '1', date: '2024-01-10', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', user_id: userId, description: 'Aluguel do escritório', amount: 3000, type: 'saida', category_id: '2', date: '2024-01-05', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ] : [
    { id: '4', user_id: userId, description: 'Salário recebido', amount: 5000, type: 'entrada', category_id: '11', date: '2024-01-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '5', user_id: userId, description: 'Compras no supermercado', amount: 400, type: 'saida', category_id: '7', date: '2024-01-12', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '6', user_id: userId, description: 'Cinema', amount: 50, type: 'saida', category_id: '9', date: '2024-01-14', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]

  const sampleAccountsPayable: AccountPayable[] = profileType === 'empresa' ? [
    { id: '1', user_id: userId, description: 'Impostos mensais', category_id: '1', due_date: '2024-02-10', amount: 2500, status: 'pendente', is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', user_id: userId, description: 'Aluguel', category_id: '2', due_date: '2024-02-05', amount: 3000, status: 'pendente', is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ] : [
    { id: '3', user_id: userId, description: 'Plano de saúde', category_id: '8', due_date: '2024-02-15', amount: 350, status: 'pendente', is_recurring: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]

  const sampleAccountsReceivable: AccountReceivable[] = profileType === 'empresa' ? [
    { id: '1', user_id: userId, client_name: 'Cliente ABC', description: 'Serviços prestados', amount: 5000, due_date: '2024-02-20', status: 'pendente', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', user_id: userId, client_name: 'Cliente XYZ', description: 'Venda de produtos', amount: 8000, due_date: '2024-02-25', status: 'pendente', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ] : []

  return {
    categories: mockCategories,
    transactions: sampleTransactions,
    accountsPayable: sampleAccountsPayable,
    accountsReceivable: sampleAccountsReceivable
  }
}

export const useFinanceData = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([])
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get data from localStorage or generate mock data
      const storageKey = `financeData_${user.id}`
      const savedData = localStorage.getItem(storageKey)
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setTransactions(parsedData.transactions || [])
        setAccountsPayable(parsedData.accountsPayable || [])
        setAccountsReceivable(parsedData.accountsReceivable || [])
        setCategories(parsedData.categories || [])
      } else {
        // Generate and save mock data for first time users
        const mockData = generateMockData(user.id, user.profile_type)
        setTransactions(mockData.transactions)
        setAccountsPayable(mockData.accountsPayable)
        setAccountsReceivable(mockData.accountsReceivable)
        setCategories(mockData.categories)
        
        localStorage.setItem(storageKey, JSON.stringify(mockData))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar seus dados financeiros",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to save data to localStorage
  const saveToStorage = (data: any) => {
    if (!user) return
    const storageKey = `financeData_${user.id}`
    localStorage.setItem(storageKey, JSON.stringify(data))
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)
    
    saveToStorage({
      transactions: updatedTransactions,
      accountsPayable,
      accountsReceivable,
      categories
    })

    toast({
      title: "Transação adicionada com sucesso!",
    })
    return newTransaction
  }

  const addAccountPayable = async (account: Omit<AccountPayable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    const newAccount: AccountPayable = {
      ...account,
      id: Date.now().toString(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedAccountsPayable = [...accountsPayable, newAccount]
    setAccountsPayable(updatedAccountsPayable)
    
    saveToStorage({
      transactions,
      accountsPayable: updatedAccountsPayable,
      accountsReceivable,
      categories
    })

    toast({
      title: "Conta a pagar adicionada com sucesso!",
    })
    return newAccount
  }

  const addAccountReceivable = async (account: Omit<AccountReceivable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    const newAccount: AccountReceivable = {
      ...account,
      id: Date.now().toString(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const updatedAccountsReceivable = [...accountsReceivable, newAccount]
    setAccountsReceivable(updatedAccountsReceivable)
    
    saveToStorage({
      transactions,
      accountsPayable,
      accountsReceivable: updatedAccountsReceivable,
      categories
    })

    toast({
      title: "Conta a receber adicionada com sucesso!",
    })
    return newAccount
  }

  const updateAccountPayableStatus = async (id: string, status: AccountPayable['status']) => {
    const updatedAccountsPayable = accountsPayable.map(account => 
      account.id === id ? { ...account, status, updated_at: new Date().toISOString() } : account
    )
    
    setAccountsPayable(updatedAccountsPayable)
    
    saveToStorage({
      transactions,
      accountsPayable: updatedAccountsPayable,
      accountsReceivable,
      categories
    })

    toast({
      title: "Status atualizado com sucesso!",
    })
  }

  const updateAccountReceivableStatus = async (id: string, status: AccountReceivable['status']) => {
    const updatedAccountsReceivable = accountsReceivable.map(account => 
      account.id === id ? { ...account, status, updated_at: new Date().toISOString() } : account
    )
    
    setAccountsReceivable(updatedAccountsReceivable)
    
    saveToStorage({
      transactions,
      accountsPayable,
      accountsReceivable: updatedAccountsReceivable,
      categories
    })

    toast({
      title: "Status atualizado com sucesso!",
    })
  }

  // Add a new category
  const addCategory = async (name: string, type: 'entrada' | 'saida') => {
    if (!user) return

    const newCategory: Category = {
      id: Date.now().toString(),
      user_id: user.id,
      name,
      type,
      profile_type: user.profile_type,
      created_at: new Date().toISOString(),
    }

    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    
    saveToStorage({
      transactions,
      accountsPayable,
      accountsReceivable,
      categories: updatedCategories
    })

    toast({
      title: "Categoria adicionada com sucesso!",
    })
    return newCategory
  }

  // Calculate financial summaries
  const getFinancialSummary = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0)

    const pendingPayments = accountsPayable.filter(a => a.status === 'pendente').length
    const overduePayments = accountsPayable.filter(a => {
      const dueDate = new Date(a.due_date)
      const today = new Date()
      return a.status === 'pendente' && dueDate < today
    }).length

    const pendingReceivables = accountsReceivable
      .filter(a => a.status === 'pendente')
      .reduce((sum, a) => sum + a.amount, 0)

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      pendingPayments,
      overduePayments,
      pendingReceivables,
    }
  }

  return {
    transactions,
    accountsPayable,
    accountsReceivable,
    categories,
    loading,
    addTransaction,
    addAccountPayable,
    addAccountReceivable,
    addCategory,
    updateAccountPayableStatus,
    updateAccountReceivableStatus,
    getFinancialSummary,
    refetch: fetchAllData,
  }
}