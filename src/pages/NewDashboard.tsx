import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useFinanceSystemData } from '@/hooks/useFinanceSystemData';
import { ContextSelector } from '@/components/dashboard/ContextSelector';
import { KPICards } from '@/components/dashboard/KPICards';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { Plus, DollarSign, TrendingUp, Users, Target } from 'lucide-react';

const NewDashboard = () => {
  const { user, signOut } = useAuth();
  const { currentOrganization, userRole } = useOrganization();
  const { 
    transactions, 
    categories, 
    accounts, 
    goals, 
    members, 
    loading,
    getDashboardKPIs,
    getChartData 
  } = useFinanceSystemData();

  const kpis = getDashboardKPIs();
  const chartData = getChartData();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando sistema financeiro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">FinanceControl</h1>
                <p className="text-sm text-muted-foreground">
                  Sistema Financeiro Completo
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.profile_type}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Context Selector */}
          <ContextSelector />

          {/* KPI Cards */}
          <KPICards kpis={kpis} loading={loading} />

          {/* Main Content Tabs */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="accounts">Contas</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="goals">Metas</TabsTrigger>
              {currentOrganization?.context === 'igreja' && (
                <TabsTrigger value="members">Membros</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FinancialChart 
                  data={chartData}
                  type="bar"
                  title="Receitas vs Despesas (Últimos 6 meses)"
                  loading={loading}
                />
                <FinancialChart 
                  data={chartData}
                  type="line"
                  title="Evolução do Saldo"
                  loading={loading}
                />
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Transações Recentes</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${transaction.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                              <TrendingUp className={`h-4 w-4 ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'entrada' ? '+' : '-'}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(Number(transaction.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Em desenvolvimento - Formulário para adicionar e gerenciar transações
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts">
              <Card>
                <CardHeader>
                  <CardTitle>Contas Financeiras</CardTitle>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Nenhuma conta cadastrada</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Conta
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {accounts.map((account) => (
                        <Card key={account.id}>
                          <CardContent className="p-4">
                            <h4 className="font-medium">{account.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                            <p className="text-lg font-bold mt-2">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(Number(account.current_balance))}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Nenhuma categoria cadastrada</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Categoria
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categories.map((category) => (
                        <Card key={category.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{category.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                category.type === 'entrada' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {category.type === 'entrada' ? 'Receita' : 'Despesa'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals">
              <Card>
                <CardHeader>
                  <CardTitle>Metas Financeiras</CardTitle>
                </CardHeader>
                <CardContent>
                  {goals.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Nenhuma meta cadastrada</p>
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Criar Meta
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {goals.map((goal) => (
                        <Card key={goal.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{goal.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                goal.is_completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {goal.is_completed ? 'Concluída' : 'Em andamento'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(Number(goal.current_amount))} / {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(Number(goal.target_amount))}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {currentOrganization?.context === 'igreja' && (
              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Membros da Igreja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {members.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Nenhum membro cadastrado</p>
                        <Button>
                          <Users className="h-4 w-4 mr-2" />
                          Cadastrar Membro
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {members.map((member) => (
                          <Card key={member.id}>
                            <CardContent className="p-4">
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              <p className="text-sm text-muted-foreground">{member.phone}</p>
                              <span className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
                                member.status === 'ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.status}
                              </span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;