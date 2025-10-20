-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'contributor', 'viewer');

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  company_size TEXT CHECK (company_size IN ('small', 'medium', 'large', 'enterprise')),
  industry TEXT,
  revenue_range TEXT,
  headquarters_location TEXT,
  net_zero_target_year INTEGER,
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')) DEFAULT 'starter',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- USER ROLES TABLE (CRITICAL SECURITY - separate from profiles)
-- ============================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- WASTE MATERIALS TABLE
-- ============================================================================
CREATE TABLE public.waste_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  material_type TEXT CHECK (material_type IN ('plastics', 'metals', 'organics', 'chemicals', 'textiles', 'paper')) NOT NULL,
  material_subtype TEXT,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT CHECK (unit IN ('tons', 'kg', 'cubic_meters')) NOT NULL,
  quality_grade TEXT CHECK (quality_grade IN ('A+', 'A', 'B', 'C', 'D', 'F')),
  purity_percentage NUMERIC CHECK (purity_percentage >= 0 AND purity_percentage <= 100),
  location_address TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  price_per_unit NUMERIC CHECK (price_per_unit >= 0),
  description TEXT,
  status TEXT CHECK (status IN ('available', 'pending', 'sold', 'expired')) DEFAULT 'available',
  image_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_waste_materials_user_id ON public.waste_materials(user_id);
CREATE INDEX idx_waste_materials_status ON public.waste_materials(status);
CREATE INDEX idx_waste_materials_material_type ON public.waste_materials(material_type);

ALTER TABLE public.waste_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available materials"
  ON public.waste_materials FOR SELECT
  TO authenticated
  USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Users can insert own materials"
  ON public.waste_materials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials"
  ON public.waste_materials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES public.waste_materials(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  platform_fee NUMERIC DEFAULT 0 CHECK (platform_fee >= 0),
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_transit', 'delivered', 'completed', 'cancelled')) DEFAULT 'pending',
  carbon_credits_generated NUMERIC DEFAULT 0 CHECK (carbon_credits_generated >= 0),
  carbon_credits_value NUMERIC DEFAULT 0 CHECK (carbon_credits_value >= 0),
  logistics_provider TEXT,
  tracking_number TEXT,
  escrow_status TEXT CHECK (escrow_status IN ('pending', 'deposited', 'released', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT buyer_seller_different CHECK (buyer_id != seller_id)
);

CREATE INDEX idx_transactions_seller ON public.transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Buyers can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- ============================================================================
-- CARBON EMISSIONS TABLES
-- ============================================================================
CREATE TABLE public.carbon_emissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  scope_1_total NUMERIC DEFAULT 0 CHECK (scope_1_total >= 0),
  scope_2_total NUMERIC DEFAULT 0 CHECK (scope_2_total >= 0),
  scope_3_total NUMERIC DEFAULT 0 CHECK (scope_3_total >= 0),
  scope_3_breakdown JSONB DEFAULT '{}'::jsonb,
  calculation_method TEXT CHECK (calculation_method IN ('spend_based', 'hybrid', 'activity_based')),
  data_quality_score NUMERIC CHECK (data_quality_score >= 0 AND data_quality_score <= 100),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (reporting_period_end > reporting_period_start)
);

CREATE INDEX idx_carbon_emissions_user_id ON public.carbon_emissions(user_id);
CREATE INDEX idx_carbon_emissions_period ON public.carbon_emissions(reporting_period_start, reporting_period_end);

ALTER TABLE public.carbon_emissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emissions"
  ON public.carbon_emissions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Emission sources table
CREATE TABLE public.emission_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emission_id UUID REFERENCES public.carbon_emissions(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  scope INTEGER CHECK (scope IN (1, 2, 3)) NOT NULL,
  category_name TEXT,
  activity_data NUMERIC,
  activity_unit TEXT,
  emission_factor NUMERIC,
  emission_amount NUMERIC CHECK (emission_amount >= 0),
  data_source TEXT CHECK (data_source IN ('manual', 'erp_integration', 'utility_bill', 'calculated')),
  source_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emission_sources_user_id ON public.emission_sources(user_id);
CREATE INDEX idx_emission_sources_emission_id ON public.emission_sources(emission_id);

ALTER TABLE public.emission_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emission sources"
  ON public.emission_sources FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CARBON OFFSET PROJECTS (public data)
-- ============================================================================
CREATE TABLE public.carbon_offset_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  project_type TEXT CHECK (project_type IN ('reforestation', 'renewable_energy', 'ocean_cleanup', 'direct_air_capture')) NOT NULL,
  location_country TEXT,
  location_region TEXT,
  price_per_ton NUMERIC NOT NULL CHECK (price_per_ton > 0),
  available_credits NUMERIC NOT NULL CHECK (available_credits >= 0),
  certification_type TEXT CHECK (certification_type IN ('gold_standard', 'verra', 'both')),
  satellite_verified BOOLEAN DEFAULT FALSE,
  verification_date DATE,
  project_description TEXT,
  impact_metrics JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  blockchain_registry_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.carbon_offset_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view offset projects"
  ON public.carbon_offset_projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage offset projects"
  ON public.carbon_offset_projects FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Carbon credit purchases
CREATE TABLE public.carbon_credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.carbon_offset_projects(id) ON DELETE RESTRICT NOT NULL,
  quantity_tons NUMERIC NOT NULL CHECK (quantity_tons > 0),
  price_per_ton NUMERIC NOT NULL CHECK (price_per_ton > 0),
  total_cost NUMERIC NOT NULL CHECK (total_cost >= 0),
  platform_commission NUMERIC DEFAULT 0 CHECK (platform_commission >= 0),
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retirement_date TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  blockchain_transaction_id TEXT
);

CREATE INDEX idx_carbon_purchases_user_id ON public.carbon_credit_purchases(user_id);

ALTER TABLE public.carbon_credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON public.carbon_credit_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON public.carbon_credit_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COMPLIANCE TABLES
-- ============================================================================
CREATE TABLE public.compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  framework_name TEXT CHECK (framework_name IN ('CSRD', 'SB253', 'SB261', 'CDP', 'TCFD', 'ISSB', 'GRI', 'SASB')) NOT NULL,
  applicable BOOLEAN DEFAULT TRUE,
  completion_percentage NUMERIC DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'review', 'completed')) DEFAULT 'not_started',
  submission_deadline DATE,
  last_submission_date DATE,
  next_submission_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, framework_name)
);

