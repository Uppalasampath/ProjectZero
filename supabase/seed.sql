-- Seed Data for ZERO Platform Demo/Testing
-- Run this script to populate the database with realistic demo data
-- WARNING: This will insert demo data - ensure you're not running on production!

-- =============================================================================
-- 1. CARBON EMISSIONS DATA
-- =============================================================================

-- Insert historical carbon emissions data (last 12 months)
INSERT INTO carbon_emissions (
  user_id,
  reporting_period_start,
  reporting_period_end,
  scope_1_total,
  scope_2_total,
  scope_3_total,
  scope_3_breakdown,
  calculation_method,
  verification_status
) VALUES
  -- Month 1 (12 months ago)
  (auth.uid(), NOW() - INTERVAL '12 months', NOW() - INTERVAL '11 months', 45200, 58400, 126800,
   '{"purchased_goods": 45000, "transportation": 32000, "waste": 28000, "business_travel": 21800}',
   'GHG Protocol', 'verified'),

  -- Month 2
  (auth.uid(), NOW() - INTERVAL '11 months', NOW() - INTERVAL '10 months', 44800, 57200, 124500,
   '{"purchased_goods": 44000, "transportation": 31500, "waste": 27500, "business_travel": 21500}',
   'GHG Protocol', 'verified'),

  -- Month 3
  (auth.uid(), NOW() - INTERVAL '10 months', NOW() - INTERVAL '9 months', 43500, 55800, 121200,
   '{"purchased_goods": 42500, "transportation": 30800, "waste": 27000, "business_travel": 20900}',
   'GHG Protocol', 'verified'),

  -- Month 4
  (auth.uid(), NOW() - INTERVAL '9 months', NOW() - INTERVAL '8 months', 42100, 54300, 118600,
   '{"purchased_goods": 41200, "transportation": 30000, "waste": 26400, "business_travel": 21000}',
   'GHG Protocol', 'verified'),

  -- Month 5
  (auth.uid(), NOW() - INTERVAL '8 months', NOW() - INTERVAL '7 months', 41200, 53100, 116400,
   '{"purchased_goods": 40500, "transportation": 29200, "waste": 25800, "business_travel": 20900}',
   'GHG Protocol', 'verified'),

  -- Month 6
  (auth.uid(), NOW() - INTERVAL '7 months', NOW() - INTERVAL '6 months', 40500, 52200, 114800,
   '{"purchased_goods": 39800, "transportation": 28800, "waste": 25200, "business_travel": 21000}',
   'GHG Protocol', 'verified'),

  -- Month 7
  (auth.uid(), NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', 39800, 51400, 112500,
   '{"purchased_goods": 38900, "transportation": 28200, "waste": 24600, "business_travel": 20800}',
   'GHG Protocol', 'verified'),

  -- Month 8
  (auth.uid(), NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', 38900, 50100, 110200,
   '{"purchased_goods": 38000, "transportation": 27600, "waste": 24000, "business_travel": 20600}',
   'GHG Protocol', 'verified'),

  -- Month 9
  (auth.uid(), NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', 38200, 49200, 108400,
   '{"purchased_goods": 37200, "transportation": 27000, "waste": 23500, "business_travel": 20700}',
   'GHG Protocol', 'verified'),

  -- Month 10
  (auth.uid(), NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', 37400, 48500, 106800,
   '{"purchased_goods": 36500, "transportation": 26600, "waste": 23000, "business_travel": 20700}',
   'GHG Protocol', 'verified'),

  -- Month 11
  (auth.uid(), NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', 36800, 47800, 104500,
   '{"purchased_goods": 35800, "transportation": 26000, "waste": 22400, "business_travel": 20300}',
   'GHG Protocol', 'pending_verification'),

  -- Month 12 (current month)
  (auth.uid(), NOW() - INTERVAL '1 month', NOW(), 36200, 47100, 102800,
   '{"purchased_goods": 35200, "transportation": 25500, "waste": 21900, "business_travel": 20200}',
   'GHG Protocol', 'pending_verification');

-- =============================================================================
-- 2. EMISSION SOURCES (Top contributors)
-- =============================================================================

