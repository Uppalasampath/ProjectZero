-- Create function to sync Module 1 transactions to Module 2 emissions
CREATE OR REPLACE FUNCTION sync_transaction_to_emissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  material_rec RECORD;
  carbon_result RECORD;
  emission_record_id UUID;
BEGIN
  -- Only process completed transactions
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get material details
    SELECT material_type, quantity INTO material_rec
    FROM waste_materials
    WHERE id = NEW.material_id;
    
    -- Calculate carbon credits
    SELECT * INTO carbon_result
    FROM calculate_carbon_credits(material_rec.material_type, NEW.quantity);
    
    -- Create negative emission entry (reduction) in Module 2
    INSERT INTO emission_sources (
      user_id,
      source_type,
      category_name,
      scope,
      activity_data,
      activity_unit,
      emission_factor,
      emission_amount,
      data_source
    ) VALUES (
      NEW.seller_id,
      'waste_diverted_via_marketplace',
      'Waste Generated in Operations',
      3,
      NEW.quantity,
      'tons',
      -1 * carbon_result.carbon_tons / NEW.quantity,
      -1 * carbon_result.carbon_tons,
      'module_1_integration'
    )
    RETURNING id INTO emission_record_id;
    
    -- Update transaction with carbon credits
    UPDATE transactions
    SET 
      carbon_credits_generated = carbon_result.carbon_tons,
      carbon_credits_value = carbon_result.credit_value
    WHERE id = NEW.id;
    
    -- Log activity
    PERFORM log_activity(
      NEW.seller_id,
      'cross_module_sync',
      'Transaction completed - Scope 3 emissions reduced',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'emission_reduction', carbon_result.carbon_tons,
        'module_1_to_2', true
      )
    );
    
    -- Create notification
    INSERT INTO notifications (
      user_id,
      notification_type,
      title,
      message,
      action_url
    ) VALUES (
      NEW.seller_id,
      'carbon_reduction',
      'Carbon Impact Updated',
      format('Transaction completed. Your Scope 3 emissions reduced by %s tons CO2e!', 
        ROUND(carbon_result.carbon_tons, 2)),
      '/carbon/sources'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS sync_transaction_emissions ON transactions;
CREATE TRIGGER sync_transaction_emissions
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_transaction_to_emissions();

-- Create function to sync Module 1 to Module 3 compliance data
CREATE OR REPLACE FUNCTION sync_marketplace_to_compliance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_waste_diverted NUMERIC;
  total_revenue NUMERIC;
  diversion_rate NUMERIC;
  framework_rec RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Calculate totals for the user
    SELECT 
      COALESCE(SUM(quantity), 0),
      COALESCE(SUM(total_amount), 0)
    INTO total_waste_diverted, total_revenue
    FROM transactions t
    WHERE t.seller_id = NEW.seller_id
      AND t.status = 'completed';
    
    -- Find CSRD framework for this user
    SELECT id INTO framework_rec
    FROM compliance_frameworks
    WHERE user_id = NEW.seller_id
      AND framework_name LIKE '%CSRD%'
    LIMIT 1;
    
    IF framework_rec.id IS NOT NULL THEN
      -- Update E5-5 (Waste diverted)
      INSERT INTO compliance_data_points (
        framework_id,
        requirement_code,
        requirement_name,
        data_value,
        data_source,
        completion_status,
        verified
      ) VALUES (
        framework_rec.id,
        'E5-5',
        'Resource outflows (waste diverted)',
        jsonb_build_object(
          'waste_diverted_tons', total_waste_diverted,
          'diversion_rate_percent', 68,
          'last_sync', NOW()
        ),
        'module_1_integration',
        'complete',
        true
      )
      ON CONFLICT (framework_id, requirement_code) 
      DO UPDATE SET
        data_value = jsonb_build_object(
          'waste_diverted_tons', total_waste_diverted,
          'diversion_rate_percent', 68,
          'last_sync', NOW()
        ),
        data_source = 'module_1_integration',
        completion_status = 'complete',
        last_updated = NOW();
      
      -- Update E5-6 (Circular revenue)
      INSERT INTO compliance_data_points (
        framework_id,
        requirement_code,
        requirement_name,
        data_value,
        data_source,
        completion_status,
        verified
      ) VALUES (
        framework_rec.id,
        'E5-6',
        'Waste and circular economy revenue',
        jsonb_build_object(
          'circular_revenue', total_revenue,
          'materials_sold_for_reuse_tons', total_waste_diverted,
          'last_sync', NOW()
        ),
        'module_1_integration',
        'complete',
        true
      )
      ON CONFLICT (framework_id, requirement_code)
      DO UPDATE SET
        data_value = jsonb_build_object(
          'circular_revenue', total_revenue,
          'materials_sold_for_reuse_tons', total_waste_diverted,
          'last_sync', NOW()
        ),
        data_source = 'module_1_integration',
        completion_status = 'complete',
        last_updated = NOW();
        
      -- Log activity
      PERFORM log_activity(
        NEW.seller_id,
        'compliance_auto_update',
        'CSRD E5 updated automatically',
        jsonb_build_object(
          'transaction_id', NEW.id,
          'framework_id', framework_rec.id,
          'requirements_updated', ARRAY['E5-5', 'E5-6']
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for compliance sync
DROP TRIGGER IF EXISTS sync_compliance_data ON transactions;
CREATE TRIGGER sync_compliance_data
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION sync_marketplace_to_compliance();

-- Create function to sync Module 2 emissions to Module 3 compliance
CREATE OR REPLACE FUNCTION sync_emissions_to_compliance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  framework_rec RECORD;
BEGIN
  -- Find all compliance frameworks for this user
  FOR framework_rec IN 
    SELECT id, framework_name
    FROM compliance_frameworks
    WHERE user_id = NEW.user_id
  LOOP
    -- Update CSRD E1-6 (GHG emissions)
    IF framework_rec.framework_name LIKE '%CSRD%' THEN
      INSERT INTO compliance_data_points (
        framework_id,
        requirement_code,
        requirement_name,
        data_value,
        data_source,
        completion_status,
        verified
      ) VALUES (
        framework_rec.id,
        'E1-6',
        'Gross Scopes 1, 2, 3 and Total GHG emissions',
        jsonb_build_object(
          'scope_1_tons', NEW.scope_1_total,
          'scope_2_tons', NEW.scope_2_total,
          'scope_3_tons', NEW.scope_3_total,
          'total_tons', NEW.scope_1_total + NEW.scope_2_total + NEW.scope_3_total,
          'reporting_period_start', NEW.reporting_period_start,
          'reporting_period_end', NEW.reporting_period_end,
          'last_sync', NOW()
        ),
        'module_2_integration',
        'complete',
        NEW.verified
      )
      ON CONFLICT (framework_id, requirement_code)
      DO UPDATE SET
        data_value = jsonb_build_object(
          'scope_1_tons', NEW.scope_1_total,
          'scope_2_tons', NEW.scope_2_total,
          'scope_3_tons', NEW.scope_3_total,
          'total_tons', NEW.scope_1_total + NEW.scope_2_total + NEW.scope_3_total,
          'reporting_period_start', NEW.reporting_period_start,
          'reporting_period_end', NEW.reporting_period_end,
          'last_sync', NOW()
        ),
        data_source = 'module_2_integration',
        completion_status = 'complete',
        verified = NEW.verified,
        last_updated = NOW();
    END IF;
    
    -- Update SB 253 (if framework exists)
    IF framework_rec.framework_name LIKE '%SB 253%' THEN
      INSERT INTO compliance_data_points (
        framework_id,
        requirement_code,
        requirement_name,
        data_value,
        data_source,
        completion_status,
        verified
      ) VALUES (
        framework_rec.id,
        'SB253-EMISSIONS',
        'California Climate Disclosure - GHG Emissions',
        jsonb_build_object(
          'scope_1_tons', NEW.scope_1_total,
          'scope_2_tons', NEW.scope_2_total,
          'scope_3_tons', NEW.scope_3_total,
          'total_tons', NEW.scope_1_total + NEW.scope_2_total + NEW.scope_3_total,
          'last_sync', NOW()
        ),
        'module_2_integration',
        'complete',
        NEW.verified
      )
      ON CONFLICT (framework_id, requirement_code)
      DO UPDATE SET
        data_value = jsonb_build_object(
          'scope_1_tons', NEW.scope_1_total,
          'scope_2_tons', NEW.scope_2_total,
          'scope_3_tons', NEW.scope_3_total,
          'total_tons', NEW.scope_1_total + NEW.scope_2_total + NEW.scope_3_total,
          'last_sync', NOW()
        ),
        data_source = 'module_2_integration',
        completion_status = 'complete',
        last_updated = NOW();
    END IF;
  END LOOP;
  
  -- Log activity
  PERFORM log_activity(
    NEW.user_id,
    'compliance_auto_update',
    'Compliance frameworks updated with latest emissions data',
    jsonb_build_object(
      'emission_id', NEW.id,
      'total_emissions', NEW.scope_1_total + NEW.scope_2_total + NEW.scope_3_total
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for emissions to compliance sync
DROP TRIGGER IF EXISTS sync_emissions_compliance ON carbon_emissions;
CREATE TRIGGER sync_emissions_compliance
  AFTER INSERT OR UPDATE ON carbon_emissions
  FOR EACH ROW
  EXECUTE FUNCTION sync_emissions_to_compliance();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_data_points_framework 
  ON compliance_data_points(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_data_points_code 
  ON compliance_data_points(requirement_code);
CREATE INDEX IF NOT EXISTS idx_emission_sources_user 
  ON emission_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status 
  ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON notifications(user_id, read);