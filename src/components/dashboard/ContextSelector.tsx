import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Church, User, Plus, Settings } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { ProfileContext } from '@/types';

const contextIcons = {
  empresa: Building2,
  igreja: Church,
  pessoal: User
};

const contextLabels = {
  empresa: 'Empresa',
  igreja: 'Igreja',
  pessoal: 'Pessoal'
};

export const ContextSelector = () => {
  const { currentOrganization, organizations, setCurrentOrganization, createOrganization, userRole } = useOrganization();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgContext, setNewOrgContext] = useState<ProfileContext>('pessoal');
  const [loading, setLoading] = useState(false);

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;

    setLoading(true);
    try {
      await createOrganization(newOrgName, newOrgContext);
      setNewOrgName('');
      setNewOrgContext('pessoal');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show personal context if no organization
  if (!currentOrganization) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contexto Atual</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Organização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Organização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Organização</Label>
                  <Input
                    id="name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Digite o nome..."
                  />
                </div>
                <div>
                  <Label htmlFor="context">Tipo</Label>
                  <Select value={newOrgContext} onValueChange={(value: ProfileContext) => setNewOrgContext(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="igreja">Igreja</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateOrganization} disabled={loading} className="w-full">
                  {loading ? 'Criando...' : 'Criar Organização'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Pessoal</p>
              <p className="text-sm text-muted-foreground">Controle financeiro individual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const Icon = contextIcons[currentOrganization.context];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Contexto Atual</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {userRole}
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Organização</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Organização</Label>
                  <Input
                    id="name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Digite o nome..."
                  />
                </div>
                <div>
                  <Label htmlFor="context">Tipo</Label>
                  <Select value={newOrgContext} onValueChange={(value: ProfileContext) => setNewOrgContext(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empresa">Empresa</SelectItem>
                      <SelectItem value="igreja">Igreja</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateOrganization} disabled={loading} className="w-full">
                  {loading ? 'Criando...' : 'Criar Organização'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">{currentOrganization.name}</p>
            <p className="text-sm text-muted-foreground">
              {contextLabels[currentOrganization.context]}
            </p>
          </div>
        </div>
        
        {organizations.length > 1 && (
          <div className="mt-4">
            <Label className="text-xs text-muted-foreground">Alternar Contexto</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {organizations.map((org) => {
                const OrgIcon = contextIcons[org.context];
                return (
                  <Button
                    key={org.id}
                    variant={org.id === currentOrganization.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentOrganization(org)}
                    className="flex items-center space-x-1"
                  >
                    <OrgIcon className="h-3 w-3" />
                    <span className="text-xs">{org.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};