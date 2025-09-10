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

-- Financial goals table (without category_id foreign key for now)
CREATE TABLE public.financial_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category_id BIGINT,
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

-- Enable RLS on all new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations
FOR SELECT USING (
  id IN (
    SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage organizations" ON public.organizations
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE organization_id = id AND role = 'admin'
  )
);

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

CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notifications" ON public.notifications
FOR ALL USING (user_id = auth.uid());