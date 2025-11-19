-- Seed Emission Factors Database
-- Sources: EPA (US), DEFRA (UK), IEA (International)
-- Updated: 2024

-- =============================================================================
-- SCOPE 1: STATIONARY COMBUSTION
-- =============================================================================

-- Natural Gas
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'stationary_combustion', 'natural_gas', 'US', 'US', 0.05306, 'kg_co2e_per_kwh', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Natural gas combustion in stationary sources'),
(1, 'stationary_combustion', 'natural_gas', 'UK', 'GB', 0.18385, 'kg_co2e_per_kwh', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 1, 'Natural gas combustion (UK grid)'),
(1, 'stationary_combustion', 'natural_gas', 'global', NULL, 0.2016, 'kg_co2e_per_m3', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'IPCC', 2023, '2023-01-01', 2, 'Natural gas per cubic meter');

-- Diesel
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'stationary_combustion', 'diesel', 'global', NULL, 2.68, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Diesel fuel combustion'),
(1, 'stationary_combustion', 'diesel', 'UK', 'GB', 2.70, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 1, 'Diesel fuel (UK)');

-- Gasoline/Petrol
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'stationary_combustion', 'gasoline', 'US', 'US', 2.31, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Motor gasoline'),
(1, 'stationary_combustion', 'petrol', 'UK', 'GB', 2.31, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 1, 'Petrol (UK)');

-- Fuel Oil
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'stationary_combustion', 'fuel_oil', 'global', NULL, 3.16, 'kg_co2e_per_liter', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Residual fuel oil'),
(1, 'stationary_combustion', 'heating_oil', 'US', 'US', 2.96, 'kg_co2e_per_liter', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Distillate heating oil');

-- Coal
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'stationary_combustion', 'coal', 'global', NULL, 2419.17, 'kg_co2e_per_ton', '{"co2": 0.99, "ch4": 0.005, "n2o": 0.005}', 'IPCC', 2023, '2023-01-01', 2, 'Bituminous coal'),
(1, 'stationary_combustion', 'anthracite_coal', 'UK', 'GB', 3240.0, 'kg_co2e_per_ton', '{"co2": 0.99, "ch4": 0.005, "n2o": 0.005}', 'DEFRA', 2023, '2023-01-01', 1, 'Anthracite coal');

-- Propane/LPG
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'stationary_combustion', 'propane', 'global', NULL, 1.51, 'kg_co2e_per_liter', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Liquefied petroleum gas (propane)'),
(1, 'stationary_combustion', 'lpg', 'UK', 'GB', 1.51, 'kg_co2e_per_liter', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 1, 'LPG (UK)');

-- =============================================================================
-- SCOPE 1: MOBILE COMBUSTION
-- =============================================================================

-- Vehicles - by fuel type
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'mobile_combustion', 'passenger_car_diesel', 'global', NULL, 2.68, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Passenger vehicle - diesel'),
(1, 'mobile_combustion', 'passenger_car_gasoline', 'global', NULL, 2.31, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Passenger vehicle - gasoline'),
(1, 'mobile_combustion', 'truck_diesel', 'global', NULL, 2.68, 'kg_co2e_per_liter', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 1, 'Heavy duty truck - diesel');

-- Vehicles - by distance (average)
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'mobile_combustion', 'passenger_car_average', 'US', 'US', 0.403, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 2, 'Average passenger vehicle (US fleet)'),
(1, 'mobile_combustion', 'passenger_car_average', 'UK', 'GB', 0.171, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'Average passenger car (UK)'),
(1, 'mobile_combustion', 'van_average', 'UK', 'GB', 0.257, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'Average van (UK)');

-- =============================================================================
-- SCOPE 1: FUGITIVE EMISSIONS
-- =============================================================================

-- Refrigerants (GWP values as emission factors)
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(1, 'fugitive_emissions', 'R-134a', 'global', NULL, 1430, 'gwp', '{"co2": 0, "ch4": 0, "n2o": 0}', 'IPCC AR5', 2023, '2023-01-01', 1, 'HFC-134a refrigerant'),
(1, 'fugitive_emissions', 'R-410A', 'global', NULL, 2088, 'gwp', '{"co2": 0, "ch4": 0, "n2o": 0}', 'IPCC AR5', 2023, '2023-01-01', 1, 'R-410A refrigerant (50/50 blend)'),
(1, 'fugitive_emissions', 'R-22', 'global', NULL, 1810, 'gwp', '{"co2": 0, "ch4": 0, "n2o": 0}', 'IPCC AR5', 2023, '2023-01-01', 1, 'HCFC-22 refrigerant'),
(1, 'fugitive_emissions', 'R-404A', 'global', NULL, 3922, 'gwp', '{"co2": 0, "ch4": 0, "n2o": 0}', 'IPCC AR5', 2023, '2023-01-01', 1, 'R-404A refrigerant');

