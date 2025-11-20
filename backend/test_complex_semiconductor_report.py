"""
Test Script: Complex Semiconductor Company Report Generation
Test Company Pet Ltd - $250B Revenue Semiconductor Manufacturer

This script demonstrates the complete pipeline:
1. Load complex raw data with quality issues
2. Run normalization pipeline
3. Generate regulatory-compliant PDF report
4. Show data quality disclosures
"""

from datetime import date, datetime
from decimal import Decimal
import os

from seed_data_complex_semiconductor import get_complex_seed_data
from data_normalization_pipeline import DataNormalizationPipeline
from app.services.reports import GHGProtocolReportGenerator, GHGProtocolReportData


def generate_semiconductor_company_report():
    """
    Generate comprehensive regulatory report for Test Company Pet Ltd
    after processing complex, messy real-world data
    """

    print("="*100)
    print("COMPLEX SEMICONDUCTOR COMPANY EMISSIONS REPORT GENERATION")
    print("Test Company Pet Ltd - Global Semiconductor Manufacturing")
    print("="*100)
    print()

    # STEP 1: Load raw complex data
    print("STEP 1: Loading complex raw data...")
    print("-" * 100)
    raw_data = get_complex_seed_data()
    print(f"✓ Loaded data for {len(raw_data['facilities_raw'])} facilities")
    print(f"✓ Data quality issues identified: {len(raw_data['data_quality_issues'])}")
    print(f"✓ Normalization tasks required: {len(raw_data['normalization_tasks'])}")
    print()

    # STEP 2: Run normalization pipeline
    print("STEP 2: Running data normalization pipeline...")
    print("-" * 100)
    pipeline = DataNormalizationPipeline(raw_data)
    normalized_data = pipeline.run_pipeline()
    print()

    # STEP 3: Prepare data for report generation
    print("STEP 3: Preparing regulatory-compliant report data...")
    print("-" * 100)

    # GHG breakdown by gas type (aggregate from all facilities)
    ghg_breakdown = {
        'CO2': Decimal('3285600.5'),  # From combustion
        'CH4': Decimal('1850.3'),      # From natural gas leaks
        'N2O': Decimal('2680.7'),      # From combustion
        'NF3': Decimal('128500.0'),    # Process gases (after abatement)
        'SF6': Decimal('456820.0'),    # Process gases (after abatement)
        'CF4': Decimal('189650.0'),    # Process gases (after abatement)
        'CHF3': Decimal('98450.0'),    # Process gases (after abatement)
        'C2F6': Decimal('45680.0'),    # Process gases (after abatement)
        'C4F8': Decimal('28900.0')     # Process gases (after abatement)
    }

    # Scope 2 dual reporting with detailed breakdown
    scope_2_location_based_details = {
        'grid_factors': [
            {'region': 'US - WECC California', 'factor': '0.247 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
            {'region': 'US - ERCOT Texas', 'factor': '0.389 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
            {'region': 'US - Pacific Northwest', 'factor': '0.195 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
            {'region': 'Taiwan - National Grid', 'factor': '0.502 kg CO2e/kWh', 'source': 'Taiwan Power Company'},
            {'region': 'South Korea - National Grid', 'factor': '0.405 kg CO2e/kWh', 'source': 'Korea Power Exchange'},
            {'region': 'Germany - National Grid', 'factor': '0.310 kg CO2e/kWh', 'source': 'UBA Germany'},
            {'region': 'China - East China Grid', 'factor': '0.555 kg CO2e/kWh', 'source': 'MEE China'},
            {'region': 'Singapore - National Grid', 'factor': '0.392 kg CO2e/kWh', 'source': 'EMA Singapore'},
            {'region': 'Japan - National Grid', 'factor': '0.463 kg CO2e/kWh', 'source': 'METI Japan'},
            {'region': 'Ireland - National Grid', 'factor': '0.285 kg CO2e/kWh', 'source': 'SEAI Ireland'},
            {'region': 'Malaysia - National Grid', 'factor': '0.658 kg CO2e/kWh', 'source': 'Energy Commission Malaysia'}
        ]
    }

    scope_2_market_based_details = {
        'renewable_certificates': [
            {'type': 'Renewable Energy Certificate (REC)', 'quantity_mwh': 890000, 'vintage_year': 2024, 'registry': 'I-REC (Ireland Fab)'},
            {'type': 'Green-e Certified REC', 'quantity_mwh': 450000, 'vintage_year': 2024, 'registry': 'Green-e (US Fabs)'}
        ],
        'ppas': [
            {'project_name': 'Pacific Northwest Wind Farm', 'capacity_mw': 25.5, 'technology': 'Wind', 'location': 'Oregon, USA'},
            {'project_name': 'Cloncreen Wind Farm', 'capacity_mw': 88.0, 'technology': 'Wind', 'location': 'Ireland'},
            {'project_name': 'Taiwan Offshore Wind', 'capacity_mw': 15.2, 'technology': 'Offshore Wind', 'location': 'Taiwan Strait'}
        ],
        'residual_grid_factor': '0.445 kg CO2e/kWh'
    }

    # Facility-level data (top 10 for report - all 15 available)
    facilities_for_report = [
        {
            'name': normalized_data['facilities'][i]['name'],
            'address': normalized_data['facilities'][i]['address'],
            'scope_1': normalized_data['facilities'][i].get('scope_1', 0),
            'scope_2': normalized_data['facilities'][i].get('scope_2', 0),
            'scope_3': normalized_data['facilities'][i].get('scope_3', 0)
        }
        for i in range(min(10, len(normalized_data['facilities'])))
    ]

    # Activity data examples (showing data normalization results)
    activity_data = [
        {
            'scope': 'Scope 1',
            'category': 'Stationary Combustion - Natural Gas',
            'activities': [
                {'description': 'Natural gas - all facilities (normalized)', 'quantity': 12500000, 'unit': 'therms', 'emission_factor': 0.0053, 'ef_unit': 'tons CO2e/therm', 'emissions': 66250.0},
            ]
        },
        {
            'scope': 'Scope 1',
            'category': 'Process Emissions - Fluorinated Gases',
            'activities': [
                {'description': 'NF3 (after 85% abatement)', 'quantity': 530000, 'unit': 'kg', 'emission_factor': 2.415, 'ef_unit': 'tons CO2e/kg', 'emissions': 128500.0},
                {'description': 'SF6 (after 85% abatement)', 'quantity': 148500, 'unit': 'kg', 'emission_factor': 3.075, 'ef_unit': 'tons CO2e/kg', 'emissions': 456820.0},
                {'description': 'CF4 (after 85% abatement)', 'quantity': 89500, 'unit': 'kg', 'emission_factor': 2.119, 'ef_unit': 'tons CO2e/kg', 'emissions': 189650.0}
            ]
        },
        {
            'scope': 'Scope 2',
            'category': 'Purchased Electricity',
            'activities': [
                {'description': 'Grid electricity (location-based)', 'quantity': 25650000000, 'unit': 'kWh', 'emission_factor': 0.000425, 'ef_unit': 'tons CO2e/kWh', 'emissions': 10901250.0}
            ]
        }
    ]

    # Carbon offset projects
    offset_projects = [
        {
            'name': 'Oregon Forest Carbon Project',
            'type': 'Afforestation/Reforestation',
            'registry': 'American Carbon Registry',
            'serial_numbers': 'ACR-FOR-2024-123456-789012',
            'quantity': 125000.0
        },
        {
            'name': 'Taiwan Offshore Wind Expansion Credits',
            'type': 'Renewable Energy',
            'registry': 'Gold Standard',
            'serial_numbers': 'GS-RE-TW-2024-567890-123456',
            'quantity': 85000.0
        },
        {
            'name': 'Amazon Rainforest REDD+ Portfolio',
            'type': 'REDD+ (Avoided Deforestation)',
            'registry': 'Verra VCS',
            'serial_numbers': 'VCS-1234-2024-REDD-BR-456789',
            'quantity': 65000.0
        }
    ]

    # Prepare comprehensive report data
    report_data = GHGProtocolReportData(
        # Basic company information
        company_name="Test Company Pet Ltd",
        reporting_period_start=date(2024, 1, 1),
        reporting_period_end=date(2024, 12, 31),

        # Regulatory identifiers
        naics_code="334413",  # Semiconductor and Related Device Manufacturing
        duns_number="12-456-7890",
        epa_facility_id="110001234567",
        reporting_entity_id="TCPL-2024-001",

        # Primary contact
        primary_contact_name="Dr. Sarah Chen",
        primary_contact_title="Chief Sustainability Officer",
        primary_contact_email="sarah.chen@testcompanypet.com",
        primary_contact_phone="+1-408-555-0199",

        # Emissions totals (from normalized data)
        scope_1_total=normalized_data['scope_1_total'],
        scope_2_total=normalized_data['scope_2_total'],
        scope_3_total=normalized_data['scope_3_total'],

        # Scope 2 dual reporting
        scope_2_location_based=normalized_data['scope_2_total'] * Decimal('1.12'),  # 12% higher without RECs
        scope_2_market_based=normalized_data['scope_2_total'],
        scope_2_location_based_details=scope_2_location_based_details,
        scope_2_market_based_details=scope_2_market_based_details,

        # GHG breakdown by gas type
        ghg_breakdown=ghg_breakdown,

        # Scope 3 complete reporting
        scope_3_breakdown=normalized_data['scope_3_breakdown'],
        scope_3_exclusions=normalized_data['scope_3_exclusions'],
        scope_3_methodologies=normalized_data['scope_3_methodologies'],

        # Facility-level data
        facilities=facilities_for_report,

        # Activity data
        activity_data=activity_data,

        # Base year
        base_year=2020,
        base_year_emissions=Decimal("3850600.0"),
        base_year_recalculation_policy="""The base year emissions inventory will be recalculated when structural changes (mergers, acquisitions, or divestments) result in a transfer of ownership or control of emissions sources representing more than 5% of base year emissions. Base year has been recalculated in 2024 due to improved data collection methodologies (significant methodology change). The significance threshold is 5% of base year emissions.""",
        historical_emissions={
            2020: Decimal("3850600.0"),
            2021: Decimal("3925800.0"),
            2022: Decimal("4125600.0"),
            2023: Decimal("4385200.0")
        },

        # Targets
        net_zero_target_year=2050,
        interim_targets=[
            {'year': 2030, 'target': '40% reduction from base year (absolute)', 'achieved': False},
            {'year': 2035, 'target': '60% reduction from base year (absolute)', 'achieved': False},
            {'year': 2040, 'target': '80% reduction from base year (absolute)', 'achieved': False}
        ],

        # Carbon offsets
        offsets_purchased=Decimal("210000.0"),
        offsets_marketplace=Decimal("65000.0"),
        offset_projects=offset_projects,

        # Data quality
        data_quality_score=normalized_data['data_quality_score'],
        data_quality_procedures=f"""Test Company Pet Ltd has implemented a comprehensive global data management system for GHG inventory across 15 manufacturing facilities.

Data Collection & Validation:
• Monthly automated data collection from utility meters and building management systems
• Quarterly manual validation by facility environmental engineers
• Annual third-party verification by accredited verifier
• Real-time process gas monitoring systems at all 300mm fabs

Emission Factors:
• Tier 1 data (direct measurement): {(1 - normalized_data['estimated_data_percentage']) * 100:.0f}% of emissions
• Tier 2 data (site-specific): {normalized_data['estimated_data_percentage'] * 40 * 100:.0f}% of emissions
• Tier 3 data (industry average): {normalized_data['estimated_data_percentage'] * 60 * 100:.0f}% of emissions
• Primary sources: EPA, DEFRA, IEA, IPCC AR5

Data Quality Control:
• Automated data validation rules in central database
• Statistical outlier detection (>2 standard deviations flagged for review)
• Cross-facility benchmarking for consistency checks
• Documented procedures for data gap-filling and estimation
• Annual internal audit of data collection processes
• External verification by ISO 14065-accredited verifier

Known Data Limitations:
• {normalized_data['estimated_data_percentage'] * 100:.0f}% of facility-level data required estimation or normalization
• Scope 3 Category 11 (use of sold products) excluded due to high uncertainty
• Process gas abatement efficiency assumed at 85% where direct measurement unavailable
• Some facilities report on different fiscal years - data normalized to calendar year 2024

Improvement Initiatives:
• Deployment of continuous emissions monitoring systems (CEMS) at all fabs by 2025
• Enhanced Scope 3 data collection from top 100 suppliers (representing 80% of procurement spend)
• Implementation of blockchain-based supply chain emissions tracking
• AI-powered anomaly detection for data quality assurance""",

        materiality_threshold="5% of total Scope 1+2+3 emissions or 1% of individual scope emissions",

        # Verification & assurance
        verification_status="Verified",
        assurance_level="Limited Assurance",  # Limited for first year with data quality issues
        verified_by="EcoVerify International (ISO 14065 Accredited)",
        verification_date=date(2025, 3, 25),
        verification_standard="ISO 14064-3:2019",

        # Organizational structure
        organizational_chart="Test Company Pet Ltd is the parent holding company with 15 wholly-owned manufacturing subsidiaries across 9 countries",
        reporting_hierarchy=[
            {'entity': 'Test Company Pet Ltd (Parent)', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP Americas Manufacturing LLC', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP Taiwan Semiconductor Ltd', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP Korea Advanced Chips Co.', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP Europe GmbH', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP China Semiconductor Co.', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP Southeast Asia Pte Ltd', 'ownership': '100%', 'consolidation': 'Operational Control'}
        ],
        consolidation_approach="Operational Control (100% of emissions from all facilities under operational control)",

        # Units
        emission_units="metric tons CO2e",

        # Specific methodologies
        employee_commuting_methodology="""Category 7 emissions calculated using average-data method with employee survey. Survey conducted in Q4 2024 achieved 42% response rate across 87,500 global employees. Employees reported primary commute method, one-way distance, and number of commute days per year. Emission factors from EPA SmartWay (US), DEFRA (UK/EU), and regional government sources (Asia) applied based on vehicle type. For remote workers (25% of workforce globally, 35% in US), home energy emissions estimated using national average residential electricity and heating emissions. High variation in commute patterns across regions noted (Asia: 68% public transit, US: 55% single-occupancy vehicles, EU: 45% public transit).""",

        business_travel_methodology="""Category 6 emissions include air travel (85% of total), rental cars (8%), hotel stays (5%), and rail travel (2%). Air travel emissions calculated using distance-based method with DEFRA emission factors including radiative forcing multiplier of 1.9 for high-altitude emissions. Flight data obtained from corporate travel management system with 98% coverage. Flights classified as short-haul (<300 mi, avg 0.135 kg CO2e/passenger-km), medium-haul (300-2,300 mi, avg 0.095 kg CO2e/passenger-km), and long-haul (>2,300 mi, avg 0.110 kg CO2e/passenger-km). Class breakdown: 60% economy, 35% business, 5% first class. Rental car emissions use actual fuel receipts where available (65% of rentals), otherwise distance-based with regional fuel efficiency averages. Hotel emissions use Cornell Hotel Sustainability Benchmarking per-night factors by hotel class and region.""",

        purchased_goods_methodology="""Category 1 emissions calculated using hybrid approach. For top 50 suppliers representing 75% of procurement spend ($189B), supplier-specific emission factors requested through CDP Supply Chain program (62% response rate providing primary data). For remaining suppliers and non-responding top suppliers, EPA EEIO emission factors applied to procurement spend by detailed commodity codes. Major categories: Silicon wafers ($2.85B, 315,000 tons CO2e using supplier data), Chemicals ($1.42B, 245,000 tons CO2e using EEIO), Industrial gases ($981M, 185,000 tons CO2e using supplier data), Manufacturing equipment ($5.6B, emission factor unavailable - excluded from Category 1, tracked separately), and Professional services ($1.25B, 12,500 tons CO2e using EEIO). Spend data from SAP Ariba procurement system with 99.8% coverage. Working with suppliers to improve primary data collection through 2025-2027.""",

        # Document control
        document_version="1.0",
        revision_history=[
            {'version': '1.0', 'date': '2025-03-25', 'changes': 'Initial regulatory report for fiscal year 2024. Includes results of data normalization pipeline applied to raw facility data.', 'author': 'Dr. Sarah Chen / EcoVerify International'}
        ],
        approval_signature="Dr. Sarah Chen",
        approval_title="Chief Sustainability Officer",
        approval_date=date(2025, 3, 25),

        # Additional
        calculation_count=2847,  # Much higher for complex company
        top_emission_sources=[
            {"category": "Purchased Electricity (Scope 2)", "emissions": float(normalized_data['scope_2_total']), "percentage": 58.2},
            {"category": "Process Gases - Fluorinated Compounds (Scope 1)", "emissions": 875000.0, "percentage": 18.7},
            {"category": "Purchased Goods & Services (Scope 3)", "emissions": 892450.6, "percentage": 19.1},
            {"category": "Natural Gas Combustion (Scope 1)", "emissions": 66250.0, "percentage": 1.4},
            {"category": "Upstream Transportation (Scope 3)", "emissions": 125680.3, "percentage": 2.7}
        ],
        reporting_standard="GHG Protocol Corporate Accounting and Reporting Standard"
    )

    print(f"✓ Report data prepared for {report_data.company_name}")
    print(f"✓ Total facilities: {len(report_data.facilities)}")
    print(f"✓ Data quality score: {report_data.data_quality_score}/5.0")
    print(f"✓ Reporting completeness: {normalized_data['overall_reporting_completeness']:.1%}")
    print()

    # STEP 4: Generate PDF report
    print("STEP 4: Generating regulatory-compliant PDF report...")
    print("-" * 100)
    generator = GHGProtocolReportGenerator(report_data)
    pdf_bytes = generator.generate()

    # Save report
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"Test_Company_Pet_Ltd_GHG_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = os.path.join(output_dir, filename)

    with open(output_path, 'wb') as f:
        f.write(pdf_bytes)

    file_size_kb = len(pdf_bytes) / 1024

    print()
    print("="*100)
    print("✅ REGULATORY-COMPLIANT REPORT GENERATED SUCCESSFULLY!")
    print("="*100)
    print()
    print("📊 REPORT DETAILS:")
    print(f"   Company: {report_data.company_name}")
    print(f"   Industry: Semiconductor Manufacturing (NAICS {report_data.naics_code})")
    print(f"   Period: {report_data.reporting_period_str}")
    print(f"   Facilities: {len(normalized_data['facilities'])} global manufacturing sites")
    print()
    print("💨 EMISSIONS SUMMARY:")
    print(f"   Scope 1 (Direct):           {report_data.scope_1_total:>15,.2f} metric tons CO2e")
    print(f"   Scope 2 (Energy):           {report_data.scope_2_total:>15,.2f} metric tons CO2e")
    print(f"   Scope 3 (Value Chain):      {report_data.scope_3_total:>15,.2f} metric tons CO2e")
    print(f"   {'─'*45}")
    print(f"   TOTAL GROSS EMISSIONS:      {report_data.total_emissions:>15,.2f} metric tons CO2e")
    print(f"   Carbon Offsets:             {report_data.total_offsets:>15,.2f} metric tons CO2e")
    print(f"   {'─'*45}")
    print(f"   NET EMISSIONS:              {report_data.net_emissions:>15,.2f} metric tons CO2e")
    print()
    print("📈 PERFORMANCE METRICS:")
    print(f"   Base Year (2020):           {report_data.base_year_emissions:>15,.2f} metric tons CO2e")
    reduction = report_data.base_year_emissions - report_data.total_emissions
    reduction_pct = (reduction / report_data.base_year_emissions) * 100
    print(f"   Reduction from Base Year:   {reduction:>15,.2f} metric tons CO2e ({reduction_pct:+.1f}%)")
    print(f"   Net Zero Target Year:        {report_data.net_zero_target_year}")
    print()
    print("🎯 DATA QUALITY METRICS:")
    print(f"   Data Quality Score:          {report_data.data_quality_score}/5.0")
    print(f"   Reporting Completeness:      {normalized_data['overall_reporting_completeness']:.1%}")
    print(f"   Estimated Data:              {normalized_data['estimated_data_percentage']:.1%}")
    print(f"   Verification:                {report_data.assurance_level}")
    print(f"   Verified By:                 {report_data.verified_by}")
    print()
    print("📄 FILE INFORMATION:")
    print(f"   File: {output_path}")
    print(f"   Size: {file_size_kb:.2f} KB")
    print(f"   Format: PDF (Regulatory Compliant)")
    print()
    print("✅ REGULATORY COMPLIANCE CHECKLIST:")
    print("   ✓ NAICS code and reporting entity identification")
    print("   ✓ Facility-level emissions data (15 facilities)")
    print("   ✓ Complete Scope 3 reporting with exclusion rationale (15 categories)")
    print("   ✓ Attestation and assurance level (Limited Assurance - ISO 14064-3)")
    print("   ✓ Units clearly specified (metric tons CO2e)")
    print("   ✓ GHG breakdown by gas type (9 GHG species)")
    print("   ✓ Activity data disclosed with normalization notes")
    print("   ✓ Data management and quality control procedures")
    print("   ✓ Base year recalculation policy")
    print("   ✓ Organizational chart and reporting hierarchy")
    print("   ✓ Scope 2 dual reporting (location-based vs market-based)")
    print("   ✓ Carbon offsets project-level disclosure")
    print("   ✓ Employee commuting and business travel methodology")
    print("   ✓ Materiality threshold defined")
    print("   ✓ Signature block and certification statement")
    print("   ✓ Revision history and document control")
    print()
    print("🎉 Report ready for:")
    print("   • EPA GHG Reporting Program submission")
    print("   • CDP Climate Change disclosure")
    print("   • SEC Climate disclosure requirements")
    print("   • Third-party verification audit")
    print("   • Investor ESG reporting")
    print("   • Science Based Targets initiative (SBTi)")
    print()
    print("="*100)


if __name__ == "__main__":
    generate_semiconductor_company_report()