CREATE INDEX idx_compliance_frameworks_user_id ON public.compliance_frameworks(user_id);

ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own frameworks"
  ON public.compliance_frameworks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Compliance data points
CREATE TABLE public.compliance_data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE NOT NULL,
  requirement_code TEXT NOT NULL,
  requirement_name TEXT,
  requirement_description TEXT,
  data_value JSONB,
  data_source TEXT CHECK (data_source IN ('module_1', 'module_2', 'manual', 'erp_integration')),
  completion_status TEXT CHECK (completion_status IN ('complete', 'incomplete', 'in_progress')) DEFAULT 'incomplete',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_document_urls JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_compliance_data_points_framework_id ON public.compliance_data_points(framework_id);

ALTER TABLE public.compliance_data_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own compliance data"
  ON public.compliance_data_points FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.compliance_frameworks
      WHERE id = framework_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.compliance_frameworks
      WHERE id = framework_id AND user_id = auth.uid()
    )
  );

-- Materiality assessments
CREATE TABLE public.materiality_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_date DATE NOT NULL,
  topics_assessed JSONB DEFAULT '[]'::jsonb,
  financial_materiality_scores JSONB DEFAULT '{}'::jsonb,
  impact_materiality_scores JSONB DEFAULT '{}'::jsonb,
  stakeholder_survey_responses JSONB DEFAULT '{}'::jsonb,
  methodology TEXT,
  status TEXT CHECK (status IN ('draft', 'completed', 'approved')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.materiality_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own assessments"
  ON public.materiality_assessments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Supplier assessments
CREATE TABLE public.supplier_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_email TEXT,
  assessment_status TEXT CHECK (assessment_status IN ('sent', 'in_progress', 'completed')) DEFAULT 'sent',
  emissions_data JSONB DEFAULT '{}'::jsonb,
  esg_score NUMERIC CHECK (esg_score >= 0 AND esg_score <= 100),
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.supplier_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own supplier assessments"
  ON public.supplier_assessments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS & ACTIVITY
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('transaction', 'compliance_deadline', 'emission_alert', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Integrations table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT CHECK (integration_type IN ('sap', 'oracle', 'netsuite', 'workday', 'quickbooks')) NOT NULL,
  connection_status TEXT CHECK (connection_status IN ('connected', 'disconnected', 'error')) DEFAULT 'disconnected',
  api_credentials JSONB,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT CHECK (sync_frequency IN ('daily', 'weekly', 'monthly', 'manual')) DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, integration_type)
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations"
  ON public.integrations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to calculate carbon credits from waste transaction
CREATE OR REPLACE FUNCTION public.calculate_carbon_credits(
  material_type TEXT,
  quantity_tons NUMERIC
)
RETURNS TABLE (
  carbon_tons NUMERIC,
  credit_value NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  landfill_factor NUMERIC;
  recycling_benefit NUMERIC;
  carbon_amount NUMERIC;
BEGIN
  landfill_factor := CASE material_type
    WHEN 'plastics' THEN 2.1
    WHEN 'metals' THEN 1.5
    WHEN 'organics' THEN 0.8
    WHEN 'paper' THEN 1.2
    WHEN 'textiles' THEN 1.9
    WHEN 'chemicals' THEN 2.5
    ELSE 1.0
  END;
  
  recycling_benefit := CASE material_type
    WHEN 'plastics' THEN 1.8
    WHEN 'metals' THEN 2.0
    WHEN 'organics' THEN 0.5
    WHEN 'paper' THEN 1.5
    WHEN 'textiles' THEN 1.4
    WHEN 'chemicals' THEN 1.8
    ELSE 0.8
  END;
  
  carbon_amount := quantity_tons * (landfill_factor + recycling_benefit);
  
  RETURN QUERY SELECT 
    carbon_amount,
    carbon_amount * 25.0;
END;
$$;

-- Function to auto-update transaction with carbon credits
CREATE OR REPLACE FUNCTION public.update_transaction_carbon_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  material_rec RECORD;
  carbon_result RECORD;
BEGIN
  SELECT material_type INTO material_rec
  FROM public.waste_materials
  WHERE id = NEW.material_id;
  
  SELECT * INTO carbon_result
  FROM public.calculate_carbon_credits(material_rec.material_type, NEW.quantity);
  
  NEW.carbon_credits_generated := carbon_result.carbon_tons;
  NEW.carbon_credits_value := carbon_result.credit_value;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_transaction_carbon_credits
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transaction_carbon_credits();

-- Function to update compliance framework completion
CREATE OR REPLACE FUNCTION public.update_framework_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_requirements INTEGER;
  completed_requirements INTEGER;
  completion_pct NUMERIC;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE completion_status = 'complete')
  INTO total_requirements, completed_requirements
  FROM public.compliance_data_points
  WHERE framework_id = COALESCE(NEW.framework_id, OLD.framework_id);
  
  IF total_requirements > 0 THEN
    completion_pct := (completed_requirements::NUMERIC / total_requirements::NUMERIC) * 100;
  ELSE
    completion_pct := 0;
  END IF;
  
  UPDATE public.compliance_frameworks
  SET 
    completion_percentage = completion_pct,
    status = CASE
      WHEN completion_pct = 0 THEN 'not_started'
      WHEN completion_pct = 100 THEN 'completed'
      WHEN completion_pct >= 90 THEN 'review'
      ELSE 'in_progress'
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.framework_id, OLD.framework_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_compliance_completion
  AFTER INSERT OR UPDATE OR DELETE ON public.compliance_data_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_framework_completion();

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_log (user_id, action_type, description, metadata)
  VALUES (p_user_id, p_action_type, p_description, p_metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.waste_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.carbon_emissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.compliance_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SEED DATA - Sample Carbon Offset Projects
-- ============================================================================
INSERT INTO public.carbon_offset_projects (
  project_name, project_type, location_country, location_region,
  price_per_ton, available_credits, certification_type,
  satellite_verified, project_description, image_url
) VALUES
  ('Amazon Rainforest Protection', 'reforestation', 'Brazil', 'Amazonas', 22.50, 50000, 'verra', true,
   'Protecting 100,000 hectares of primary rainforest from deforestation', 
   'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5'),
  ('Kenyan Solar Farm Initiative', 'renewable_energy', 'Kenya', 'Nairobi', 18.75, 75000, 'gold_standard', true,
   '50MW solar farm providing clean energy to 45,000 homes',
   'https://images.unsplash.com/photo-1509391366360-2e959784a276'),
  ('Ocean Plastic Recovery Program', 'ocean_cleanup', 'Indonesia', 'Java', 28.00, 30000, 'verra', true,
   'Removing plastic waste from ocean and preventing marine pollution',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19'),
  ('Swiss Alpine Reforestation', 'reforestation', 'Switzerland', 'Valais', 32.00, 15000, 'both', true,
   'Restoring native Alpine forests to enhance biodiversity',
   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'),
  ('Direct Air Capture Facility', 'direct_air_capture', 'Iceland', 'Reykjavik', 45.00, 100000, 'gold_standard', true,
   'State-of-the-art carbon removal technology using geothermal energy',
   'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a');