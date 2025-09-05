import { useState, useEffect } from 'react'
import { supabase, Transaction, AccountPayable, AccountReceivable, Category } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

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
      await Promise.all([
        fetchTransactions(),
        fetchAccountsPayable(),
        fetchAccountsReceivable(),
        fetchCategories(),
      ])
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

  const fetchTransactions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          id,
          name,
          type
        )
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      setTransactions(data || [])
    }
  }

  const fetchAccountsPayable = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('accounts_payable')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching accounts payable:', error)
    } else {
      setAccountsPayable(data || [])
    }
  }

  const fetchAccountsReceivable = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('accounts_receivable')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching accounts receivable:', error)
    } else {
      setAccountsReceivable(data || [])
    }
  }

  const fetchCategories = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      setCategories(data || [])
    }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao adicionar transação",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } else {
      setTransactions(prev => [data, ...prev])
      toast({
        title: "Transação adicionada com sucesso!",
      })
      return data
    }
  }

  const addAccountPayable = async (account: Omit<AccountPayable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('accounts_payable')
      .insert({
        ...account,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao adicionar conta a pagar",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } else {
      setAccountsPayable(prev => [...prev, data])
      toast({
        title: "Conta a pagar adicionada com sucesso!",
      })
      return data
    }
  }

  const addAccountReceivable = async (account: Omit<AccountReceivable, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('accounts_receivable')
      .insert({
        ...account,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao adicionar conta a receber",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } else {
      setAccountsReceivable(prev => [...prev, data])
      toast({
        title: "Conta a receber adicionada com sucesso!",
      })
      return data
    }
  }

  const updateAccountPayableStatus = async (id: string, status: AccountPayable['status']) => {
    const { error } = await supabase
      .from('accounts_payable')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } else {
      setAccountsPayable(prev => 
        prev.map(account => 
          account.id === id ? { ...account, status } : account
        )
      )
      toast({
        title: "Status atualizado com sucesso!",
      })
    }
  }

  const updateAccountReceivableStatus = async (id: string, status: AccountReceivable['status']) => {
    const { error } = await supabase
      .from('accounts_receivable')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } else {
      setAccountsReceivable(prev => 
        prev.map(account => 
          account.id === id ? { ...account, status } : account
        )
      )
      toast({
        title: "Status atualizado com sucesso!",
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
    updateAccountPayableStatus,
    updateAccountReceivableStatus,
    getFinancialSummary,
    refetch: fetchAllData,
  }
}