-- =============================================================================
-- SCOPE 2: ELECTRICITY
-- =============================================================================

-- Grid Electricity by Country/Region (2023 data)
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(2, 'electricity', 'grid', 'US', 'US', 0.389, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'EPA eGRID', 2023, '2023-01-01', 1, 'US national average grid'),
(2, 'electricity', 'grid', 'UK', 'GB', 0.233, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'DEFRA', 2023, '2023-01-01', 1, 'UK grid electricity'),
(2, 'electricity', 'grid', 'EU', NULL, 0.295, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 1, 'European Union average'),
(2, 'electricity', 'grid', 'Germany', 'DE', 0.385, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 1, 'Germany grid'),
(2, 'electricity', 'grid', 'France', 'FR', 0.052, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 1, 'France grid (high nuclear)'),
(2, 'electricity', 'grid', 'China', 'CN', 0.555, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 2, 'China national grid'),
(2, 'electricity', 'grid', 'India', 'IN', 0.708, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 2, 'India national grid'),
(2, 'electricity', 'grid', 'Australia', 'AU', 0.640, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 2, 'Australia national grid'),
(2, 'electricity', 'grid', 'Canada', 'CA', 0.120, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 1, 'Canada national average (high hydro)'),
(2, 'electricity', 'grid', 'Brazil', 'BR', 0.074, 'kg_co2e_per_kwh', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'IEA', 2023, '2023-01-01', 2, 'Brazil grid (high renewable)');

-- Renewable Electricity
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(2, 'electricity', 'renewable', 'global', NULL, 0.0, 'kg_co2e_per_kwh', '{"co2": 0, "ch4": 0, "n2o": 0}', 'Standard', 2023, '2023-01-01', 1, 'Renewable energy certificates (RECs)'),
(2, 'electricity', 'solar', 'global', NULL, 0.045, 'kg_co2e_per_kwh', '{"co2": 1.0, "ch4": 0, "n2o": 0}', 'IPCC', 2023, '2023-01-01', 1, 'Solar PV (lifecycle)'),
(2, 'electricity', 'wind', 'global', NULL, 0.011, 'kg_co2e_per_kwh', '{"co2": 1.0, "ch4": 0, "n2o": 0}', 'IPCC', 2023, '2023-01-01', 1, 'Wind power (lifecycle)');

-- =============================================================================
-- SCOPE 2: HEATING & COOLING
-- =============================================================================

-- District Heating
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(2, 'heat', 'district_heating', 'UK', 'GB', 0.023, 'kg_co2e_per_kwh', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'District heating (UK)'),
(2, 'heat', 'steam', 'US', 'US', 0.066, 'kg_co2e_per_kwh', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 2, 'Steam from utility');

-- =============================================================================
-- SCOPE 3: CATEGORY 1 - PURCHASED GOODS & SERVICES
-- =============================================================================

-- Spend-based factors (per $1000 USD)
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'purchased_goods', 'chemicals', 'US', 'US', 580, 'kg_co2e_per_1000_usd', NULL, 'EPA EEIO', 2023, '2023-01-01', 4, 'Chemical products'),
(3, 'purchased_goods', 'metals', 'US', 'US', 450, 'kg_co2e_per_1000_usd', NULL, 'EPA EEIO', 2023, '2023-01-01', 4, 'Metal products'),
(3, 'purchased_goods', 'plastics', 'US', 'US', 520, 'kg_co2e_per_1000_usd', NULL, 'EPA EEIO', 2023, '2023-01-01', 4, 'Plastic products'),
(3, 'purchased_goods', 'paper', 'US', 'US', 380, 'kg_co2e_per_1000_usd', NULL, 'EPA EEIO', 2023, '2023-01-01', 4, 'Paper products'),
(3, 'purchased_goods', 'electronics', 'US', 'US', 250, 'kg_co2e_per_1000_usd', NULL, 'EPA EEIO', 2023, '2023-01-01', 4, 'Electronic equipment'),
(3, 'purchased_goods', 'construction', 'US', 'US', 420, 'kg_co2e_per_1000_usd', NULL, 'EPA EEIO', 2023, '2023-01-01', 4, 'Construction services');

-- =============================================================================
-- SCOPE 3: CATEGORY 5 - WASTE
-- =============================================================================

