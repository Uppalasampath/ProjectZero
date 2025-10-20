-- Fix security warning: Set search_path on all functions to prevent search path attacks

-- Fix calculate_carbon_credits function
CREATE OR REPLACE FUNCTION public.calculate_carbon_credits(
  material_type TEXT,
  quantity_tons NUMERIC
)
RETURNS TABLE (
  carbon_tons NUMERIC,
  credit_value NUMERIC
)
LANGUAGE plpgsql
SET search_path = public
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

-- Fix update_transaction_carbon_credits function
CREATE OR REPLACE FUNCTION public.update_transaction_carbon_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix update_framework_completion function
CREATE OR REPLACE FUNCTION public.update_framework_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix log_activity function
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;