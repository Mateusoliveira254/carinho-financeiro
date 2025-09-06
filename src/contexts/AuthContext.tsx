import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

// Frontend-only user types for now (will be replaced with Supabase later)
export type Profile = 'empresa' | 'pessoal'

export interface User {
  id: string
  username: string
  profile_type: Profile
  name: string
}

interface AuthContextType {
  user: User | null
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
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string) => {
    setLoading(true)
    try {
      // Simulate API delay
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
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setUser(null)
      localStorage.removeItem('currentUser')
      
      toast({
        title: "Logout realizado com sucesso!",
      })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
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