INSERT INTO emission_sources (
  user_id,
  source_type,
  category_name,
  emission_amount,
  unit,
  calculation_method,
  activity_data
) VALUES
  (auth.uid(), 'Transportation', 'Fleet Vehicles', 25500, 'tons CO2e', 'Distance-based', '{"distance_km": 850000, "fuel_type": "diesel"}'),
  (auth.uid(), 'Energy', 'Electricity Grid', 47100, 'tons CO2e', 'Location-based', '{"kwh_consumed": 2400000, "grid_factor": 0.0196}'),
  (auth.uid(), 'Manufacturing', 'Production Process', 22800, 'tons CO2e', 'Process-based', '{"units_produced": 125000}'),
  (auth.uid(), 'Waste', 'Landfill Waste', 21900, 'tons CO2e', 'Waste-based', '{"waste_tons": 3200, "waste_type": "mixed"}'),
  (auth.uid(), 'Supply Chain', 'Purchased Goods', 35200, 'tons CO2e', 'Spend-based', '{"spend_amount": 8500000}');

-- =============================================================================
-- 3. WASTE MATERIALS (Marketplace Listings)
-- =============================================================================

INSERT INTO waste_materials (
  seller_id,
  material_type,
  material_subtype,
  quantity,
  unit,
  purity_percentage,
  quality_grade,
  location_address,
  location_city,
  location_country,
  price_per_unit,
  status,
  description,
  certifications
) VALUES
  -- Available listings
  (auth.uid(), 'Plastic', 'PET', 15.5, 'tons', 95, 'Grade A', '123 Industrial Park Rd', 'Manchester', 'United Kingdom', 450, 'available',
   'Clean PET bottles from beverage production, baled and ready for transport. Food-grade quality.',
   '{"iso_14001": true, "recycling_cert": "UK-PET-2024-001"}'),

  (auth.uid(), 'Metal', 'Aluminum', 8.2, 'tons', 98, 'Grade A', '456 Manufacturing Ave', 'Birmingham', 'United Kingdom', 1200, 'available',
   'High-purity aluminum scrap from manufacturing process. Minimal contamination.',
   '{"iso_14001": true, "metal_cert": "UK-AL-2024-045"}'),

  (auth.uid(), 'Paper', 'Cardboard', 22.0, 'tons', 90, 'Grade B', '789 Warehouse St', 'London', 'United Kingdom', 180, 'available',
   'Mixed cardboard packaging from distribution center. Dry and well-sorted.',
   '{"fsc_certified": true}'),

  (auth.uid(), 'Plastic', 'HDPE', 12.3, 'tons', 92, 'Grade A', '321 Factory Ln', 'Leeds', 'United Kingdom', 520, 'available',
   'HDPE containers from chemical processing. Clean and sorted by color.',
   '{"iso_14001": true, "recycling_cert": "UK-HDPE-2024-012"}'),

  (auth.uid(), 'Glass', 'Clear Glass', 18.5, 'tons', 99, 'Grade A', '654 Industrial Blvd', 'Bristol', 'United Kingdom', 95, 'available',
   'Clear glass bottles from beverage production. Sorted and crushed.',
   '{"glass_cert": "UK-GL-2024-008"}'),

  (auth.uid(), 'Metal', 'Steel', 25.0, 'tons', 96, 'Grade B', '987 Steel Works Rd', 'Sheffield', 'United Kingdom', 380, 'available',
   'Mixed steel scrap from construction and demolition. Sorted and processed.',
   '{"iso_14001": true}'),

  -- Reserved/Sold listings (for transaction history)
  (auth.uid(), 'Plastic', 'PP', 10.5, 'tons', 94, 'Grade A', '147 Park Rd', 'Glasgow', 'United Kingdom', 480, 'reserved',
   'Polypropylene from packaging production.',
   '{"iso_14001": true}'),

  (auth.uid(), 'Paper', 'Office Paper', 5.8, 'tons', 88, 'Grade B', '258 Business Park', 'Edinburgh', 'United Kingdom', 220, 'sold',
   'Mixed office paper from corporate offices.',
   '{"fsc_certified": true}'),

  (auth.uid(), 'Metal', 'Copper', 3.2, 'tons', 99, 'Grade A', '369 Tech District', 'Cambridge', 'United Kingdom', 4500, 'sold',
   'High-purity copper wire from electronics manufacturing.',
   '{"metal_cert": "UK-CU-2024-022"}');

-- =============================================================================
-- 4. TRANSACTIONS (Marketplace Activity)
-- =============================================================================

-- Get the material IDs we just created
DO $$
DECLARE
  mat1_id UUID;
  mat2_id UUID;
  mat3_id UUID;
  buyer1_id UUID;
