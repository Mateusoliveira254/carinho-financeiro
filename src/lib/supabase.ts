import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database
export type Profile = 'empresa' | 'pessoal'

export interface UserProfile {
  id: string
  email: string
  profile_type: Profile
  company_name?: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'entrada' | 'saida'
  profile_type: Profile
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