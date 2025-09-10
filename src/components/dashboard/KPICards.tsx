import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { DashboardKPI } from '@/types';

interface KPICardsProps {
  kpis: DashboardKPI;
  loading?: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, loading = false }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Total de Receitas',
      value: kpis.totalIncome,
      icon: TrendingUp,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total de Despesas',
      value: kpis.totalExpenses,
      icon: TrendingDown,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Saldo',
      value: kpis.balance,
      icon: DollarSign,
      iconColor: kpis.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: kpis.balance >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Contas Vencidas',
      value: kpis.overduePayments,
      icon: AlertTriangle,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      format: 'number'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-1"></div>
              <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.format === 'number' 
                  ? card.value.toString()
                  : formatCurrency(card.value)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Período atual
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};