import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Organization, UserRole as UserRoleType, UserRoleData, ProfileContext } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userRole: UserRoleType | null;
  organizations: Organization[];
  loading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  createOrganization: (name: string, context: ProfileContext, data?: Partial<Organization>) => Promise<Organization>;
  refreshData: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<UserRoleType | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && session) {
      fetchUserOrganizations();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const fetchUserOrganizations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch user roles and organizations
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          *,
          organizations (*)
        `)
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      const orgs = userRoles?.map(role => role.organizations).filter(Boolean) || [];
      setOrganizations(orgs);

      // Set current organization (first one by default)
      if (orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0]);
        const currentRole = userRoles?.find(role => role.organization_id === orgs[0].id);
        setUserRole(currentRole?.role || 'usuario');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Erro ao carregar organizações",
        description: "Não foi possível carregar suas organizações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name: string, context: ProfileContext, data: Partial<Organization> = {}) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Create organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          context,
          ...data
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: newOrg.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      await refreshData();
      
      toast({
        title: "Organização criada com sucesso!",
        description: `${name} foi criada e você é o administrador.`
      });

      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Erro ao criar organização",
        description: "Não foi possível criar a organização",
        variant: "destructive"
      });
      throw error;
    }
  };

  const refreshData = async () => {
    await fetchUserOrganizations();
  };

  const handleSetCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganization(org);
    if (org) {
      // Find user role for this organization
      // This would need to be implemented based on the user roles data
    }
  };

  const value = {
    currentOrganization,
    userRole,
    organizations,
    loading,
    setCurrentOrganization: handleSetCurrentOrganization,
    createOrganization,
    refreshData
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};