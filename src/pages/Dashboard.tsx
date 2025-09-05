import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PlusCircle,
  Building2,
  User,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";

// Mock data
const expenseCategories = [
  { name: "Alimentação", value: 1200, color: "#0088FE" },
  { name: "Transporte", value: 800, color: "#00C49F" },
  { name: "Saúde", value: 600, color: "#FFBB28" },
  { name: "Lazer", value: 400, color: "#FF8042" },
  { name: "Outros", value: 300, color: "#8884D8" }
];

const monthlyData = [
  { mes: "Jan", receitas: 5000, despesas: 3200 },
  { mes: "Fev", receitas: 5200, despesas: 3400 },
  { mes: "Mar", receitas: 4800, despesas: 3100 },
  { mes: "Abr", receitas: 5300, despesas: 3300 },
  { mes: "Mai", receitas: 5100, despesas: 3600 },
  { mes: "Jun", receitas: 5400, despesas: 3250 }
];

const Dashboard = () => {
  const { profile } = useParams<{ profile: "empresa" | "pessoal" }>();
  const [selectedPeriod, setSelectedPeriod] = useState("mensal");

  const isEmpresa = profile === "empresa";

  const totalReceitas = 5400;
  const totalDespesas = 3250;
  const saldoAtual = totalReceitas - totalDespesas;
  const variacaoMes = 12.5;

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
                  Dashboard {isEmpresa ? "Empresarial" : "Pessoal"}
                </h1>
                <p className="text-muted-foreground">
                  {isEmpresa ? "Controle completo das finanças da empresa" : "Suas finanças pessoais simplificadas"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton variant="outline" size="sm">
                <Calendar className="h-4 w-4" />
                {selectedPeriod === "mensal" ? "Mensal" : "Anual"}
              </EnhancedButton>
              <EnhancedButton variant={isEmpresa ? "financial" : "success"}>
                <PlusCircle className="h-4 w-4" />
                Nova Transação
              </EnhancedButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-success text-success-foreground border-0 shadow-financial">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Total de Receitas
              </CardTitle>
              <ArrowUpCircle className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalReceitas.toLocaleString()}</div>
              <p className="text-xs opacity-75 mt-1">
                +8.2% desde o mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground border-0 shadow-financial">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Total de Despesas
              </CardTitle>
              <ArrowDownCircle className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalDespesas.toLocaleString()}</div>
              <p className="text-xs opacity-75 mt-1">
                -2.1% desde o mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-primary text-primary-foreground border-0 shadow-financial">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                Saldo Atual
              </CardTitle>
              <DollarSign className="h-4 w-4 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {saldoAtual.toLocaleString()}</div>
              <div className="flex items-center text-xs opacity-75 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{variacaoMes}% este mês
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Economia
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2.150</div>
              <p className="text-xs text-muted-foreground mt-1">
                Meta: R$ 3.000/mês
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-success h-2 rounded-full transition-all duration-300" 
                  style={{ width: '71.6%' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Distribution */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Distribuição de Gastos por Categoria
              </CardTitle>
              <CardDescription>
                Visualização dos gastos do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Comparison */}
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Receitas vs Despesas (6 meses)
              </CardTitle>
              <CardDescription>
                Comparação mensal de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                  <Legend />
                  <Bar dataKey="receitas" fill="#00C49F" name="Receitas" />
                  <Bar dataKey="despesas" fill="#FF8042" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Suas últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { desc: "Pagamento de Salário", valor: 5000, tipo: "receita", categoria: "Salário", data: "2024-06-15" },
                { desc: "Supermercado Extra", valor: -320, tipo: "despesa", categoria: "Alimentação", data: "2024-06-14" },
                { desc: "Consulta Médica", valor: -150, tipo: "despesa", categoria: "Saúde", data: "2024-06-13" },
                { desc: "Uber", valor: -45, tipo: "despesa", categoria: "Transporte", data: "2024-06-12" }
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.tipo === 'receita' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      {transaction.tipo === 'receita' ? 
                        <ArrowUpCircle className="h-4 w-4 text-success" /> :
                        <ArrowDownCircle className="h-4 w-4 text-destructive" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.desc}</p>
                      <p className="text-sm text-muted-foreground">{transaction.data}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.tipo === 'receita' ? 'text-success' : 'text-destructive'}`}>
                      {transaction.tipo === 'receita' ? '+' : ''}R$ {Math.abs(transaction.valor).toLocaleString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.categoria}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;