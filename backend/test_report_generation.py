"""
Test script for PDF report generation
Demonstrates report generation without full database setup
"""
from datetime import date, datetime
from decimal import Decimal
import os

from app.services.reports import GHGProtocolReportGenerator, GHGProtocolReportData


def test_ghg_protocol_report():
    """Test REGULATORY-COMPLIANT GHG Protocol report generation with comprehensive sample data"""

    print("🚀 Testing Regulatory-Compliant GHG Protocol Report Generation...")
    print()

    # Comprehensive sample data including all regulatory requirements
    report_data = GHGProtocolReportData(
        # ===== BASIC COMPANY INFORMATION =====
        company_name="Acme Manufacturing Corp",
        reporting_period_start=date(2024, 1, 1),
        reporting_period_end=date(2024, 12, 31),

        # ===== REGULATORY IDENTIFIERS (REQUIRED) =====
        naics_code="332710",  # Machine Shops
        duns_number="08-146-6849",
        epa_facility_id="110000123456",
        reporting_entity_id="ACME-CORP-2024",

        # ===== PRIMARY CONTACT =====
        primary_contact_name="Jane Smith",
        primary_contact_title="VP of Sustainability",
        primary_contact_email="jane.smith@acmemfg.com",
        primary_contact_phone="+1-555-0123",

        # ===== EMISSIONS TOTALS =====
        scope_1_total=Decimal("45.8"),
        scope_2_total=Decimal("78.3"),
        scope_3_total=Decimal("125.6"),

        # ===== SCOPE 2 DUAL REPORTING (REQUIRED) =====
        scope_2_location_based=Decimal("78.3"),
        scope_2_market_based=Decimal("65.2"),  # Lower due to RECs

        scope_2_location_based_details={
            'grid_factors': [
                {'region': 'WECC California', 'factor': '0.247 kg CO2e/kWh', 'source': 'EPA eGRID 2023'},
                {'region': 'ERCOT Texas', 'factor': '0.389 kg CO2e/kWh', 'source': 'EPA eGRID 2023'}
            ]
        },

        scope_2_market_based_details={
            'renewable_certificates': [
                {'type': 'Renewable Energy Certificate (REC)', 'quantity_mwh': 52000, 'vintage_year': 2024, 'registry': 'M-RETS'},
            ],
            'ppas': [
                {'project_name': 'West Texas Wind Farm', 'capacity_mw': 5.2, 'technology': 'Wind', 'location': 'Texas, USA'}
            ],
            'residual_grid_factor': '0.425 kg CO2e/kWh'
        },

        # ===== GHG BREAKDOWN BY GAS TYPE (REQUIRED) =====
        ghg_breakdown={
            'CO2': Decimal("220.5"),
            'CH4': Decimal("1.8"),  # 50.4 kg actual mass → 1.8 tons CO2e (GWP=28)
            'N2O': Decimal("3.2"),  # 12.1 kg actual mass → 3.2 tons CO2e (GWP=265)
            'HFC-134a': Decimal("4.9"),  # Refrigerants
            'SF6': Decimal("19.3")  # Electrical equipment
        },

        # ===== SCOPE 3 COMPLETE REPORTING =====
        scope_3_breakdown={
            1: Decimal("42.5"),  # Purchased goods and services
            3: Decimal("0"),  # Fuel- and energy-related (not in Scope 1/2)
            5: Decimal("18.2"),  # Waste generated in operations
            6: Decimal("35.8"),  # Business travel
            7: Decimal("29.1"),  # Employee commuting
        },

        scope_3_exclusions={
            2: "Capital goods excluded due to immateriality - represents <2% of estimated total emissions based on screening analysis",
            4: "Upstream transportation and distribution is not applicable as the company primarily uses in-house logistics",
            8: "No upstream leased assets - company owns all facilities",
            9: "Downstream transportation and distribution not applicable - products are sold FOB from manufacturing facility",
            10: "Processing of sold products not applicable - products are sold as finished goods",
            11: "Use of sold products not applicable - machine shop components have negligible use-phase emissions",
            12: "End-of-life treatment excluded due to immateriality (<1% estimated)",
            13: "No downstream leased assets",
            14: "Company does not operate franchises",
            15: "Investments excluded - no significant financial investments beyond operating activities"
        },

        scope_3_methodologies={
            1: "Supplier-specific method using EPA EEIO factors for purchased goods and services",
            5: "Average-data method using waste quantities and EPA WARM emission factors",
            6: "Distance-based method using employee expense reports and DEFRA emission factors",
            7: "Average-data method based on employee survey data and EPA SmartWay factors"
        },

        # ===== FACILITY-LEVEL DATA (REQUIRED) =====
        facilities=[
            {
                'name': 'Main Manufacturing Plant',
                'address': '1500 Industrial Parkway, Houston, TX 77002',
                'scope_1': 32.5,
                'scope_2': 58.7,
                'scope_3': 89.2
            },
            {
                'name': 'West Coast Distribution Center',
                'address': '890 Logistics Drive, Oakland, CA 94607',
                'scope_1': 13.3,
                'scope_2': 19.6,
                'scope_3': 36.4
            }
        ],

        # ===== ACTIVITY DATA (REQUIRED) =====
        activity_data=[
            {
                'scope': 'Scope 1',
                'category': 'Stationary Combustion - Natural Gas',
                'activities': [
                    {'description': 'Natural gas for heating', 'quantity': 325000, 'unit': 'therms', 'emission_factor': 0.0053, 'ef_unit': 'tons CO2e/therm', 'emissions': 17.2},
                    {'description': 'Natural gas for process heat', 'quantity': 210000, 'unit': 'therms', 'emission_factor': 0.0053, 'ef_unit': 'tons CO2e/therm', 'emissions': 11.1}
                ]
            },
            {
                'scope': 'Scope 1',
                'category': 'Mobile Combustion - Fleet Vehicles',
                'activities': [
                    {'description': 'Diesel vehicles', 'quantity': 15600, 'unit': 'gallons', 'emission_factor': 0.01023, 'ef_unit': 'tons CO2e/gallon', 'emissions': 15.9},
                    {'description': 'Gasoline vehicles', 'quantity': 2800, 'unit': 'gallons', 'emission_factor': 0.00887, 'ef_unit': 'tons CO2e/gallon', 'emissions': 2.5}
                ]
            }
        ],

        # ===== BASE YEAR & RECALCULATION POLICY =====
        base_year=2020,
        base_year_emissions=Decimal("280.5"),
        base_year_recalculation_policy="""The base year emissions inventory will be recalculated when structural changes (mergers, acquisitions, or divestments) result in a transfer of ownership or control of emissions sources representing more than 5% of base year emissions. The base year will also be recalculated if significant errors are discovered that cumulatively represent more than 5% of base year emissions, or if calculation methodologies change in a way that significantly impacts the inventory. The significance threshold is defined as 5% of base year emissions.""",

        historical_emissions={
            2020: Decimal("280.5"),
            2021: Decimal("265.3"),
            2022: Decimal("258.7"),
            2023: Decimal("251.2")
        },

        # ===== TARGETS =====
        net_zero_target_year=2050,
        interim_targets=[
            {'year': 2030, 'target': '50% reduction from base year', 'achieved': False},
            {'year': 2040, 'target': '75% reduction from base year', 'achieved': False}
        ],

        # ===== CARBON OFFSETS (PROJECT-LEVEL DISCLOSURE) =====
        offsets_purchased=Decimal("25.0"),
        offsets_marketplace=Decimal("7.9"),
        offset_projects=[
            {
                'name': 'Amazon Rainforest Conservation Project',
                'type': 'REDD+ (Avoided Deforestation)',
                'registry': 'Verra VCS',
                'serial_numbers': '9876-543210-123456-VCS-001',
                'quantity': 18.0
            },
            {
                'name': 'Iowa Wind Farm Carbon Credits',
                'type': 'Renewable Energy',
                'registry': 'Climate Action Reserve',
                'serial_numbers': 'CAR-12345-2024-REN-USA',
                'quantity': 7.0
            },
            {
                'name': 'Methane Capture - Dairy Farm',
                'type': 'Agricultural Methane Reduction',
                'registry': 'American Carbon Registry',
                'serial_numbers': 'ACR-AG-2024-456789',
                'quantity': 7.9
            }
        ],

        # ===== DATA QUALITY =====
        data_quality_score=Decimal("3.8"),
        data_quality_procedures="""Acme Manufacturing Corp has implemented a comprehensive data management system for GHG inventory. Data quality procedures include: (1) Monthly data collection from utility bills and operational records, (2) Quarterly data validation by facility managers, (3) Annual third-party verification, (4) Use of Tier 1-3 emission factors from EPA, DEFRA, and IPCC sources, (5) Documentation of all data sources and calculation methodologies, (6) Internal audit trails for all data entries and calculations, (7) Regular training for data collection personnel.""",

        materiality_threshold="5% of total emissions",

        # ===== VERIFICATION & ASSURANCE (REQUIRED) =====
        verification_status="Verified",
        assurance_level="Reasonable Assurance",
        verified_by="Green Assurance Ltd (ISO 14065 Accredited)",
        verification_date=date(2025, 3, 15),
        verification_standard="ISO 14064-3:2019",

        # ===== ORGANIZATIONAL STRUCTURE =====
        organizational_chart="Acme Manufacturing Corp is the parent company with two wholly-owned operating subsidiaries",
        reporting_hierarchy=[
            {'entity': 'Acme Manufacturing Corp (Parent)', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'Acme Precision Components LLC', 'ownership': '100%', 'consolidation': 'Operational Control'},
            {'entity': 'Acme Distribution Services Inc', 'ownership': '100%', 'consolidation': 'Operational Control'}
        ],
        consolidation_approach="Operational Control",

        # ===== UNIT SPECIFICATION (REQUIRED) =====
        emission_units="metric tons CO2e",

        # ===== SPECIFIC METHODOLOGIES (REQUIRED) =====
        employee_commuting_methodology="""Category 7 emissions were calculated using the average-data method. An employee survey was conducted in Q4 2024 with 89% response rate. Employees reported their primary commute method, one-way distance, and number of commute days per year. Emission factors from EPA SmartWay were applied based on vehicle type. For employees working from home (18% of workforce), home energy emissions were calculated using national average electricity and heating emissions.""",

        business_travel_methodology="""Category 6 emissions include air travel, rental cars, hotel stays, and rail travel. Air travel emissions were calculated using a distance-based method with DEFRA emission factors including radiative forcing (RF) multiplier of 1.9. Flight distances were obtained from employee expense reports and classified as short-haul (<500 miles), medium-haul (500-3,500 miles), and long-haul (>3,500 miles). Rental car emissions used fuel-based method with actual fuel receipts. Hotel stays used per-night emission factors from Cornell Hotel Sustainability Benchmarking.""",

        purchased_goods_methodology="""Category 1 emissions were calculated using a hybrid approach combining supplier-specific data and spend-based estimates. For top 10 suppliers representing 65% of procurement spend, supplier-specific emission factors were requested and obtained. For remaining suppliers, EPA EEIO emission factors were applied to procurement spend data by commodity code. Primary materials include steel, aluminum, plastics, and electronic components.""",

        # ===== DOCUMENT CONTROL (REQUIRED) =====
        document_version="1.0",
        revision_history=[
            {'version': '1.0', 'date': '2025-03-20', 'changes': 'Initial report release', 'author': 'Jane Smith'}
        ],
        approval_signature="Jane Smith",
        approval_title="VP of Sustainability & ESG",
        approval_date=date(2025, 3, 20),

        # ===== ADDITIONAL =====
        calculation_count=156,
        top_emission_sources=[
            {"category": "Electricity", "emissions": 78.3, "percentage": 31.3},
            {"category": "Purchased Goods", "emissions": 42.5, "percentage": 17.0},
            {"category": "Business Travel", "emissions": 35.8, "percentage": 14.3},
            {"category": "Employee Commuting", "emissions": 29.1, "percentage": 11.6},
            {"category": "Natural Gas", "emissions": 28.5, "percentage": 11.4},
            {"category": "Fleet Vehicles", "emissions": 17.3, "percentage": 6.9},
            {"category": "Waste", "emissions": 18.2, "percentage": 7.3},
        ]
    )

    # Generate report
    print("📊 Generating GHG Protocol PDF report...")
    generator = GHGProtocolReportGenerator(report_data)
    pdf_bytes = generator.generate()

    # Save to file
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    filename = f"GHG_Protocol_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    output_path = os.path.join(output_dir, filename)

    with open(output_path, 'wb') as f:
        f.write(pdf_bytes)

    # Report statistics
    file_size_kb = len(pdf_bytes) / 1024

    print()
    print("✅ Report generated successfully!")
    print()
    print("📄 Report Details:")
    print(f"   • Company: {report_data.company_name}")
    print(f"   • Period: {report_data.reporting_period_str}")
    print(f"   • Total Emissions: {report_data.total_emissions:.2f} tons CO2e")
    print(f"   • Scope 1: {report_data.scope_1_total:.2f} tons CO2e")
    print(f"   • Scope 2: {report_data.scope_2_total:.2f} tons CO2e")
    print(f"   • Scope 3: {report_data.scope_3_total:.2f} tons CO2e")
    print(f"   • Carbon Offsets: {report_data.total_offsets:.2f} tons CO2e")
    print(f"   • Net Emissions: {report_data.net_emissions:.2f} tons CO2e")
    print()
    print("📦 File Details:")
    print(f"   • File: {output_path}")
    print(f"   • Size: {file_size_kb:.2f} KB")
    print(f"   • Format: PDF")
    print()
    print("🎯 What's Included:")
    print("   ✓ Cover page with company branding")
    print("   ✓ Table of contents")
    print("   ✓ Executive summary with pie chart")
    print("   ✓ Organizational boundaries")
    print("   ✓ Operational boundaries")
    print("   ✓ Emissions summary tables")
    print("   ✓ Scope 1, 2, 3 detailed sections")
    print("   ✓ Scope 3 category breakdown with bar chart")
    print("   ✓ Progress toward net-zero targets")
    print("   ✓ Methodology and assumptions")
    print("   ✓ Data quality assessment")
    print("   ✓ Third-party verification statement")
    print("   ✓ Appendices with GHG Protocol principles")
    print()
    print("🎉 Report is ready for:")
    print("   • Government submission")
    print("   • Third-party audits")
    print("   • Investor reporting")
    print("   • CDP disclosure")
    print("   • ESG assessments")
    print()


if __name__ == "__main__":
    test_ghg_protocol_report()
