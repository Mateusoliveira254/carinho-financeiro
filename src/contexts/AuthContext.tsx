import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import type { Session } from '@supabase/supabase-js'

export type Profile = 'empresa' | 'pessoal'

export interface User {
  id: string
  username: string
  profile_type: Profile
  name: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Hardcoded users for frontend-only authentication
const PREDEFINED_USERS: User[] = [
  {
    id: '1',
    username: 'Inova',
    profile_type: 'empresa',
    name: 'Inova Empresa Ltda'
  },
  {
    id: '2',
    username: 'Mateus',
    profile_type: 'pessoal',
    name: 'Mateus Silva'
  }
]

const PREDEFINED_PASSWORDS = {
  'Inova': 'inova123',
  'Mateus': '123'
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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        
        if (session?.user) {
          // Map Supabase user to our User interface
          handleSupabaseUser(session.user).finally(() => {
            setLoading(false)
          })
        } else {
          setUser(null)
          localStorage.removeItem('currentUser')
          setLoading(false)
        }
      }
    )

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        handleSupabaseUser(session.user).finally(() => {
          setLoading(false)
        })
      } else {
        // Check if user is already logged in (localStorage - for demo accounts)
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser))
          } catch (error) {
            localStorage.removeItem('currentUser')
          }
        }
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSupabaseUser = async (supabaseUser: any) => {
    try {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      let userProfile = profile
      
      // If no profile exists, create a default one
      if (!profile) {
        const { data: newProfile, error } = await supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            profile_type: 'pessoal',
            full_name: supabaseUser.email
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating user profile:', error)
          return
        }
        userProfile = newProfile
      }

      // Map to our User interface
      const mappedUser: User = {
        id: supabaseUser.id,
        username: supabaseUser.email,
        profile_type: userProfile.profile_type as Profile,
        name: userProfile.company_name || userProfile.full_name || supabaseUser.email
      }

      setUser(mappedUser)
      localStorage.setItem('currentUser', JSON.stringify(mappedUser))
    } catch (error) {
      console.error('Error handling Supabase user:', error)
    }
  }

  const signIn = async (username: string, password: string) => {
    setLoading(true)
    try {
      // Check if it's an email (Supabase login)
      if (username.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
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
          description: `Bem-vindo!`,
        })
      } else {
        // Local demo accounts
        await new Promise(resolve => setTimeout(resolve, 500))

        const foundUser = PREDEFINED_USERS.find(u => u.username === username)
        const correctPassword = PREDEFINED_PASSWORDS[username as keyof typeof PREDEFINED_PASSWORDS]

        if (!foundUser || password !== correctPassword) {
          toast({
            title: "Erro ao fazer login",
            description: "Usuário ou senha inválidos",
            variant: "destructive"
          })
          throw new Error('Invalid credentials')
        }

        setUser(foundUser)
        localStorage.setItem('currentUser', JSON.stringify(foundUser))

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${foundUser.name}`,
        })
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // If we have a Supabase session, sign out from Supabase
      if (session) {
        await supabase.auth.signOut()
        // Don't manually clear state here - let onAuthStateChange handle it
      } else {
        // Local logout for demo accounts
        await new Promise(resolve => setTimeout(resolve, 300))
        setUser(null)
        setSession(null)
        localStorage.removeItem('currentUser')
      }
      
      toast({
        title: "Logout realizado com sucesso!",
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}