import { useNavigate } from "react-router-dom";
import { Building2, User, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import financialHero from "@/assets/financial-hero.jpg";

const ProfileSelection = () => {
  const navigate = useNavigate();

  const handleProfileSelect = (profile: "empresa" | "pessoal") => {
    navigate(`/dashboard/${profile}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 bg-black/20" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${financialHero})` }}
        />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <TrendingUp className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Controle Financeiro Inteligente
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto animate-fade-in">
            Gerencie suas finanças com precisão. Escolha seu perfil e comece a transformar 
            sua relação com o dinheiro hoje mesmo.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Relatórios Detalhados</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <PieChart className="h-4 w-4" />
              <span className="text-sm">Gráficos Intuitivos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Selection */}
      <div className="container mx-auto px-4 -mt-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Empresa Profile */}
          <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Perfil Empresa</CardTitle>
              <CardDescription className="text-base">
                Controle financeiro completo para seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Contas a pagar e receber</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Relatórios empresariais detalhados</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Categorias empresariais</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Análise de fluxo de caixa</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">Exportação de relatórios</span>
                </div>
              </div>
              <EnhancedButton 
                variant="financial" 
                className="w-full mt-6"
                onClick={() => handleProfileSelect("empresa")}
              >
                Acessar Dashboard Empresarial
              </EnhancedButton>
            </CardContent>
          </Card>

          {/* Pessoal Profile */}
          <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <User className="h-8 w-8 text-success-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Perfil Pessoal</CardTitle>
              <CardDescription className="text-base">
                Simplicidade para suas finanças pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">Interface simplificada</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">Controle de gastos pessoais</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">Orçamento familiar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">Metas de economia</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-sm">Gráficos intuitivos</span>
                </div>
              </div>
              <EnhancedButton 
                variant="success" 
                className="w-full mt-6"
                onClick={() => handleProfileSelect("pessoal")}
              >
                Acessar Dashboard Pessoal
              </EnhancedButton>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">Recursos Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Relatórios Mensais</h3>
              <p className="text-muted-foreground text-sm">
                Acompanhe sua evolução financeira com relatórios detalhados mensais
              </p>
            </div>
            <div className="text-center group">
              <div className="mx-auto w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                <PieChart className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Gráficos Visuais</h3>
              <p className="text-muted-foreground text-sm">
                Visualize seus gastos por categoria com gráficos intuitivos
              </p>
            </div>
            <div className="text-center group">
              <div className="mx-auto w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Alertas e Limites</h3>
              <p className="text-muted-foreground text-sm">
                Receba alertas quando se aproximar dos seus limites de gastos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelection;