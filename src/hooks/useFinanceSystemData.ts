import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Transaction, 
  Category, 
  Account, 
  FinancialGoal, 
  Member,
  DashboardKPI,
  ChartData,
  PaymentMethod,
  RecurrenceType 
} from '@/types';

export const useFinanceSystemData = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, currentOrganization]);

  const fetchAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchCategories(),
        fetchAccounts(),
        fetchGoals(),
        fetchMembers()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar todos os dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    const query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user!.id);

    if (currentOrganization) {
      query.eq('organization_id', currentOrganization.id);
    } else {
      query.is('organization_id', null);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw error;
    setTransactions((data || []) as Transaction[]);
  };

  const fetchCategories = async () => {
    const query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id);

    if (currentOrganization) {
      query.eq('organization_id', currentOrganization.id);
    } else {
      query.is('organization_id', null);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    setCategories((data || []) as Category[]);
  };

  const fetchAccounts = async () => {
    const query = supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user!.id);

    if (currentOrganization) {
      query.eq('organization_id', currentOrganization.id);
    } else {
      query.is('organization_id', null);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    setAccounts((data || []) as Account[]);
  };

  const fetchGoals = async () => {
    const query = supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user!.id);

    if (currentOrganization) {
      query.eq('organization_id', currentOrganization.id);
    } else {
      query.is('organization_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    setGoals((data || []) as FinancialGoal[]);
  };

  const fetchMembers = async () => {
    if (!currentOrganization || currentOrganization.context !== 'igreja') {
      setMembers([]);
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('organization_id', currentOrganization.id)
      .order('name');

    if (error) throw error;
    setMembers((data || []) as Member[]);
  };

  // Data manipulation functions
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        transaction_date: transaction.transaction_date,
        user_id: user!.id
      })
      .select()
      .single();

    if (error) throw error;

    setTransactions(prev => [data as Transaction, ...prev]);
    toast({
      title: "Transação adicionada",
      description: "Transação foi criada com sucesso"
    });

    return data;
  };

  const addCategory = async (name: string, type: 'entrada' | 'saida', icon?: string, color?: string) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name,
        type,
        user_id: user!.id
      })
      .select()
      .single();

    if (error) throw error;

    setCategories(prev => [...prev, data as Category]);
    toast({
      title: "Categoria criada",
      description: "Nova categoria foi adicionada"
    });

    return data;
  };

  const addAccount = async (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'current_balance'>) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        ...account,
        user_id: user!.id,
        organization_id: currentOrganization?.id || null,
        current_balance: account.initial_balance
      })
      .select()
      .single();

    if (error) throw error;

    setAccounts(prev => [...prev, data]);
    toast({
      title: "Conta criada",
      description: "Nova conta foi adicionada"
    });

    return data;
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        title: goal.title,
        description: goal.description,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount || 0,
        target_date: goal.target_date,
        category_id: goal.category_id,
        is_completed: goal.is_completed || false,
        user_id: user!.id,
        organization_id: currentOrganization?.id || null
      })
      .select()
      .single();

    if (error) throw error;

    setGoals(prev => [data as FinancialGoal, ...prev]);
    toast({
      title: "Meta criada",
      description: "Nova meta financeira foi adicionada"
    });

    return data;
  };

  const addMember = async (member: Omit<Member, 'id' | 'created_at'>) => {
    if (!currentOrganization) throw new Error('Organização necessária para adicionar membro');

    const { data, error } = await supabase
      .from('members')
      .insert({
        ...member,
        organization_id: currentOrganization.id
      })
      .select()
      .single();

    if (error) throw error;

    setMembers(prev => [...prev, data]);
    toast({
      title: "Membro adicionado",
      description: "Novo membro foi cadastrado"
    });

    return data;
  };

  // Calculate KPIs
  const getDashboardKPIs = (): DashboardKPI => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      balance,
      pendingPayments: 0, // TODO: Implement based on accounts_payable
      overduePayments: 0, // TODO: Implement based on accounts_payable
      pendingReceivables: 0 // TODO: Implement based on accounts_receivable
    };
  };

  // Generate chart data
  const getChartData = (): ChartData[] => {
    const monthsData: { [key: string]: { entrada: number; saida: number } } = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = { entrada: 0, saida: 0 };
      }

      if (transaction.type === 'entrada') {
        monthsData[monthKey].entrada += Number(transaction.amount);
      } else {
        monthsData[monthKey].saida += Number(transaction.amount);
      }
    });

    return Object.entries(monthsData)
      .map(([month, data]) => ({
        name: month,
        entrada: data.entrada,
        saida: data.saida,
        saldo: data.entrada - data.saida
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-6); // Last 6 months
  };

  return {
    // Data
    transactions,
    categories,
    accounts,
    goals,
    members,
    loading,

    // Functions
    addTransaction,
    addCategory,
    addAccount,
    addGoal,
    addMember,
    fetchAllData,

    // Computed data
    getDashboardKPIs,
    getChartData
  };
};