BEGIN
  -- For demo purposes, we'll use the current user as both buyer and seller
  -- In production, you'd have different buyer accounts

  -- Get some material IDs
  SELECT id INTO mat1_id FROM waste_materials WHERE material_type = 'Plastic' AND material_subtype = 'PP' LIMIT 1;
  SELECT id INTO mat2_id FROM waste_materials WHERE material_type = 'Paper' AND material_subtype = 'Office Paper' LIMIT 1;
  SELECT id INTO mat3_id FROM waste_materials WHERE material_type = 'Metal' AND material_subtype = 'Copper' LIMIT 1;

  -- Insert completed transactions
  INSERT INTO transactions (
    seller_id,
    buyer_id,
    material_id,
    quantity,
    unit_price,
    total_amount,
    platform_fee,
    status,
    logistics_provider,
    tracking_number,
    carbon_credits_generated,
    carbon_credits_value,
    completed_at,
    created_at
  ) VALUES
    -- Completed transaction 1
    (auth.uid(), auth.uid(), mat1_id, 10.5, 480, 5040, 252, 'completed',
     'GreenLogistics Ltd', 'GL-2024-001234', 4.2, 168, NOW() - INTERVAL '15 days', NOW() - INTERVAL '30 days'),

    -- Completed transaction 2
    (auth.uid(), auth.uid(), mat2_id, 5.8, 220, 1276, 64, 'completed',
     'EcoTransport Services', 'ET-2024-005678', 2.1, 84, NOW() - INTERVAL '8 days', NOW() - INTERVAL '22 days'),

    -- Completed transaction 3
    (auth.uid(), auth.uid(), mat3_id, 3.2, 4500, 14400, 720, 'completed',
     'RecycleHaul Express', 'RH-2024-009876', 1.6, 64, NOW() - INTERVAL '3 days', NOW() - INTERVAL '18 days');

  -- Insert active transaction
  INSERT INTO transactions (
    seller_id,
    buyer_id,
    material_id,
    quantity,
    unit_price,
    total_amount,
    platform_fee,
    status,
    logistics_provider,
    created_at
  )
  SELECT
    auth.uid(),
    auth.uid(),
    id,
    15.5,
    450,
    6975,
    349,
    'active',
    'GreenLogistics Ltd',
    NOW() - INTERVAL '5 days'
  FROM waste_materials
  WHERE material_type = 'Plastic' AND material_subtype = 'PET'
  LIMIT 1;

  -- Insert pending transaction
  INSERT INTO transactions (
    seller_id,
    buyer_id,
    material_id,
    quantity,
    unit_price,
    total_amount,
    platform_fee,
    status,
    created_at
  )
  SELECT
    auth.uid(),
    auth.uid(),
    id,
    8.2,
    1200,
    9840,
    492,
    'pending',
    NOW() - INTERVAL '2 days'
  FROM waste_materials
  WHERE material_type = 'Metal' AND material_subtype = 'Aluminum'
  LIMIT 1;
END $$;

-- =============================================================================
-- 5. CARBON OFFSET PROJECTS
-- =============================================================================

