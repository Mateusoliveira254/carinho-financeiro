import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from '@/types';

interface FinancialChartProps {
  data: ChartData[];
  type?: 'bar' | 'line' | 'pie';
  title: string;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FinancialChart: React.FC<FinancialChartProps> = ({ 
  data, 
  type = 'bar', 
  title,
  loading = false 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-pulse">Carregando gráfico...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entrada" 
                stroke="#00C49F" 
                strokeWidth={2}
                name="Entradas"
              />
              <Line 
                type="monotone" 
                dataKey="saida" 
                stroke="#FF8042" 
                strokeWidth={2}
                name="Saídas"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#0088FE" 
                strokeWidth={2}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        const pieData = data.map((item, index) => ({
          name: item.name,
          value: item.entrada + item.saida,
          fill: COLORS[index % COLORS.length]
        }));
        
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="entrada" fill="#00C49F" name="Entradas" />
              <Bar dataKey="saida" fill="#FF8042" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para exibir
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};