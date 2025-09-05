import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, UserProfile, Profile } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profileType: Profile, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      } else {
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive"
        })
        throw error
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, profileType: Profile, name: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message,
          variant: "destructive"
        })
        throw error
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email,
            profile_type: profileType,
            [profileType === 'empresa' ? 'company_name' : 'full_name']: name,
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        // Create default categories
        await createDefaultCategories(data.user.id, profileType)
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createDefaultCategories = async (userId: string, profileType: Profile) => {
    const categories = profileType === 'empresa' 
      ? [
          { name: 'Impostos', type: 'saida' },
          { name: 'Aluguel', type: 'saida' },
          { name: 'Fornecedores', type: 'saida' },
          { name: 'Energia', type: 'saida' },
          { name: 'Vendas', type: 'entrada' },
          { name: 'Clientes', type: 'entrada' },
        ]
      : [
          { name: 'Alimentação', type: 'saida' },
          { name: 'Saúde', type: 'saida' },
          { name: 'Lazer', type: 'saida' },
          { name: 'Transporte', type: 'saida' },
          { name: 'Salário', type: 'entrada' },
        ]

    const { error } = await supabase
      .from('categories')
      .insert(
        categories.map(cat => ({
          user_id: userId,
          name: cat.name,
          type: cat.type,
          profile_type: profileType,
        }))
      )

    if (error) {
      console.error('Error creating default categories:', error)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive"
        })
        throw error
      }
      toast({
        title: "Logout realizado com sucesso!",
      })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setUserProfile(prev => prev ? { ...prev, ...updates } : null)
      
      toast({
        title: "Perfil atualizado com sucesso!",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      })
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}