INSERT INTO carbon_offset_projects (
  project_name,
  project_type,
  description,
  location_country,
  location_region,
  verification_standard,
  price_per_credit,
  available_credits,
  total_credits,
  project_start_date,
  vintage_year,
  co_benefits,
  status
) VALUES
  ('Amazon Rainforest Conservation', 'Reforestation',
   'Large-scale reforestation project protecting 50,000 hectares of Amazon rainforest. Working with indigenous communities to prevent deforestation and restore degraded areas.',
   'Brazil', 'Amazonas', 'Verra VCS', 12.50, 250000, 500000, '2020-01-15', 2023,
   '{"biodiversity": true, "community_development": true, "water_conservation": true}', 'active'),

  ('North Sea Wind Farm', 'Renewable Energy',
   'Offshore wind energy project generating 800MW of clean electricity. Displaces coal and gas power generation in the UK grid.',
   'United Kingdom', 'North Sea', 'Gold Standard', 15.75, 180000, 300000, '2019-06-01', 2023,
   '{"clean_energy": true, "job_creation": true, "energy_security": true}', 'active'),

  ('Kenya Solar Cookstoves', 'Clean Technology',
   'Distribution of 100,000 solar cookstoves to rural households, reducing firewood consumption and indoor air pollution.',
   'Kenya', 'Rift Valley', 'Gold Standard', 18.00, 95000, 150000, '2021-03-20', 2023,
   '{"health_improvement": true, "gender_equality": true, "education": true}', 'active'),

  ('Indonesian Peatland Restoration', 'Blue Carbon',
   'Restoration and protection of 30,000 hectares of coastal peatland ecosystems. Prevents peat fires and protects biodiversity.',
   'Indonesia', 'Kalimantan', 'Verra VCS', 22.00, 120000, 200000, '2020-09-10', 2023,
   '{"biodiversity": true, "water_quality": true, "coastal_protection": true}', 'active'),

  ('Scottish Peatland Recovery', 'Nature Conservation',
   'Restoration of degraded peatlands across Scottish Highlands. Rewetting drained peatlands to restore carbon sequestration.',
   'United Kingdom', 'Scotland', 'Peatland Code', 16.50, 75000, 100000, '2021-05-15', 2023,
   '{"biodiversity": true, "water_quality": true, "flood_prevention": true}', 'active'),

  ('Indian Biogas Digesters', 'Waste Management',
   'Installation of 50,000 biogas digesters for agricultural waste. Converts animal manure into clean cooking fuel.',
   'India', 'Gujarat', 'Gold Standard', 14.25, 140000, 200000, '2020-11-01', 2023,
   '{"waste_reduction": true, "clean_energy": true, "rural_development": true}', 'active'),

  ('Madagascar Mangrove Planting', 'Blue Carbon',
   'Planting and protection of 10,000 hectares of mangrove forests. Provides coastal protection and marine habitat.',
   'Madagascar', 'Western Coast', 'Plan Vivo', 20.00, 85000, 120000, '2021-02-28', 2023,
   '{"biodiversity": true, "fisheries": true, "coastal_protection": true}', 'active'),

  ('German Biochar Production', 'Carbon Removal',
   'Production of biochar from agricultural waste for soil amendment. Sequesters carbon while improving soil health.',
   'Germany', 'Bavaria', 'European Biochar Certificate', 45.00, 25000, 40000, '2022-01-10', 2023,
   '{"soil_health": true, "waste_reduction": true, "agriculture": true}', 'active');

-- =============================================================================
-- 6. CARBON CREDIT PURCHASES (User's offset history)
-- =============================================================================

DO $$
DECLARE
  proj1_id UUID;
  proj2_id UUID;
  proj3_id UUID;
BEGIN
  -- Get project IDs
  SELECT id INTO proj1_id FROM carbon_offset_projects WHERE project_name = 'Amazon Rainforest Conservation' LIMIT 1;
  SELECT id INTO proj2_id FROM carbon_offset_projects WHERE project_name = 'North Sea Wind Farm' LIMIT 1;
  SELECT id INTO proj3_id FROM carbon_offset_projects WHERE project_name = 'Kenya Solar Cookstoves' LIMIT 1;

  INSERT INTO carbon_credit_purchases (
    user_id,
    project_id,
    quantity_tons,
    price_per_ton,
    total_amount,
    purchase_status,
    certificate_number,
    retirement_status,
    purchased_at
  ) VALUES
    (auth.uid(), proj1_id, 50, 12.50, 625, 'completed', 'ZERO-2024-001', 'retired', NOW() - INTERVAL '60 days'),
    (auth.uid(), proj2_id, 100, 15.75, 1575, 'completed', 'ZERO-2024-002', 'retired', NOW() - INTERVAL '45 days'),
    (auth.uid(), proj3_id, 75, 18.00, 1350, 'completed', 'ZERO-2024-003', 'active', NOW() - INTERVAL '20 days');
END $$;

-- =============================================================================
-- Summary
-- =============================================================================
-- This seed script creates:
-- - 12 months of carbon emissions history showing improvement trend
-- - 5 top emission sources
-- - 9 waste material listings (6 available, 3 reserved/sold)
-- - 5 transactions (3 completed, 1 active, 1 pending)
-- - 8 diverse carbon offset projects across different types and regions
-- - 3 carbon credit purchases totaling 225 tons
--
-- Total estimated carbon impact from marketplace: ~7.9 tons CO2e
-- Total carbon offsets purchased: 225 tons CO2e
-- Latest monthly emissions: ~186 tons CO2e (showing improvement from ~230 tons)
-- =============================================================================
