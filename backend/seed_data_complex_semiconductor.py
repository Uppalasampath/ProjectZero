"""
Complex Seed Data for Test Company Pet Ltd - Semiconductor Manufacturing
$250B+ annual revenue, global operations, 15 fabrication facilities

This data intentionally includes real-world data quality issues:
- Missing values
- Inconsistent units (kWh vs MWh, gallons vs liters, kg vs tons)
- Mixed date formats
- Data gaps
- Different reporting standards (US, EU, Asia)
- Incomplete facility data
- Various data quality tiers
- Outliers and anomalies
- Multiple data sources with different formats
"""

from datetime import date, datetime
from decimal import Decimal

# Company: Test Company Pet Ltd
# Industry: Semiconductor Manufacturing (NAICS 334413)
# Revenue: $250.8 Billion (2024)
# Employees: 87,500 globally
# Headquarters: Santa Clara, CA, USA

COMPLEX_SEED_DATA = {
    # ===== BASIC COMPANY INFORMATION =====
    "company_name": "Test Company Pet Ltd",
    "reporting_period_start": date(2024, 1, 1),
    "reporting_period_end": date(2024, 12, 31),

    # ===== REGULATORY IDENTIFIERS =====
    "naics_code": "334413",  # Semiconductor and Related Device Manufacturing
    "duns_number": "12-456-7890",
    "epa_facility_id": "110001234567",
    "reporting_entity_id": "TCPL-2024-001",

    # ===== PRIMARY CONTACT =====
    "primary_contact_name": "Dr. Sarah Chen",
    "primary_contact_title": "Chief Sustainability Officer",
    "primary_contact_email": "sarah.chen@testcompanypet.com",
    "primary_contact_phone": "+1-408-555-0199",

    # ===== EMISSIONS TOTALS (Calculated after normalization) =====
    # These will be calculated from facility-level data
    "scope_1_total": None,  # To be calculated
    "scope_2_total": None,  # To be calculated
    "scope_3_total": None,  # To be calculated

    # ===== FACILITY-LEVEL DATA (15 GLOBAL FABS) =====
    # DATA QUALITY ISSUES:
    # - Missing emissions data for some facilities
    # - Inconsistent unit reporting
    # - Some facilities report in different periods
    # - Data completeness varies by facility
    "facilities_raw": [
        {
            "facility_id": "FAB-001",
            "name": "Santa Clara Main Fabrication Plant",
            "address": "3500 Silicon Valley Blvd, Santa Clara, CA 95054, USA",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 120000,  # wafers per month
            # Missing scope_1 data - needs estimation
            "scope_1": None,  # MISSING
            "scope_2": 458750.5,  # metric tons CO2e
            "scope_3": 125680.3,
            "electricity_kwh": 2850000000,  # 2.85 TWh
            "natural_gas_therms": 1250000,
            "process_gases_kg": {
                "NF3": 45000,
                "SF6": 12000,
                "CF4": 8500,
                "CHF3": 6200
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.85  # 85% complete
        },
        {
            "facility_id": "FAB-002",
            "name": "Phoenix Advanced Semiconductor Facility",
            "address": "7800 West Innovation Drive, Phoenix, AZ 85043, USA",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 95000,
            "scope_1": 285430.2,  # metric tons CO2e
            "scope_2": 392156.8,
            "scope_3": 98450.6,
            # Electricity reported in MWh instead of kWh - NEEDS CONVERSION
            "electricity_mwh": 2145000,  # MWh (different unit!)
            "natural_gas": {
                "amount": 980000,
                "unit": "therms"
            },
            "process_gases_kg": {
                "NF3": 38500,
                "SF6": 10200,
                "CF4": 7100
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.92
        },
        {
            "facility_id": "FAB-003",
            "name": "Hsinchu Fab 3 (Taiwan)",
            "address": "No. 168, Park Avenue III, Hsinchu Science Park, Taiwan",
            "facility_type": "Fab (200mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 65000,
            "scope_1": 156780.5,
            "scope_2": 298650.3,
            # Scope 3 data MISSING - facility didn't report
            "scope_3": None,  # MISSING
            "electricity_kwh": 1650000000,
            # Natural gas reported in cubic meters - NEEDS CONVERSION
            "natural_gas_m3": 125000000,  # cubic meters (different unit!)
            "process_gases_kg": {
                "NF3": 28000,
                "SF6": 7500,
                "C2F6": 4200
            },
            "data_quality": "Tier 2",
            "reporting_completeness": 0.68  # Poor data quality
        },
        {
            "facility_id": "FAB-004",
            "name": "Seoul Semiconductor Complex",
            "address": "157 Samsung-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do, South Korea",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 110000,
            "scope_1": 312450.8,
            "scope_2": 425680.2,
            "scope_3": 145230.5,
            "electricity_kwh": 2380000000,
            "natural_gas_therms": 1150000,
            "process_gases_kg": {
                "NF3": 42000,
                "SF6": 11500,
                "CF4": 8200,
                "CHF3": 5800,
                "C4F8": 3200
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.94
        },
        {
            "facility_id": "FAB-005",
            "name": "Dresden Wafer Fab (Germany)",
            "address": "Wilschdorfer Landstraße 101, 01109 Dresden, Germany",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 88000,
            # ALL emissions data MISSING - facility reporting delayed
            "scope_1": None,  # MISSING
            "scope_2": None,  # MISSING
            "scope_3": None,  # MISSING
            # Only energy data available
            "electricity_kwh": 1980000000,
            "natural_gas_therms": 850000,
            "process_gases_kg": {
                "NF3": 32000,
                "SF6": 8800
            },
            "data_quality": "Tier 3",  # Poor quality - needs estimation
            "reporting_completeness": 0.45  # Very incomplete
        },
        {
            "facility_id": "FAB-006",
            "name": "Singapore Advanced Packaging Facility",
            "address": "60 Woodlands Industrial Park D Street 2, Singapore 738406",
            "facility_type": "Backend (Packaging)",
            "status": "Operational",
            "wafer_capacity_monthly": None,  # N/A for packaging
            "scope_1": 42580.3,
            "scope_2": 156820.7,
            "scope_3": 67450.2,
            # Electricity in different unit again - GWh
            "electricity_gwh": 895.5,  # GWh (needs conversion to kWh!)
            "natural_gas_therms": 185000,
            "data_quality": "Tier 2",
            "reporting_completeness": 0.78
        },
        {
            "facility_id": "FAB-007",
            "name": "Shanghai Fab (China)",
            "address": "No. 999 Jinke Road, Pudong New Area, Shanghai, China",
            "facility_type": "Fab (200mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 72000,
            "scope_1": 198760.4,
            # Scope 2 uses location-based only - market-based MISSING
            "scope_2_location": 342580.6,
            "scope_2_market": None,  # MISSING - no renewable energy contracts
            "scope_2": 342580.6,  # Using location-based
            "scope_3": 89450.3,
            "electricity_kwh": 1850000000,
            # Natural gas in MMBtu - NEEDS CONVERSION
            "natural_gas_mmbtu": 8500000,  # MMBtu (different unit!)
            "process_gases_kg": {
                "NF3": 26500,
                "SF6": 7100,
                "CF4": 5800
            },
            "data_quality": "Tier 2",
            "reporting_completeness": 0.71
        },
        {
            "facility_id": "FAB-008",
            "name": "Austin Research & Development Fab",
            "address": "12100 Technology Blvd, Austin, TX 78759, USA",
            "facility_type": "R&D Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 25000,  # R&D - lower volume
            "scope_1": 78450.2,
            "scope_2": 125680.5,
            "scope_3": 45230.8,
            "electricity_kwh": 685000000,
            "natural_gas_therms": 325000,
            "process_gases_kg": {
                "NF3": 12000,
                "SF6": 3200,
                "CF4": 2800
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.89
        },
        {
            "facility_id": "FAB-009",
            "name": "Kumamoto Fab (Japan)",
            "address": "4-1-1 Nishiharamachi, Nishi-ku, Kumamoto, Japan",
            "facility_type": "Fab (300mm)",
            "status": "Under Construction",  # New facility - partial year data
            "wafer_capacity_monthly": 100000,  # Target capacity
            # Only 6 months of operational data (started July 2024)
            "operational_months": 6,
            "scope_1": 125680.3,  # Half year only
            "scope_2": 198450.7,  # Half year only
            "scope_3": 56780.2,   # Half year only
            "electricity_kwh": 1050000000,  # 6 months
            "natural_gas_therms": 450000,
            "process_gases_kg": {
                "NF3": 18500,
                "SF6": 5200
            },
            "data_quality": "Tier 2",
            "reporting_completeness": 0.55,  # Partial year
            "notes": "Facility operational from July 2024"
        },
        {
            "facility_id": "FAB-010",
            "name": "Bangalore Test & Validation Center",
            "address": "Electronics City Phase 1, Bangalore, Karnataka 560100, India",
            "facility_type": "Test/Validation",
            "status": "Operational",
            "wafer_capacity_monthly": None,  # N/A for test facility
            "scope_1": 12580.5,
            "scope_2": 68450.3,
            "scope_3": 28650.7,
            "electricity_kwh": 385000000,
            # Natural gas data MISSING
            "natural_gas_therms": None,  # MISSING
            "data_quality": "Tier 2",
            "reporting_completeness": 0.64
        },
        {
            "facility_id": "FAB-011",
            "name": "Leixlip Fab (Ireland)",
            "address": "Collinstown Industrial Park, Leixlip, Co. Kildare, Ireland",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 92000,
            "scope_1": 245680.7,
            "scope_2_location": 325450.8,
            "scope_2_market": 198650.3,  # Lower due to renewable energy
            "scope_2": 198650.3,  # Using market-based (company purchased RECs)
            "scope_3": 112340.5,
            "electricity_kwh": 1780000000,
            "renewable_electricity_kwh": 890000000,  # 50% renewable
            "natural_gas_therms": 920000,
            "process_gases_kg": {
                "NF3": 35000,
                "SF6": 9500,
                "CF4": 7200
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.96,  # Excellent data quality
            "recs_purchased_mwh": 890000  # Renewable Energy Certificates
        },
        {
            "facility_id": "FAB-012",
            "name": "Hillsboro D1X Fab (Oregon)",
            "address": "2501 NW 229th Ave, Hillsboro, OR 97124, USA",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 105000,
            "scope_1": 298450.6,
            "scope_2": 385670.2,
            "scope_3": 128950.4,
            "electricity_kwh": 2150000000,
            "natural_gas_therms": 1080000,
            "process_gases_kg": {
                "NF3": 40000,
                "SF6": 10800,
                "CF4": 7800,
                "CHF3": 5500
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.91
        },
        {
            "facility_id": "FAB-013",
            "name": "Penang Assembly & Test Facility (Malaysia)",
            "address": "Bayan Lepas Free Industrial Zone, 11900 Penang, Malaysia",
            "facility_type": "Backend (Assembly/Test)",
            "status": "Operational",
            "wafer_capacity_monthly": None,  # N/A
            "scope_1": 35680.4,
            # Scope 2 and 3 data quality issues - estimates used
            "scope_2": 145680.7,  # Estimated from electricity usage
            "scope_3": None,  # MISSING
            "electricity_kwh": 825000000,
            "natural_gas_therms": 145000,
            "data_quality": "Tier 3",  # Poor - mostly estimated
            "reporting_completeness": 0.52
        },
        {
            "facility_id": "FAB-014",
            "name": "Chandler Fab 42 (Arizona)",
            "address": "5000 W Chandler Blvd, Chandler, AZ 85226, USA",
            "facility_type": "Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 115000,
            "scope_1": 325680.9,
            "scope_2": 445760.3,
            "scope_3": 156780.6,
            "electricity_kwh": 2480000000,
            "natural_gas_therms": 1220000,
            "process_gases_kg": {
                "NF3": 44000,
                "SF6": 12200,
                "CF4": 8900,
                "CHF3": 6200,
                "C4F8": 3500
            },
            "data_quality": "Tier 1",
            "reporting_completeness": 0.93
        },
        {
            "facility_id": "FAB-015",
            "name": "Xian Memory Fab (China)",
            "address": "High-tech Zone, Xi'an, Shaanxi Province, China",
            "facility_type": "Memory Fab (300mm)",
            "status": "Operational",
            "wafer_capacity_monthly": 85000,
            # Data reported in different format - needs harmonization
            "emissions_data": {
                "scope_1_tons": 212450.8,
                "scope_2_tons": 298560.4,
                "scope_3_tons": 92350.6
            },
            "scope_1": 212450.8,
            "scope_2": 298560.4,
            "scope_3": 92350.6,
            "electricity_kwh": 1680000000,
            "natural_gas_therms": 780000,
            "process_gases_kg": {
                "NF3": 30000,
                "SF6": 8200
            },
            "data_quality": "Tier 2",
            "reporting_completeness": 0.73
        }
    ],

    # ===== RAW ACTIVITY DATA (NEEDS NORMALIZATION) =====
    # Different formats, units, completeness levels
    "activity_data_raw": [
        {
            "facility": "FAB-001",
            "category": "Stationary Combustion",
            "fuel_type": "Natural Gas",
            "consumption": 1250000,
            "unit": "therms",
            "months_reported": 12,
            "emission_factor": 0.0053,
            "ef_unit": "tons CO2e/therm",
            "data_source": "Utility bills",
            "data_quality_tier": 1
        },
        {
            "facility": "FAB-002",
            "category": "Stationary Combustion",
            "fuel_type": "Natural Gas",
            "consumption": 980000,
            "unit": "therms",
            "months_reported": 12,
            # Emission factor MISSING - needs default
            "emission_factor": None,  # MISSING
            "ef_unit": "tons CO2e/therm",
            "data_source": "Utility bills",
            "data_quality_tier": 2
        },
        {
            "facility": "FAB-003",
            "category": "Process Emissions",
            "gas_type": "NF3",
            "consumption": 28000,
            "unit": "kg",
            "months_reported": 12,
            "gwp": 16100,  # IPCC AR5
            # Abatement efficiency data available
            "abatement_efficiency": 0.85,  # 85% destroyed
            "actual_emissions_kg": 4200,  # After abatement
            "data_quality_tier": 1
        },
        {
            "facility": "FAB-004",
            "category": "Mobile Combustion",
            "vehicle_type": "Company Fleet",
            # Fuel consumption in GALLONS - needs conversion
            "diesel_gallons": 125000,
            "gasoline_gallons": 45000,
            "months_reported": 12,
            "emission_factor_diesel": 0.01023,
            "emission_factor_gasoline": 0.00887,
            "ef_unit": "tons CO2e/gallon",
            "data_quality_tier": 2
        },
        {
            "facility": "FAB-005",
            "category": "Electricity",
            # Data in MWh, needs conversion to kWh
            "electricity_consumption_mwh": 1980000,
            "unit": "MWh",
            "grid_region": "Germany (National Grid)",
            # Grid factor MISSING - needs lookup
            "grid_emission_factor": None,  # MISSING
            "ef_unit": "kg CO2e/MWh",
            "data_quality_tier": 3
        },
        {
            "facility": "FAB-006",
            "category": "Refrigerants",
            "refrigerant_type": "HFC-134a",
            # Amount in pounds - needs conversion to kg
            "amount_lbs": 2200,
            "unit": "pounds",
            "gwp": 1300,
            "leak_rate": 0.15,  # 15% annual leak rate
            "months_reported": 12,
            "data_quality_tier": 2
        },
        {
            "facility": "FAB-007",
            "category": "Process Emissions",
            "gas_type": "SF6",
            "consumption": 7100,
            "unit": "kg",
            # No abatement system at this facility
            "abatement_efficiency": 0.0,
            "actual_emissions_kg": 7100,
            "gwp": 23500,
            # Data from Q1-Q3 only, Q4 MISSING
            "months_reported": 9,  # Incomplete year
            "data_quality_tier": 3
        },
        {
            "facility": "FAB-011",
            "category": "Renewable Energy",
            "electricity_total_kwh": 1780000000,
            "renewable_electricity_kwh": 890000000,
            "renewable_percentage": 0.50,
            "rec_purchases_mwh": 890000,
            "rec_vintage": 2024,
            "rec_registry": "I-REC",
            # Market-based emission factor
            "residual_grid_factor": 0.425,
            "ef_unit": "kg CO2e/kWh",
            "data_quality_tier": 1
        }
    ],

    # ===== SCOPE 3 RAW DATA (HIGHLY INCOMPLETE) =====
    "scope_3_raw_data": {
        # Category 1: Purchased Goods and Services
        "category_1": {
            "method": "Spend-based",
            # Procurement data in USD millions
            "spend_data": [
                {"commodity": "Silicon wafers", "spend_usd_millions": 2850.5, "ef_available": True},
                {"commodity": "Chemicals", "spend_usd_millions": 1420.3, "ef_available": True},
                {"commodity": "Gases", "spend_usd_millions": 980.7, "ef_available": True},
                {"commodity": "Equipment", "spend_usd_millions": 5600.2, "ef_available": False},  # MISSING EF
                {"commodity": "Services", "spend_usd_millions": 1250.8, "ef_available": False}   # MISSING EF
            ],
            "total_emissions_estimate": 892450.6,  # Rough estimate
            "data_quality": "Tier 3",  # Poor - mostly spend-based
            "completeness": 0.60
        },

        # Category 2: Capital Goods
        "category_2": {
            # Missing methodology - excluded
            "status": "Excluded",
            "exclusion_rationale": "Capital goods emissions estimated at <2% of total Scope 3 based on peer company data. Excluded due to immateriality and data availability challenges.",
            "emissions": None
        },

        # Category 3: Fuel and Energy Related Activities
        "category_3": {
            "method": "Average-data",
            # Transmission & distribution losses
            "electricity_consumption_total_kwh": 25650000000,  # All facilities
            "td_loss_factor": 0.065,  # 6.5%
            # Upstream emissions from fuel production
            "natural_gas_upstream_factor": 0.0012,  # tons CO2e/therm
            "natural_gas_total_therms": 12500000,
            "total_emissions_estimate": 198650.4,
            "data_quality": "Tier 2",
            "completeness": 0.75
        },

        # Category 4: Upstream Transportation
        "category_4": {
            "method": "Distance-based",
            # Shipping data incomplete
            "data_available": False,
            "status": "Partially Estimated",
            "ton_km_estimate": 58000000,  # ton-kilometers
            "modal_split": {
                "ocean_freight_pct": 0.65,
                "air_freight_pct": 0.15,
                "truck_pct": 0.20
            },
            "total_emissions_estimate": 125680.3,
            "data_quality": "Tier 3",
            "completeness": 0.45  # Poor data
        },

        # Category 5: Waste
        "category_5": {
            "method": "Waste-type-specific",
            "waste_data": [
                {"type": "Hazardous chemical waste", "tons": 12500, "disposal": "Incineration"},
                {"type": "Non-hazardous solid waste", "tons": 45000, "disposal": "Landfill"},
                {"type": "Wastewater", "tons": None, "disposal": "Treatment"},  # MISSING quantity
                {"type": "Recyclables", "tons": 28000, "disposal": "Recycling"}
            ],
            "total_emissions_estimate": 45680.7,
            "data_quality": "Tier 2",
            "completeness": 0.68
        },

        # Category 6: Business Travel
        "category_6": {
            "method": "Distance-based",
            # Travel data from expense system
            "air_travel_km": 285000000,  # 285 million km
            "flight_class_breakdown": {
                "economy": 0.60,
                "business": 0.35,
                "first": 0.05
            },
            "hotel_nights": 125000,
            "rental_car_days": 45000,
            # Rail travel data MISSING
            "rail_data_available": False,
            "total_emissions_estimate": 89450.5,
            "data_quality": "Tier 2",
            "completeness": 0.72
        },

        # Category 7: Employee Commuting
        "category_7": {
            "method": "Average-data",
            "total_employees": 87500,
            "commute_survey_response_rate": 0.42,  # Poor response rate
            "avg_commute_distance_km": 28.5,
            "days_per_year": 220,
            "remote_work_percentage": 0.25,
            # Modal split estimates
            "modal_split": {
                "car_solo": 0.55,
                "car_carpool": 0.15,
                "public_transit": 0.20,
                "bike_walk": 0.10
            },
            "total_emissions_estimate": 78650.3,
            "data_quality": "Tier 3",
            "completeness": 0.50  # Low confidence
        },

        # Categories 8-15: Various statuses
        "category_8": {"status": "Not Applicable", "rationale": "Company owns all facilities"},
        "category_9": {"status": "Not Applicable", "rationale": "Products shipped FOB"},
        "category_10": {"status": "Not Applicable", "rationale": "Semiconductors - no processing by customers"},
        "category_11": {
            "status": "Partially Estimated",
            "method": "Use-phase energy consumption",
            "chips_sold_billions": 12.5,
            "avg_power_consumption_w": 65,
            # Extremely complex - rough estimate only
            "total_emissions_estimate": 2850000.0,  # HUGE number - needs review
            "data_quality": "Tier 4",  # Very poor
            "completeness": 0.25,
            "notes": "Highly uncertain - depends on customer usage patterns"
        },
        "category_12": {"status": "Excluded", "rationale": "Immaterial - <0.5% estimated"},
        "category_13": {"status": "Not Applicable"},
        "category_14": {"status": "Not Applicable"},
        "category_15": {
            "status": "Excluded",
            "rationale": "Financial investments in operating companies only - emissions already accounted in Scope 1&2"
        }
    },

    # ===== DATA QUALITY ISSUES LOG =====
    "data_quality_issues": [
        {
            "issue_id": "DQ-001",
            "facility": "FAB-001",
            "issue": "Missing Scope 1 emissions data",
            "impact": "High",
            "resolution": "Estimate from natural gas consumption using emission factors",
            "status": "Pending"
        },
        {
            "issue_id": "DQ-002",
            "facility": "FAB-003",
            "issue": "Natural gas reported in cubic meters, needs conversion",
            "impact": "Medium",
            "resolution": "Apply conversion factor 1 m³ = 0.0353 therms",
            "status": "Identified"
        },
        {
            "issue_id": "DQ-003",
            "facility": "FAB-005",
            "issue": "All emissions data missing - only energy data available",
            "impact": "Critical",
            "resolution": "Estimate all scopes from energy consumption using standard factors",
            "status": "Pending"
        },
        {
            "issue_id": "DQ-004",
            "facility": "Multiple",
            "issue": "Inconsistent units across facilities (kWh, MWh, GWh)",
            "impact": "Medium",
            "resolution": "Normalize all to kWh",
            "status": "Identified"
        },
        {
            "issue_id": "DQ-005",
            "facility": "FAB-007",
            "issue": "Only 9 months of data reported for Q4 missing",
            "impact": "Medium",
            "resolution": "Extrapolate Q4 based on Q1-Q3 average",
            "status": "Pending"
        },
        {
            "issue_id": "DQ-006",
            "facility": "FAB-009",
            "issue": "Partial year data (facility started mid-year)",
            "impact": "Low",
            "resolution": "Annualize data or report as partial year with note",
            "status": "Identified"
        },
        {
            "issue_id": "DQ-007",
            "category": "Scope 3 Category 11",
            "issue": "Use-phase emissions estimate has very high uncertainty",
            "impact": "High",
            "resolution": "Flag as Tier 4 data quality, consider excluding or using screening value",
            "status": "Under Review"
        },
        {
            "issue_id": "DQ-008",
            "facility": "FAB-013",
            "issue": "Scope 3 data completely missing",
            "impact": "Medium",
            "resolution": "Estimate based on facility type and revenue allocation",
            "status": "Pending"
        },
        {
            "issue_id": "DQ-009",
            "category": "Scope 3 Category 1",
            "issue": "Missing emission factors for Equipment and Services spend",
            "impact": "Medium",
            "resolution": "Use EPA EEIO sector-average factors",
            "status": "Identified"
        },
        {
            "issue_id": "DQ-010",
            "facility": "Multiple",
            "issue": "Process gas abatement efficiency data not consistently reported",
            "impact": "High",
            "resolution": "Request data from facilities or use conservative assumptions",
            "status": "Pending"
        }
    ],

    # ===== NORMALIZATION REQUIREMENTS =====
    "normalization_tasks": [
        "Convert all electricity units to kWh",
        "Convert natural gas units (therms, m³, MMBtu) to standard unit",
        "Fill missing Scope 1 data for FAB-001 using activity-based estimation",
        "Fill missing Scope 2/3 data for FAB-005 using grid factors and estimates",
        "Annualize FAB-009 partial year data",
        "Extrapolate FAB-007 Q4 data from Q1-Q3",
        "Calculate missing emission factors using EPA/DEFRA defaults",
        "Harmonize process gas emissions accounting for abatement",
        "Estimate missing Scope 3 Category 11 or exclude with rationale",
        "Fill missing Scope 3 data for FAB-003 and FAB-013",
        "Calculate total emissions after all normalizations",
        "Assign overall data quality score",
        "Generate data quality disclosure statement"
    ],

    # ===== BASE YEAR DATA (Also has quality issues) =====
    "base_year": 2020,
    "base_year_data": {
        "total_emissions": 3850600.0,  # Rough number
        "scope_1": 1285000.0,
        "scope_2": 1650000.0,
        "scope_3": 915600.0,
        "data_quality_note": "Base year data reconstructed from limited historical records",
        "recalculation_needed": True,
        "recalculation_reason": "Improved data collection methodologies implemented in 2023"
    },

    # Will be calculated after data normalization
    "calculated_totals": None,
    "overall_data_quality_score": None,
    "reporting_completeness": None
}


def get_complex_seed_data():
    """
    Returns the complex semiconductor company seed data.
    This data requires significant preprocessing and normalization.
    """
    return COMPLEX_SEED_DATA


if __name__ == "__main__":
    print("="*80)
    print("COMPLEX SEED DATA: Test Company Pet Ltd")
    print("Semiconductor Manufacturing - $250.8B Revenue")
    print("="*80)
    print(f"\nCompany: {COMPLEX_SEED_DATA['company_name']}")
    print(f"Industry: Semiconductor Manufacturing (NAICS {COMPLEX_SEED_DATA['naics_code']})")
    print(f"Facilities: {len(COMPLEX_SEED_DATA['facilities_raw'])} global locations")
    print(f"\nData Quality Issues Identified: {len(COMPLEX_SEED_DATA['data_quality_issues'])}")
    print(f"Normalization Tasks Required: {len(COMPLEX_SEED_DATA['normalization_tasks'])}")

    print("\n" + "="*80)
    print("DATA QUALITY ISSUES SUMMARY:")
    print("="*80)
    for issue in COMPLEX_SEED_DATA['data_quality_issues']:
        print(f"\n[{issue['issue_id']}] {issue['issue']}")
        print(f"  Impact: {issue['impact']}")
        print(f"  Resolution: {issue['resolution']}")

    print("\n" + "="*80)
    print("FACILITY DATA COMPLETENESS:")
    print("="*80)
    for fac in COMPLEX_SEED_DATA['facilities_raw']:
        completeness = fac.get('reporting_completeness', 0) * 100
        quality = fac.get('data_quality', 'Unknown')
        print(f"{fac['facility_id']:12} {fac['name']:45} {completeness:5.1f}% ({quality})")

    print("\n" + "="*80)
    print("This complex dataset requires preprocessing:")
    print("="*80)
    for i, task in enumerate(COMPLEX_SEED_DATA['normalization_tasks'], 1):
        print(f"{i:2}. {task}")
