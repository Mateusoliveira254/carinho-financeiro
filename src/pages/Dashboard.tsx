import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import TransactionForm from "@/components/TransactionForm";
import AccountPayableForm from "@/components/AccountPayableForm";
import AccountReceivableForm from "@/components/AccountReceivableForm";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  LogOut,
  Building2,
  User,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  Receipt,
  FileText,
  AlertTriangle,
  Check,
  X,
  Download
} from "lucide-react";

const Dashboard = () => {
  const { user, userProfile, signOut } = useAuth();
  const { 
    transactions, 
    accountsPayable, 
    accountsReceivable, 
    categories, 
    loading,
    updateAccountPayableStatus,
    updateAccountReceivableStatus,
    getFinancialSummary 
  } = useFinanceData();

  const [selectedPeriod, setSelectedPeriod] = useState("mensal");
  const summary = getFinancialSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  const isEmpresa = userProfile?.profile_type === "empresa";

  // Calculate expense distribution for pie chart
  const expenseDistribution = categories
    .filter(cat => cat.type === 'saida')
    .map(category => {
      const categoryExpenses = transactions
        .filter(t => t.type === 'saida' && t.category_id === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        value: categoryExpenses,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
    })
    .filter(item => item.value > 0);

  // Get overdue accounts
  const overdueAccounts = accountsPayable.filter(account => {
    const dueDate = new Date(account.due_date);
    const today = new Date();
    return account.status === 'pendente' && dueDate < today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isEmpresa ? 'bg-gradient-primary' : 'bg-gradient-success'}`}>
                {isEmpresa ? <Building2 className="h-6 w-6 text-primary-foreground" /> : <User className="h-6 w-6 text-success-foreground" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEmpresa ? userProfile?.company_name : userProfile?.full_name}
                </h1>
                <p className="text-muted-foreground">
                  {isEmpresa ? "Dashboard Empresarial" : "Dashboard Pessoal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TransactionForm categories={categories} />
          <AccountPayableForm categories={categories} />
          <AccountReceivableForm />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-success text-success-foreground border-0 shadow-financial">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                🟢 Total Entradas
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {summary.totalIncome.toLocaleString()}</div>
              <p className="text-xs opacity-75 mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground border-0 shadow-financial">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                🔴 Total Saídas
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {summary.totalExpenses.toLocaleString()}</div>
              <p className="text-xs opacity-75 mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-financial">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                ⚖️ Saldo Líquido
              </CardTitle>
              <DollarSign className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {summary.netBalance.toLocaleString()}
              </div>
              <div className="flex items-center text-xs opacity-75 mt-1">
                {summary.netBalance >= 0 ? 
                  <TrendingUp className="h-3 w-3 mr-1" /> : 
                  <TrendingDown className="h-3 w-3 mr-1" />
                }
                {summary.netBalance >= 0 ? 'Positivo' : 'Negativo'}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                📌 Contas Pendentes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pendingPayments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {overdueAccounts.length} vencidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
            <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Distribution */}
              <Card className="shadow-card hover:shadow-elevated transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Distribuição de Gastos
                  </CardTitle>
                  <CardDescription>
                    Gastos por categoria este mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {expenseDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expenseDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Nenhuma despesa registrada
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transações Recentes
                  </CardTitle>
                  <CardDescription>
                    Últimas movimentações financeiras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => {
                      const category = categories.find(c => c.id === transaction.category_id);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${transaction.type === 'entrada' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                              {transaction.type === 'entrada' ? 
                                <ArrowUpCircle className="h-4 w-4 text-success" /> :
                                <ArrowDownCircle className="h-4 w-4 text-destructive" />
                              }
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.type === 'entrada' ? 'text-success' : 'text-destructive'}`}>
                              {transaction.type === 'entrada' ? '+' : '-'}R$ {Math.abs(transaction.amount).toLocaleString()}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {category?.name}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payable">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contas a Pagar
                </CardTitle>
                <CardDescription>
                  Gerencie suas contas a pagar e despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsPayable.map((account) => {
                      const category = categories.find(c => c.id === account.category_id);
                      const isOverdue = new Date(account.due_date) < new Date() && account.status === 'pendente';
                      
                      return (
                        <TableRow key={account.id} className={isOverdue ? 'bg-destructive/5' : ''}>
                          <TableCell className="font-medium">{account.description}</TableCell>
                          <TableCell>{category?.name}</TableCell>
                          <TableCell>R$ {account.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {new Date(account.due_date).toLocaleDateString('pt-BR')}
                            {isOverdue && <span className="text-destructive ml-2">(Vencido)</span>}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                account.status === 'pago' ? 'default' : 
                                isOverdue ? 'destructive' : 'secondary'
                              }
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {account.status === 'pendente' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateAccountPayableStatus(account.id, 'pago')}
                              >
                                <Check className="h-4 w-4" />
                                Pagar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receivable">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Contas a Receber
                </CardTitle>
                <CardDescription>
                  Gerencie valores a receber de clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsReceivable.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.client_name}</TableCell>
                        <TableCell>{account.description}</TableCell>
                        <TableCell>R$ {account.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(account.due_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={account.status === 'recebido' ? 'default' : 'secondary'}>
                            {account.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {account.status === 'pendente' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateAccountReceivableStatus(account.id, 'recebido')}
                            >
                              <Check className="h-4 w-4" />
                              Receber
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatórios Financeiros
                  </CardTitle>
                  <CardDescription>
                    Visualize e exporte relatórios detalhados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Resumo do Mês</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total de Entradas:</span>
                            <span className="text-success">R$ {summary.totalIncome.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total de Saídas:</span>
                            <span className="text-destructive">R$ {summary.totalExpenses.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Saldo:</span>
                            <span className={summary.netBalance >= 0 ? 'text-success' : 'text-destructive'}>
                              R$ {summary.netBalance.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Contas Pendentes</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Contas a Pagar:</span>
                            <span>{summary.pendingPayments}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>A Receber:</span>
                            <span className="text-success">R$ {summary.pendingReceivables.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-destructive">
                            <span>Vencidas:</span>
                            <span>{overdueAccounts.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;