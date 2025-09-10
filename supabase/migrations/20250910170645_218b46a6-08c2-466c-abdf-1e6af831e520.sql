-- Create enum types
CREATE TYPE public.profile_context AS ENUM ('empresa', 'igreja', 'pessoal');
CREATE TYPE public.user_role AS ENUM ('admin', 'gerente', 'usuario');
CREATE TYPE public.account_type AS ENUM ('caixa', 'banco', 'cartao', 'pix');
CREATE TYPE public.payment_method AS ENUM ('dinheiro', 'cartao', 'pix', 'transferencia');
CREATE TYPE public.recurrence_type AS ENUM ('unico', 'diario', 'semanal', 'quinzenal', 'mensal', 'anual');

-- Organizations table (for empresas and igrejas)
CREATE TABLE public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  context profile_context NOT NULL,
  cnpj TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role user_role DEFAULT 'usuario' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Accounts table (contas financeiras)
CREATE TABLE public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  initial_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update categories table
ALTER TABLE public.categories 
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN icon TEXT,
  ADD COLUMN color TEXT;

-- Update transactions table
ALTER TABLE public.transactions 
  ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  ADD COLUMN payment_method payment_method DEFAULT 'dinheiro',
  ADD COLUMN recurrence_type recurrence_type DEFAULT 'unico',
  ADD COLUMN recurrence_end_date DATE,
  ADD COLUMN parent_transaction_id UUID REFERENCES public.transactions(id),
  ADD COLUMN attachments TEXT[];

-- Members table (for igrejas)
CREATE TABLE public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  birth_date DATE,
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial goals table
CREATE TABLE public.financial_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category_id UUID REFERENCES public.categories(id),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update user_profiles table
ALTER TABLE public.user_profiles 
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN preferred_language TEXT DEFAULT 'pt-BR',
  ADD COLUMN theme TEXT DEFAULT 'light',
  ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE,
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  ) OR auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE organization_id = id AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage organizations" ON public.organizations
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE organization_id = id AND role = 'admin'
  )
);

-- User roles policies
CREATE POLICY "Users can view roles in their organizations" ON public.user_roles
FOR SELECT USING (
  user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Accounts policies
CREATE POLICY "Users can view accounts in their context" ON public.accounts
FOR SELECT USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage accounts with proper permissions" ON public.accounts
FOR ALL USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
);

-- Members policies
CREATE POLICY "Users can view members in their organizations" ON public.members
FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins and managers can manage members" ON public.members
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
);

-- Financial goals policies
CREATE POLICY "Users can view their own goals" ON public.financial_goals
FOR SELECT USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own goals" ON public.financial_goals
FOR ALL USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notifications" ON public.notifications
FOR ALL USING (user_id = auth.uid());

-- Update existing policies for categories and transactions
DROP POLICY IF EXISTS "Usuários podem ver e gerenciar suas próprias categorias." ON public.categories;
CREATE POLICY "Users can view categories in their context" ON public.categories
FOR SELECT USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage categories with proper permissions" ON public.categories
FOR ALL USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
);

DROP POLICY IF EXISTS "Usuários podem ver e gerenciar suas próprias transações." ON public.transactions;
CREATE POLICY "Users can view transactions in their context" ON public.transactions
FOR SELECT USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage transactions with proper permissions" ON public.transactions
FOR ALL USING (
  user_id = auth.uid() OR 
  organization_id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'gerente')
  )
);

-- Functions for automatic balance updates
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'entrada' THEN
      UPDATE public.accounts 
      SET current_balance = current_balance + NEW.amount 
      WHERE id = NEW.account_id;
    ELSE
      UPDATE public.accounts 
      SET current_balance = current_balance - NEW.amount 
      WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old amount
    IF OLD.type = 'entrada' THEN
      UPDATE public.accounts 
      SET current_balance = current_balance - OLD.amount 
      WHERE id = OLD.account_id;
    ELSE
      UPDATE public.accounts 
      SET current_balance = current_balance + OLD.amount 
      WHERE id = OLD.account_id;
    END IF;
    
    -- Add new amount
    IF NEW.type = 'entrada' THEN
      UPDATE public.accounts 
      SET current_balance = current_balance + NEW.amount 
      WHERE id = NEW.account_id;
    ELSE
      UPDATE public.accounts 
      SET current_balance = current_balance - NEW.amount 
      WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove amount
    IF OLD.type = 'entrada' THEN
      UPDATE public.accounts 
      SET current_balance = current_balance - OLD.amount 
      WHERE id = OLD.account_id;
    ELSE
      UPDATE public.accounts 
      SET current_balance = current_balance + OLD.amount 
      WHERE id = OLD.account_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic balance updates
CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();