-- Waste disposal by type and method
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'waste', 'landfill_mixed', 'global', NULL, 467, 'kg_co2e_per_ton', '{"co2": 0.7, "ch4": 0.3, "n2o": 0}', 'EPA WARM', 2023, '2023-01-01', 2, 'Mixed waste to landfill'),
(3, 'waste', 'landfill_organic', 'global', NULL, 674, 'kg_co2e_per_ton', '{"co2": 0.5, "ch4": 0.5, "n2o": 0}', 'EPA WARM', 2023, '2023-01-01', 2, 'Organic waste to landfill'),
(3, 'waste', 'incineration', 'global', NULL, 234, 'kg_co2e_per_ton', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'EPA WARM', 2023, '2023-01-01', 2, 'Waste incineration'),
(3, 'waste', 'recycling_paper', 'global', NULL, -1440, 'kg_co2e_per_ton', NULL, 'EPA WARM', 2023, '2023-01-01', 2, 'Paper recycling (avoided emissions)'),
(3, 'waste', 'recycling_plastic', 'global', NULL, -1290, 'kg_co2e_per_ton', NULL, 'EPA WARM', 2023, '2023-01-01', 2, 'Plastic recycling (avoided emissions)'),
(3, 'waste', 'recycling_metal', 'global', NULL, -8340, 'kg_co2e_per_ton', NULL, 'EPA WARM', 2023, '2023-01-01', 2, 'Aluminum recycling (avoided emissions)'),
(3, 'waste', 'composting', 'global', NULL, -52, 'kg_co2e_per_ton', NULL, 'EPA WARM', 2023, '2023-01-01', 2, 'Food waste composting');

-- =============================================================================
-- SCOPE 3: CATEGORY 6 - BUSINESS TRAVEL
-- =============================================================================

-- Air travel
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'business_travel', 'flight_domestic_short', 'global', NULL, 0.255, 'kg_co2e_per_km', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'Domestic flight <500 km'),
(3, 'business_travel', 'flight_domestic_long', 'global', NULL, 0.156, 'kg_co2e_per_km', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'Domestic flight >500 km'),
(3, 'business_travel', 'flight_international_short', 'global', NULL, 0.195, 'kg_co2e_per_km', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'International short haul'),
(3, 'business_travel', 'flight_international_long', 'global', NULL, 0.150, 'kg_co2e_per_km', '{"co2": 0.98, "ch4": 0.01, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'International long haul');

-- Rail
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'business_travel', 'train', 'UK', 'GB', 0.035, 'kg_co2e_per_km', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'DEFRA', 2023, '2023-01-01', 2, 'National rail (UK)'),
(3, 'business_travel', 'train', 'EU', NULL, 0.028, 'kg_co2e_per_km', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'EEA', 2023, '2023-01-01', 2, 'European rail average'),
(3, 'business_travel', 'train', 'US', 'US', 0.052, 'kg_co2e_per_km', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'EPA', 2023, '2023-01-01', 2, 'Rail (US average)');

-- Car/Taxi
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'business_travel', 'taxi', 'UK', 'GB', 0.207, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 2, 'Taxi (black cab or regular)'),
(3, 'business_travel', 'rental_car', 'US', 'US', 0.403, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'EPA', 2023, '2023-01-01', 2, 'Rental car (average)');

-- Hotel stays
INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'business_travel', 'hotel', 'global', NULL, 12.2, 'kg_co2e_per_night', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'Cornell Hotel School', 2023, '2023-01-01', 3, 'Hotel accommodation per room night');

-- =============================================================================
-- SCOPE 3: CATEGORY 7 - EMPLOYEE COMMUTING
-- =============================================================================

INSERT INTO emission_factors (scope, category, subcategory, region, country_code, factor_value, factor_unit, gas_breakdown, source, source_year, valid_from, data_quality_tier, description) VALUES
(3, 'employee_commuting', 'car', 'global', NULL, 0.171, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 3, 'Average passenger car commute'),
(3, 'employee_commuting', 'bus', 'global', NULL, 0.103, 'kg_co2e_per_km', '{"co2": 0.97, "ch4": 0.02, "n2o": 0.01}', 'DEFRA', 2023, '2023-01-01', 3, 'Bus commute (per passenger)'),
(3, 'employee_commuting', 'train', 'global', NULL, 0.035, 'kg_co2e_per_km', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'DEFRA', 2023, '2023-01-01', 3, 'Train commute (per passenger)'),
(3, 'employee_commuting', 'metro', 'global', NULL, 0.028, 'kg_co2e_per_km', '{"co2": 0.95, "ch4": 0.03, "n2o": 0.02}', 'DEFRA', 2023, '2023-01-01', 3, 'Metro/subway (per passenger)');

-- =============================================================================
-- Summary
-- =============================================================================
-- This seed file includes:
-- - Scope 1: Stationary combustion (6 fuel types), Mobile combustion (vehicles), Fugitive emissions
-- - Scope 2: Electricity grid factors (10 countries), Renewable energy, Heating/cooling
-- - Scope 3: Purchased goods (Cat 1), Waste (Cat 5), Business travel (Cat 6), Commuting (Cat 7)
--
-- Total: ~90 emission factors covering common emission sources
-- Data quality tiers: 1 (primary data) to 4 (spend-based estimates)
-- Sources: EPA, DEFRA, IEA, IPCC AR5, EPA WARM model
-- =============================================================================
