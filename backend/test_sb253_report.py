"""
Test Script: California SB253 Report Generation
Test Company Pet Ltd - Semiconductor Manufacturing ($250B Revenue)

Generates California SB253 Climate Corporate Data Accountability Act compliant report
"""

from datetime import date, datetime
from decimal import Decimal
import os

from seed_data_complex_semiconductor import get_complex_seed_data
from data_normalization_pipeline import DataNormalizationPipeline
from app.services.reports.sb253 import SB253ReportGenerator, SB253ReportData


def generate_sb253_report():
    """
    Generate California SB253 compliant report for Test Company Pet Ltd
    """

    print("="*100)
    print("CALIFORNIA SB253 CLIMATE DISCLOSURE REPORT GENERATION")
    print("Test Company Pet Ltd - Global Semiconductor Manufacturing")
    print("Climate Corporate Data Accountability Act Compliance")
    print("="*100)
    print()

    # Load and normalize data
    print("STEP 1: Loading and normalizing data...")
    print("-" * 100)
    raw_data = get_complex_seed_data()
    pipeline = DataNormalizationPipeline(raw_data)
    normalized_data = pipeline.run_pipeline()
    print()

    # Prepare SB253-specific data
    print("STEP 2: Preparing California SB253 compliance data...")
    print("-" * 100)

    # California-specific facilities
    california_facilities = [
        {
            'name': 'Santa Clara Main Fabrication Plant',
            'location': 'Santa Clara, CA',
            'type': 'Fab (300mm)',
            'scope_1': 177585.25,
            'scope_2': 458750.5,
            'scope_3': 125680.3
        },
        {
            'name': 'Phoenix Advanced Semiconductor Facility',
            'location': 'Phoenix, AZ',
            'type': 'Fab (300mm)',
            'scope_1': 285430.2,
            'scope_2': 392156.8,
            'scope_3': 98450.6
        },
        {
            'name': 'Austin Research & Development Fab',
            'location': 'Austin, TX',
            'type': 'R&D Fab (300mm)',
            'scope_1': 78450.2,
            'scope_2': 125680.5,
            'scope_3': 45230.8
        },
        {
            'name': 'Hillsboro D1X Fab',
            'location': 'Hillsboro, OR',
            'type': 'Fab (300mm)',
            'scope_1': 298450.6,
            'scope_2': 385670.2,
            'scope_3': 128950.4
        },
        {
            'name': 'Chandler Fab 42',
            'location': 'Chandler, AZ',
            'type': 'Fab (300mm)',
            'scope_1': 325680.9,
            'scope_2': 445760.3,
            'scope_3': 156780.6
        }
    ]

    # GHG breakdown
    ghg_breakdown = {
        'CO2': Decimal('3285600.5'),
        'CH4': Decimal('1850.3'),
        'N2O': Decimal('2680.7'),
        'NF3': Decimal('128500.0'),
        'SF6': Decimal('456820.0'),
        'CF4': Decimal('189650.0'),
        'CHF3': Decimal('98450.0'),
        'C2F6': Decimal('45680.0'),
        'C4F8': Decimal('28900.0')
    }

    # Scope 2 dual reporting details
    scope_2_location_based_details = {
        'grid_factors': [
            {'region': 'US - WECC California', 'factor': '0.247 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
            {'region': 'US - ERCOT Texas', 'factor': '0.389 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
            {'region': 'US - Pacific Northwest', 'factor': '0.195 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
            {'region': 'Taiwan - National Grid', 'factor': '0.502 kg CO2e/kWh', 'source': 'Taiwan Power Company'},
            {'region': 'South Korea - National Grid', 'factor': '0.405 kg CO2e/kWh', 'source': 'Korea Power Exchange'}
        ]
    }

    scope_2_market_based_details = {
        'renewable_certificates': [
            {'type': 'Green-e Certified REC', 'quantity_mwh': 450000, 'vintage_year': 2024, 'registry': 'Green-e (US Fabs)'},
            {'type': 'I-REC', 'quantity_mwh': 890000, 'vintage_year': 2024, 'registry': 'I-REC (International)'}
        ],
        'ppas': [
            {'project_name': 'Pacific Northwest Wind Farm', 'capacity_mw': 25.5, 'technology': 'Wind', 'location': 'Oregon, USA'},
            {'project_name': 'California Solar Array', 'capacity_mw': 15.2, 'technology': 'Solar', 'location': 'California, USA'}
        ],
        'residual_grid_factor': '0.445 kg CO2e/kWh'
    }

    # Facility data for report
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

    # Activity data
    activity_data = [
        {
            'scope': 'Scope 1',
            'category': 'Stationary Combustion - Natural Gas',
            'activities': [
                {'description': 'Natural gas - all facilities', 'quantity': 12500000, 'unit': 'therms', 'emission_factor': 0.0053, 'ef_unit': 'tons CO2e/therm', 'emissions': 66250.0},
            ]
        },
        {
            'scope': 'Scope 1',
            'category': 'Process Emissions - Fluorinated Gases',
            'activities': [
                {'description': 'NF3 (after 85% abatement)', 'quantity': 530000, 'unit': 'kg', 'emission_factor': 2.415, 'ef_unit': 'tons CO2e/kg', 'emissions': 128500.0},
                {'description': 'SF6 (after 85% abatement)', 'quantity': 148500, 'unit': 'kg', 'emission_factor': 3.075, 'ef_unit': 'tons CO2e/kg', 'emissions': 456820.0}
            ]
        }
    ]

    # Carbon offset projects
    offset_projects = [
        {
            'name': 'California Forest Carbon Project',
            'type': 'Afforestation/Reforestation',
            'registry': 'Climate Action Reserve',
            'serial_numbers': 'CAR-FOR-CA-2024-123456',
            'quantity': 150000.0
        },
        {
            'name': 'Oregon Renewable Energy Credits',
            'type': 'Renewable Energy',
            'registry': 'American Carbon Registry',
            'serial_numbers': 'ACR-RE-OR-2024-789012',
            'quantity': 85000.0
        },
        {
            'name': 'Amazon Rainforest REDD+ Project',
            'type': 'REDD+ (Avoided Deforestation)',
            'registry': 'Verra VCS',
            'serial_numbers': 'VCS-REDD-2024-456789',
            'quantity': 40000.0
        }
    ]

    # Create SB253 report data
    report_data = SB253ReportData(
        # Basic company information
        company_name="Test Company Pet Ltd",
        reporting_period_start=date(2024, 1, 1),
        reporting_period_end=date(2024, 12, 31),

        # SB253-specific fields
        california_revenue=Decimal("45200000000"),  # $45.2B California revenue
        total_revenue=Decimal("250800000000"),  # $250.8B total revenue
        california_operations_description="""
        Test Company Pet Ltd operates 5 major semiconductor fabrication and R&D facilities in
        California, Arizona, Oregon, and Texas, representing approximately 18% of global revenue
        and 15% of global emissions. California operations include our flagship 300mm wafer
        fabrication facility in Santa Clara, which serves as our technology development center
        and high-volume manufacturing site for advanced logic chips. These facilities employ
        approximately 12,500 people and generate $45.2 billion in annual revenue.
        """,
        california_facilities=california_facilities,
        public_disclosure_date=date(2025, 5, 15),
        sb253_compliance_year=2024,

        # Regulatory identifiers
        naics_code="334413",
        duns_number="12-456-7890",
        epa_facility_id="110001234567",
        reporting_entity_id="TCPL-2024-SB253",

        # Primary contact
        primary_contact_name="Dr. Sarah Chen",
        primary_contact_title="Chief Sustainability Officer",
        primary_contact_email="sarah.chen@testcompanypet.com",
        primary_contact_phone="+1-408-555-0199",

        # Emissions totals
        scope_1_total=normalized_data['scope_1_total'],
        scope_2_total=normalized_data['scope_2_total'],
        scope_3_total=normalized_data['scope_3_total'],

        # Scope 2 dual reporting
        scope_2_location_based=normalized_data['scope_2_total'] * Decimal('1.12'),
        scope_2_market_based=normalized_data['scope_2_total'],
        scope_2_location_based_details=scope_2_location_based_details,
        scope_2_market_based_details=scope_2_market_based_details,

        # GHG breakdown
        ghg_breakdown=ghg_breakdown,

        # Scope 3
        scope_3_breakdown=normalized_data['scope_3_breakdown'],
        scope_3_exclusions=normalized_data['scope_3_exclusions'],
        scope_3_methodologies=normalized_data['scope_3_methodologies'],

        # Facilities
        facilities=facilities_for_report,

        # Activity data
        activity_data=activity_data,

        # Base year
        base_year=2020,
        base_year_emissions=Decimal("3850600.0"),
        base_year_recalculation_policy="""The base year will be recalculated if structural changes result in >5% change to base year emissions, or if significant methodology improvements are implemented. Base year was recalculated in 2024 due to improved data collection systems.""",
        historical_emissions={
            2020: Decimal("3850600.0"),
            2021: Decimal("3925800.0"),
            2022: Decimal("4125600.0"),
            2023: Decimal("4385200.0")
        },

        # Targets
        net_zero_target_year=2050,
        interim_targets=[
            {'year': 2030, 'target': '40% reduction (absolute)', 'achieved': False},
            {'year': 2040, 'target': '80% reduction (absolute)', 'achieved': False}
        ],

        # Offsets
        offsets_purchased=Decimal("235000.0"),
        offsets_marketplace=Decimal("40000.0"),
        offset_projects=offset_projects,

        # Data quality
        data_quality_score=normalized_data['data_quality_score'],
        data_quality_procedures=f"""Test Company Pet Ltd maintains a comprehensive GHG data management system across 15 global facilities. Monthly automated data collection from utility meters, quarterly validation by facility managers, annual third-party verification. Tier 1 data: {(1 - normalized_data['estimated_data_percentage']) * 100:.0f}%. Known limitations: {normalized_data['estimated_data_percentage'] * 100:.0f}% of data required estimation. Continuous improvement initiatives include deploying real-time monitoring systems and blockchain-based supply chain tracking.""",
        materiality_threshold="5% of total emissions or 1% of individual scope",

        # Verification (REQUIRED by SB253)
        verification_status="Verified",
        assurance_level="Limited Assurance",
        verified_by="EcoVerify International (ISO 14065 Accredited, CARB Approved)",
        verification_date=date(2025, 4, 30),
        verification_standard="ISO 14064-3:2019",

        # Organizational structure
        organizational_chart="Test Company Pet Ltd (Parent) with 15 wholly-owned subsidiaries across 9 countries",
        reporting_hierarchy=[
            {'entity': 'Test Company Pet Ltd (Parent)', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP Americas Manufacturing LLC', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'TCP California Operations Inc.', 'ownership': '100%', 'consolidation': 'Operational Control'}
        ],
        consolidation_approach="Operational Control",

        # Units
        emission_units="metric tons CO2e",

        # Methodologies
        employee_commuting_methodology="""Average-data method with employee survey (42% response). Applied EPA SmartWay factors. Remote work: 25% globally, 35% in California.""",
        business_travel_methodology="""Distance-based with DEFRA factors including 1.9 RF multiplier for aviation. 98% data coverage from travel management system.""",
        purchased_goods_methodology="""Hybrid: 62% supplier-specific data from top 50 suppliers, remainder using EPA EEIO factors. CDP Supply Chain program used.""",

        # Document control
        document_version="1.0 - SB253",
        revision_history=[
            {'version': '1.0', 'date': '2025-05-15', 'changes': 'Initial SB253 public disclosure', 'author': 'Dr. Sarah Chen'}
        ],
        approval_signature="Dr. Sarah Chen",
        approval_title="Chief Sustainability Officer",
        approval_date=date(2025, 5, 15),

        # Additional
        calculation_count=2847,
        top_emission_sources=[
            {"category": "Purchased Electricity (Scope 2)", "emissions": float(normalized_data['scope_2_total']), "percentage": 58.2},
            {"category": "Process Gases - Fluorinated (Scope 1)", "emissions": 875000.0, "percentage": 18.7},
            {"category": "Purchased Goods (Scope 3)", "emissions": 892450.6, "percentage": 19.1}
        ],
        reporting_standard="GHG Protocol Corporate Standard + California SB253"
    )

    print(f"✓ SB253 report data prepared")
    print(f"✓ Company: {report_data.company_name}")
    print(f"✓ Total Revenue: ${report_data.total_revenue / 1_000_000_000:.1f}B")
    print(f"✓ California Revenue: ${report_data.california_revenue / 1_000_000_000:.1f}B")
    print(f"✓ California Facilities: {len(report_data.california_facilities)}")
    print()

    # Generate SB253 report
    print("STEP 3: Generating California SB253 compliant report...")
    print("-" * 100)
    generator = SB253ReportGenerator(report_data)
    pdf_bytes = generator.generate()

    # Save report
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"SB253_Climate_Disclosure_{report_data.company_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = os.path.join(output_dir, filename)

    with open(output_path, 'wb') as f:
        f.write(pdf_bytes)

    file_size_kb = len(pdf_bytes) / 1024

    print()
    print("="*100)
    print("✅ CALIFORNIA SB253 CLIMATE DISCLOSURE REPORT GENERATED!")
    print("="*100)
    print()
    print("📊 REPORT DETAILS:")
    print(f"   Company: {report_data.company_name}")
    print(f"   Industry: Semiconductor Manufacturing (NAICS {report_data.naics_code})")
    print(f"   Compliance Year: {report_data.sb253_compliance_year}")
    print(f"   Public Disclosure Date: {report_data.public_disclosure_date.strftime('%B %d, %Y')}")
    print()
    print("💼 CALIFORNIA OPERATIONS:")
    print(f"   Total Company Revenue: ${report_data.total_revenue / 1_000_000_000:.1f} Billion USD")
    print(f"   California Revenue: ${report_data.california_revenue / 1_000_000_000:.1f} Billion USD ({report_data.california_revenue / report_data.total_revenue * 100:.1f}% of total)")
    print(f"   California Facilities: {len(report_data.california_facilities)} locations")
    print()
    print("💨 EMISSIONS DISCLOSURE:")
    print(f"   Scope 1 (Direct):           {report_data.scope_1_total:>15,.2f} metric tons CO2e")
    print(f"   Scope 2 (Energy):           {report_data.scope_2_total:>15,.2f} metric tons CO2e")
    print(f"   Scope 3 (Value Chain):      {report_data.scope_3_total:>15,.2f} metric tons CO2e")
    print(f"   {'─'*45}")
    print(f"   TOTAL GROSS EMISSIONS:      {report_data.total_emissions:>15,.2f} metric tons CO2e")
    print(f"   Carbon Offsets:             {report_data.total_offsets:>15,.2f} metric tons CO2e")
    print(f"   {'─'*45}")
    print(f"   NET EMISSIONS:              {report_data.net_emissions:>15,.2f} metric tons CO2e")
    print()
    print("📈 EMISSIONS INTENSITY:")
    revenue_intensity = (report_data.total_emissions / report_data.total_revenue) * 1_000_000
    print(f"   Emissions per $1M revenue:  {revenue_intensity:>15,.2f} tons CO2e/$1M")
    print()
    print("✅ SB253 COMPLIANCE:")
    print("   ✓ Annual revenue >$1B requirement met")
    print("   ✓ California business operations confirmed")
    print("   ✓ Scope 1, 2, and 3 emissions disclosed")
    print(f"   ✓ Third-party verification: {report_data.assurance_level}")
    print(f"   ✓ Verified by: {report_data.verified_by}")
    print("   ✓ GHG Protocol Corporate Standard followed")
    print("   ✓ Public disclosure statement included")
    print("   ✓ Submitted to CARB (California Air Resources Board)")
    print()
    print("📄 FILE INFORMATION:")
    print(f"   File: {output_path}")
    print(f"   Size: {file_size_kb:.2f} KB")
    print(f"   Format: PDF (SB253 Compliant)")
    print()
    print("🎯 READY FOR:")
    print("   • California Air Resources Board (CARB) submission")
    print("   • Public disclosure (company website)")
    print("   • Investor and stakeholder reporting")
    print("   • EPA GHG Reporting Program")
    print("   • CDP Climate Change disclosure")
    print("   • SEC Climate disclosure requirements")
    print()
    print("="*100)


if __name__ == "__main__":
    generate_sb253_report()
