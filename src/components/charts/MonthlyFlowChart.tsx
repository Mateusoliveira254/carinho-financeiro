import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar } from "lucide-react";
import { Transaction } from "@/hooks/useFinanceData";

interface MonthlyFlowChartProps {
  transactions: Transaction[];
}

const MonthlyFlowChart = ({ transactions }: MonthlyFlowChartProps) => {
  // Generate monthly flow data for the current year
  const generateMonthlyFlow = () => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === index &&
               transactionDate.getFullYear() === currentYear;
      });

      const entrada = monthTransactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + t.amount, 0);

      const saida = monthTransactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + t.amount, 0);

      const saldo = entrada - saida;

      return {
        mes: month,
        entrada,
        saida,
        saldo,
        saldoAcumulado: 0 // Will be calculated below
      };
    });
  };

  const monthlyData = generateMonthlyFlow();
  
  // Calculate accumulated balance
  let accumulated = 0;
  monthlyData.forEach(data => {
    accumulated += data.saldo;
    data.saldoAcumulado = accumulated;
  });

  // Calculate trends
  const currentMonth = new Date().getMonth();
  const currentMonthData = monthlyData[currentMonth];
  const previousMonthData = currentMonth > 0 ? monthlyData[currentMonth - 1] : { saldo: 0 };
  const trend = currentMonthData.saldo - previousMonthData.saldo;

  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Fluxo de Caixa Mensal
        </CardTitle>
        <CardDescription>
          Acompanhe entradas, saídas e saldo acumulado ao longo do ano
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Month Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Entradas Mês</div>
              <div className="text-lg font-bold text-success">
                R$ {currentMonthData.entrada.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Saídas Mês</div>
              <div className="text-lg font-bold text-destructive">
                R$ {currentMonthData.saida.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Saldo Mês</div>
              <div className={`text-lg font-bold ${currentMonthData.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {currentMonthData.saldo.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Trend vs Mês Anterior</div>
              <div className={`text-lg font-bold flex items-center justify-center gap-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {trend >= 0 ? '↗️' : '↘️'}
                R$ {Math.abs(trend).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Monthly Flow Chart */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Fluxo de caixa mensal - {new Date().getFullYear()}</span>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `R$ ${Number(value).toLocaleString()}`, 
                    name === 'entrada' ? 'Entradas' : 
                    name === 'saida' ? 'Saídas' : 
                    name === 'saldo' ? 'Saldo Mensal' : 'Saldo Acumulado'
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
                    value === 'entrada' ? 'Entradas' : 
                    value === 'saida' ? 'Saídas' :
                    value === 'saldoAcumulado' ? 'Saldo Acumulado' : 'Saldo Mensal'
                  }
                />
                <Area
                  type="monotone"
                  dataKey="entrada"
                  stroke="hsl(var(--success))"
                  fillOpacity={1}
                  fill="url(#colorEntrada)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="saida"
                  stroke="hsl(var(--destructive))"
                  fillOpacity={1}
                  fill="url(#colorSaida)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="saldoAcumulado"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Year Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Entradas (Ano)</div>
              <div className="text-lg font-bold text-success">
                R$ {monthlyData.reduce((sum, data) => sum + data.entrada, 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Saídas (Ano)</div>
              <div className="text-lg font-bold text-destructive">
                R$ {monthlyData.reduce((sum, data) => sum + data.saida, 0).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Saldo Acumulado</div>
              <div className={`text-lg font-bold ${accumulated >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {accumulated.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyFlowChart;