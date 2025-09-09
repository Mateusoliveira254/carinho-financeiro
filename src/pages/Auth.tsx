import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { Building2, User, LogIn } from 'lucide-react'

const Auth = () => {
  const { signIn, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(username, password)
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FinanceControl
          </h1>
          <p className="text-muted-foreground mt-2">
            Seu controle financeiro completo
          </p>
        </div>

        <Card className="shadow-financial">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Entrar na sua conta
            </CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário ou e-mail</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário ou e-mail"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Demo accounts info */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3 text-sm">Contas de demonstração:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-background rounded border">
                  <Building2 className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Empresa</p>
                    <p className="text-xs text-muted-foreground">Usuário: Inova | Senha: inova123</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background rounded border">
                  <User className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Pessoal</p>
                    <p className="text-xs text-muted-foreground">Usuário: Mateus | Senha: 123</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth