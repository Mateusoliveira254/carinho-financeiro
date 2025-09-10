export type ProfileContext = 'empresa' | 'igreja' | 'pessoal';
export type UserRole = 'admin' | 'gerente' | 'usuario';
export type AccountType = 'caixa' | 'banco' | 'cartao' | 'pix';
export type PaymentMethod = 'dinheiro' | 'cartao' | 'pix' | 'transferencia';
export type RecurrenceType = 'unico' | 'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'anual';

export interface Organization {
  id: string;
  name: string;
  context: ProfileContext;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  organization_id?: string;
  role: UserRole;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  organization_id?: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: string;
  organization_id?: string;
  name: string;
  type: 'entrada' | 'saida';
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  organization_id?: string;
  account_id?: string;
  category_id: number;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  payment_method?: PaymentMethod;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string;
  parent_transaction_id?: string;
  attachments?: string[];
  transaction_date: string;
  created_at?: string;
}

export interface Member {
  id: string;
  organization_id: string;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  status: string;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  organization_id?: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category_id?: number;
  is_completed: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardKPI {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingPayments: number;
  overduePayments: number;
  pendingReceivables: number;
}

export interface ChartData {
  name: string;
  entrada: number;
  saida: number;
  saldo: number;
}