import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, CreditCard } from "lucide-react";
import { AccountPayable } from "@/hooks/useFinanceData";

interface AccountPaymentChartProps {
  accountsPayable: AccountPayable[];
  categories: Array<{ id: string; name: string; type: 'entrada' | 'saida' }>;
}

const AccountPaymentChart = ({ accountsPayable, categories }: AccountPaymentChartProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  // Get unique accounts for selection
  const uniqueAccounts = accountsPayable.reduce((acc, account) => {
    if (!acc.find(item => item.description === account.description)) {
      acc.push({
        id: account.id,
        description: account.description,
        category_id: account.category_id
      });
    }
    return acc;
  }, [] as Array<{id: string, description: string, category_id: string}>);

  // Generate monthly data for the selected account
  const generateMonthlyData = () => {
    if (!selectedAccount) return [];

    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      // Find payments for this account in this month
      const accountPayments = accountsPayable.filter(account => {
        const dueDate = new Date(account.due_date);
        return account.description === selectedAccount &&
               dueDate.getMonth() === index &&
               dueDate.getFullYear() === currentYear;
      });

      const paidAmount = accountPayments
        .filter(payment => payment.status === 'pago')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const pendingAmount = accountPayments
        .filter(payment => payment.status === 'pendente')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const overdueAmount = accountPayments
        .filter(payment => {
          const dueDate = new Date(payment.due_date);
          const today = new Date();
          return payment.status === 'pendente' && dueDate < today;
        })
        .reduce((sum, payment) => sum + payment.amount, 0);

      return {
        mes: month,
        pago: paidAmount,
        pendente: pendingAmount,
        vencido: overdueAmount,
        isPastMonth: index < currentMonth,
        isFutureMonth: index > currentMonth
      };
    });
  };

  const chartData = generateMonthlyData();
  const selectedAccountData = uniqueAccounts.find(acc => acc.description === selectedAccount);
  const categoryName = selectedAccountData ? 
    categories.find(cat => cat.id === selectedAccountData.category_id)?.name : '';

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Análise de Conta Específica
        </CardTitle>
        <CardDescription>
          Visualize pagamentos por mês como um cartão de crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Account Selection */}
          <div className="flex items-center gap-2">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma conta para analisar" />
              </SelectTrigger>
              <SelectContent>
                {uniqueAccounts.map((account) => {
                  const category = categories.find(cat => cat.id === account.category_id);
                  return (
                    <SelectItem key={account.id} value={account.description}>
                      {account.description} ({category?.name})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Chart */}
          {selectedAccount ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Conta: {selectedAccount}</span>
                {categoryName && <span>• Categoria: {categoryName}</span>}
              </div>
              
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `R$ ${Number(value).toLocaleString()}`, 
                      name === 'pago' ? 'Pago' : 
                      name === 'pendente' ? 'Pendente' : 'Vencido'
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    formatter={(value) => 
                      value === 'pago' ? 'Pago' : 
                      value === 'pendente' ? 'Pendente' : 'Vencido'
                    }
                  />
                  <Bar 
                    dataKey="pago" 
                    fill="hsl(var(--success))" 
                    name="pago"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="pendente" 
                    fill="hsl(var(--warning))" 
                    name="pendente"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="vencido" 
                    fill="hsl(var(--destructive))" 
                    name="vencido"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Total Pago</div>
                  <div className="text-lg font-bold text-success">
                    R$ {chartData.reduce((sum, item) => sum + item.pago, 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Pendente</div>
                  <div className="text-lg font-bold text-warning">
                    R$ {chartData.reduce((sum, item) => sum + item.pendente, 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Vencido</div>
                  <div className="text-lg font-bold text-destructive">
                    R$ {chartData.reduce((sum, item) => sum + item.vencido, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Selecione uma conta para visualizar a análise mensal</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountPaymentChart;