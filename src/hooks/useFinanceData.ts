import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

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
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      if (categoriesError) throw categoriesError

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (transactionsError) throw transactionsError

      // Fetch accounts payable
      const { data: payableData, error: payableError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (payableError) throw payableError

      // Fetch accounts receivable
      const { data: receivableData, error: receivableError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (receivableError) throw receivableError

      // Map data to match interface
      setCategories(categoriesData?.map(cat => ({
        id: cat.id.toString(),
        user_id: cat.user_id,
        name: cat.name,
        type: cat.type as 'entrada' | 'saida',
        profile_type: user.profile_type,
        created_at: new Date().toISOString()
      })) || [])

      setTransactions(transactionsData?.map(trans => ({
        id: trans.id.toString(),
        user_id: trans.user_id,
        description: trans.description || '',
        amount: Number(trans.amount),
        type: trans.type as 'entrada' | 'saida',
        category_id: trans.category_id?.toString() || '',
        date: trans.transaction_date,
        created_at: trans.created_at || new Date().toISOString(),
        updated_at: trans.created_at || new Date().toISOString()
      })) || [])

      setAccountsPayable(payableData?.map(payable => ({
        id: payable.id.toString(),
        user_id: payable.user_id,
        description: payable.description || '',
        category_id: payable.category_id?.toString() || '',
        due_date: payable.due_date,
        amount: Number(payable.amount),
        status: payable.status as 'pendente' | 'pago' | 'vencido',
        is_recurring: payable.is_recurring || false,
        created_at: payable.created_at || new Date().toISOString(),
        updated_at: payable.created_at || new Date().toISOString()
      })) || [])

      setAccountsReceivable(receivableData?.map(receivable => ({
        id: receivable.id.toString(),
        user_id: receivable.user_id,
        client_name: receivable.client_name || '',
        description: receivable.description || '',
        amount: Number(receivable.amount),
        due_date: receivable.due_date,
        status: receivable.status as 'pendente' | 'recebido',
        created_at: receivable.created_at || new Date().toISOString(),
        updated_at: receivable.created_at || new Date().toISOString()
      })) || [])

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

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category_id: transaction.category_id ? parseInt(transaction.category_id) : null,
          transaction_date: transaction.date
        })
        .select()
        .single()

      if (error) throw error

      const newTransaction: Transaction = {
        id: data.id.toString(),
        user_id: data.user_id,
        description: data.description || '',
        amount: Number(data.amount),
        type: data.type as 'entrada' | 'saida',
        category_id: data.category_id?.toString() || '',
        date: data.transaction_date,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.created_at || new Date().toISOString()
      }

      setTransactions(prev => [newTransaction, ...prev])

      toast({
        title: "Transação adicionada com sucesso!",
      })
      return newTransaction
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast({
        title: "Erro ao adicionar transação",
        description: "Ocorreu um erro ao salvar a transação",
        variant: "destructive"
      })
    }
  }

  const addAccountPayable = async (account: Omit<AccountPayable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert({
          user_id: user.id,
          description: account.description,
          category_id: account.category_id ? parseInt(account.category_id) : null,
          due_date: account.due_date,
          amount: account.amount,
          status: account.status,
          is_recurring: account.is_recurring
        })
        .select()
        .single()

      if (error) throw error

      const newAccount: AccountPayable = {
        id: data.id.toString(),
        user_id: data.user_id,
        description: data.description || '',
        category_id: data.category_id?.toString() || '',
        due_date: data.due_date,
        amount: Number(data.amount),
        status: data.status as 'pendente' | 'pago' | 'vencido',
        is_recurring: data.is_recurring || false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.created_at || new Date().toISOString()
      }

      setAccountsPayable(prev => [...prev, newAccount])

      toast({
        title: "Conta a pagar adicionada com sucesso!",
      })
      return newAccount
    } catch (error) {
      console.error('Error adding account payable:', error)
      toast({
        title: "Erro ao adicionar conta a pagar",
        description: "Ocorreu um erro ao salvar a conta",
        variant: "destructive"
      })
    }
  }

  const addAccountReceivable = async (account: Omit<AccountReceivable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert({
          user_id: user.id,
          client_name: account.client_name,
          description: account.description,
          amount: account.amount,
          due_date: account.due_date,
          status: account.status
        })
        .select()
        .single()

      if (error) throw error

      const newAccount: AccountReceivable = {
        id: data.id.toString(),
        user_id: data.user_id,
        client_name: data.client_name || '',
        description: data.description || '',
        amount: Number(data.amount),
        due_date: data.due_date,
        status: data.status as 'pendente' | 'recebido',
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.created_at || new Date().toISOString()
      }

      setAccountsReceivable(prev => [...prev, newAccount])

      toast({
        title: "Conta a receber adicionada com sucesso!",
      })
      return newAccount
    } catch (error) {
      console.error('Error adding account receivable:', error)
      toast({
        title: "Erro ao adicionar conta a receber",
        description: "Ocorreu um erro ao salvar a conta",
        variant: "destructive"
      })
    }
  }

  const updateAccountPayableStatus = async (id: string, status: AccountPayable['status']) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status })
        .eq('id', parseInt(id))
        .eq('user_id', user?.id)

      if (error) throw error

      setAccountsPayable(prev => 
        prev.map(account => 
          account.id === id 
            ? { ...account, status, updated_at: new Date().toISOString() } 
            : account
        )
      )

      toast({
        title: "Status atualizado com sucesso!",
      })
    } catch (error) {
      console.error('Error updating account payable status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive"
      })
    }
  }

  const updateAccountReceivableStatus = async (id: string, status: AccountReceivable['status']) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({ status })
        .eq('id', parseInt(id))
        .eq('user_id', user?.id)

      if (error) throw error

      setAccountsReceivable(prev => 
        prev.map(account => 
          account.id === id 
            ? { ...account, status, updated_at: new Date().toISOString() } 
            : account
        )
      )

      toast({
        title: "Status atualizado com sucesso!",
      })
    } catch (error) {
      console.error('Error updating account receivable status:', error)
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive"
      })
    }
  }

  const addCategory = async (name: string, type: 'entrada' | 'saida') => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          type
        })
        .select()
        .single()

      if (error) throw error

      const newCategory: Category = {
        id: data.id.toString(),
        user_id: data.user_id,
        name: data.name,
        type: data.type as 'entrada' | 'saida',
        profile_type: user.profile_type,
        created_at: new Date().toISOString()
      }

      setCategories(prev => [...prev, newCategory])

      toast({
        title: "Categoria adicionada com sucesso!",
      })
      return newCategory
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: "Erro ao adicionar categoria",
        description: "Ocorreu um erro ao salvar a categoria",
        variant: "destructive"
      })
    }
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