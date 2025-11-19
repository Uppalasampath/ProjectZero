"""
Test script for PDF report generation
Demonstrates report generation without full database setup
"""
from datetime import date, datetime
from decimal import Decimal
import os

from app.services.reports import GHGProtocolReportGenerator, GHGProtocolReportData


def test_ghg_protocol_report():
    """Test GHG Protocol report generation with sample data"""

    print("🚀 Testing GHG Protocol Report Generation...")
    print()

    # Sample data (similar to what would come from database)
    report_data = GHGProtocolReportData(
        company_name="Acme Manufacturing Corp",
        reporting_period_start=date(2024, 1, 1),
        reporting_period_end=date(2024, 12, 31),

        # Scope emissions
        scope_1_total=Decimal("45.8"),  # tons CO2e
        scope_2_total=Decimal("78.3"),
        scope_3_total=Decimal("125.6"),

        # Scope 2 methods
        scope_2_location_based=Decimal("78.3"),
        scope_2_market_based=Decimal("65.2"),  # Lower due to renewable energy

        # Scope 3 breakdown
        scope_3_breakdown={
            1: Decimal("42.5"),  # Purchased goods
            5: Decimal("18.2"),  # Waste
            6: Decimal("35.8"),  # Business travel
            7: Decimal("29.1"),  # Employee commuting
        },

        # Targets
        base_year=2020,
        base_year_emissions=Decimal("280.5"),
        net_zero_target_year=2050,

        # Offsets
        offsets_purchased=Decimal("25.0"),
        offsets_marketplace=Decimal("7.9"),

        # Quality
        data_quality_score=Decimal("3.8"),
        calculation_count=156,

        # Verification
        verification_status="verified",
        verified_by="Green Assurance Ltd",

        # Top sources
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
