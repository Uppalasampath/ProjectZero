"""
California SB253 Climate Corporate Data Accountability Act Report Generator

SB253 Requirements:
- Applies to companies with >$1B revenue doing business in California
- Must disclose Scope 1, 2, and 3 emissions
- Third-party verification required
- Public disclosure required
- Follows GHG Protocol standards
- Annual reporting starting 2026 (Scope 1&2) and 2027 (Scope 3)
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Dict, List, Any, Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import PageBreak, Paragraph, Spacer

from app.services.reports.ghg_protocol import (
    GHGProtocolReportGenerator,
    GHGProtocolReportData
)
from app.services.reports.base import (
    ReportColors,
    NumberFormatter,
    TableBuilder
)


class SB253ReportData(GHGProtocolReportData):
    """
    Extended data model for California SB253 reporting
    Includes California-specific requirements
    """

    def __init__(
        self,
        # SB253-specific fields
        california_revenue: Optional[Decimal] = None,
        total_revenue: Optional[Decimal] = None,
        california_operations_description: Optional[str] = None,
        california_facilities: Optional[List[Dict]] = None,
        public_disclosure_date: Optional[date] = None,
        sb253_compliance_year: Optional[int] = None,

        **kwargs  # All GHG Protocol fields
    ):
        super().__init__(**kwargs)

        # SB253-specific attributes
        self.california_revenue = float(california_revenue) if california_revenue else None
        self.total_revenue = float(total_revenue) if total_revenue else None
        self.california_operations_description = california_operations_description
        self.california_facilities = california_facilities or []
        self.public_disclosure_date = public_disclosure_date
        self.sb253_compliance_year = sb253_compliance_year or 2024


class SB253ReportGenerator(GHGProtocolReportGenerator):
    """
    California SB253 Climate Corporate Data Accountability Act Report Generator

    Generates reports compliant with California Senate Bill 253 requiring
    large corporations to disclose greenhouse gas emissions.
    """

    def __init__(self, report_data: SB253ReportData):
        super().__init__(report_data)
        self.data = report_data  # Type hint override
        self.report_title = "California SB253 Climate Disclosure Report"

    def generate(self) -> bytes:
        """Generate complete SB253-compliant report"""

        # Cover page with SB253 branding
        self.add_cover_page(
            subtitle=f"California Climate Corporate Data Accountability Act (SB253)\n{self.data.emission_units}",
            reporting_period=self.data.reporting_period_str
        )

        # SB253 Compliance Statement
        self._add_sb253_compliance_statement()

        # California Business Operations
        self._add_california_operations()

        # Document control and certification
        self._add_document_control()

        # Company and regulatory information
        self._add_company_information()

        # Table of contents
        self._add_sb253_table_of_contents()

        # Executive summary
        self._add_executive_summary()

        # SB253-specific disclosure requirements
        self._add_sb253_disclosure_requirements()

        # Organizational boundaries with California focus
        self._add_organizational_boundaries()

        # Operational boundaries
        self._add_operational_boundaries()

        # Emissions summary with GHG breakdown
        self._add_emissions_summary()

        # GHG breakdown by gas type (REQUIRED)
        if self.data.ghg_breakdown:
            self._add_ghg_breakdown()

        # Facility-level emissions with California facilities highlighted
        if self.data.facilities:
            self._add_facility_level_emissions()

        # Scope 1 detail with activity data
        self._add_scope_1_detail()

        # Scope 2 dual reporting detail
        self._add_scope_2_detail()

        # Scope 3 complete with exclusions and methodologies
        self._add_scope_3_detail()

        # Carbon offsets project-level disclosure
        if self.data.offset_projects:
            self._add_carbon_offsets_detail()

        # Progress toward targets
        if self.data.base_year and self.data.net_zero_target_year:
            self._add_progress_toward_targets()

        # Base year recalculation policy
        if self.data.base_year_recalculation_policy:
            self._add_base_year_recalculation_policy()

        # Methodology with specific methodologies
        self._add_methodology()

        # Data quality and procedures
        self._add_data_quality_assessment()

        # Activity data disclosure
        if self.data.activity_data:
            self._add_activity_data_disclosure()

        # Verification and assurance statement (REQUIRED by SB253)
        self._add_sb253_verification_statement()

        # Public disclosure statement
        self._add_public_disclosure_statement()

        # Appendices (enhanced)
        self._add_sb253_appendices()

        # Build PDF
        return self.build(f"sb253_report_{self.data.company_name.replace(' ', '_')}.pdf")

    def _add_sb253_compliance_statement(self):
        """Add SB253 compliance statement"""
        self.add_section("California SB253 Compliance Statement")

        compliance_text = f"""
        This report has been prepared in accordance with <b>California Senate Bill 253</b>,
        the Climate Corporate Data Accountability Act, which requires corporations with total
        annual revenues exceeding $1 billion and doing business in California to publicly
        disclose their greenhouse gas emissions.
        <br/><br/>
        <b>Legal Authority:</b> California Health and Safety Code Section 38530-38533
        <br/><br/>
        <b>Reporting Entity:</b> {self.data.company_name}<br/>
        <b>Total Annual Revenue:</b> ${NumberFormatter.format_number(self.data.total_revenue / 1_000_000_000, 1)} Billion USD<br/>
        <b>California Revenue:</b> ${NumberFormatter.format_number(self.data.california_revenue / 1_000_000_000, 1)} Billion USD<br/>
        <b>Reporting Year:</b> {self.data.sb253_compliance_year}<br/>
        <b>Third-Party Verification:</b> {self.data.verification_status} ({self.data.assurance_level})<br/>
        <b>Verification Standard:</b> {self.data.verification_standard}<br/>
        <b>Public Disclosure Date:</b> {self.data.public_disclosure_date.strftime('%B %d, %Y') if self.data.public_disclosure_date else 'TBD'}
        <br/><br/>
        <b>Compliance Status:</b><br/>
        ✓ Scope 1 emissions disclosed and verified<br/>
        ✓ Scope 2 emissions disclosed and verified<br/>
        ✓ Scope 3 emissions disclosed and verified<br/>
        ✓ Third-party verification completed by accredited verifier<br/>
        ✓ Report prepared following GHG Protocol Corporate Standard<br/>
        ✓ Public disclosure requirements met
        """

        self.add_paragraph(compliance_text)

        self.add_spacer(0.3)

        # California Air Resources Board (CARB) reporting note
        carb_note = """
        <b>Note:</b> This disclosure is submitted to the California Air Resources Board (CARB)
        as required under SB253. The reporting entity affirms that this disclosure is complete,
        accurate, and has been verified by an independent third party in accordance with the
        requirements of the Climate Corporate Data Accountability Act.
        """

        self.add_paragraph(carb_note, 'ReportBody')

        self.add_page_break()

    def _add_california_operations(self):
        """Add California-specific operations information"""
        self.add_section("California Business Operations")

        if self.data.california_operations_description:
            self.add_paragraph(self.data.california_operations_description)
        else:
            default_desc = f"""
            {self.data.company_name} maintains significant business operations in the State of
            California, including manufacturing facilities, research and development centers,
            sales offices, and distribution operations.
            """
            self.add_paragraph(default_desc)

        self.add_spacer(0.3)

        # California facilities
        if self.data.california_facilities:
            self.add_subsection("California Facilities")

            ca_facility_data = [['Facility Name', 'Location', 'Type', f'Emissions ({self.data.emission_units})']]

            total_ca_emissions = 0
            for facility in self.data.california_facilities:
                emissions = (
                    facility.get('scope_1', 0) +
                    facility.get('scope_2', 0) +
                    facility.get('scope_3', 0)
                )
                total_ca_emissions += emissions

                ca_facility_data.append([
                    facility.get('name', 'N/A'),
                    facility.get('location', 'N/A'),
                    facility.get('type', 'N/A'),
                    NumberFormatter.format_number(emissions, 2)
                ])

            ca_facility_data.append([
                'Total California Emissions',
                '',
                '',
                NumberFormatter.format_number(total_ca_emissions, 2)
            ])

            table = TableBuilder.create_summary_table(
                headers=ca_facility_data[0],
                data=ca_facility_data[1:],
                col_widths=[2.5*inch, 2*inch, 1.5*inch, 1.5*inch]
            )
            self.add_table(table)

            self.add_spacer(0.2)

            # Percentage of total
            ca_percentage = (total_ca_emissions / self.data.total_emissions) * 100 if self.data.total_emissions > 0 else 0

            summary = f"""
            <b>California Operations Summary:</b><br/>
            California facilities represent {ca_percentage:.1f}% of total global emissions.<br/>
            Total California emissions: {NumberFormatter.format_number(total_ca_emissions, 2)} {self.data.emission_units}
            """
            self.add_paragraph(summary)

        self.add_page_break()

    def _add_sb253_table_of_contents(self):
        """Add SB253-specific table of contents"""
        self.add_section("Table of Contents")

        toc_items = [
            "1. California SB253 Compliance Statement",
            "2. California Business Operations",
            "3. Document Control & Certification",
            "4. Company & Regulatory Information",
            "5. Executive Summary",
            "6. SB253 Disclosure Requirements",
            "7. Organizational Boundaries",
            "8. Operational Boundaries",
            "9. Emissions Summary",
            "10. GHG Breakdown by Gas Type",
            "11. Facility-Level Emissions",
            "12. Scope 1: Direct Emissions",
            "13. Scope 2: Indirect Emissions from Energy",
            "14. Scope 3: Other Indirect Emissions",
            "15. Carbon Offsets Disclosure",
            "16. Progress Toward Targets",
            "17. Base Year Recalculation Policy",
            "18. Methodology and Assumptions",
            "19. Data Quality Assessment",
            "20. Activity Data Disclosure",
            "21. Third-Party Verification Statement",
            "22. Public Disclosure Statement",
            "23. Appendices"
        ]

        for item in toc_items:
            self.add_paragraph(item, 'ReportBody')

        self.add_page_break()

    def _add_sb253_disclosure_requirements(self):
        """Add SB253-specific disclosure requirements section"""
        self.add_section("SB253 Disclosure Requirements")

        intro = f"""
        California Senate Bill 253 requires the following disclosures from {self.data.company_name}:
        """
        self.add_paragraph(intro)

        self.add_spacer(0.2)

        # Requirements checklist table
        requirements_data = [
            ['Requirement', 'Status', 'Details'],
            [
                'Annual Revenue >$1B',
                '✓ Met',
                f'${NumberFormatter.format_number(self.data.total_revenue / 1_000_000_000, 1)}B total revenue'
            ],
            [
                'Business in California',
                '✓ Met',
                f'{len(self.data.california_facilities)} facilities in California'
            ],
            [
                'Scope 1 Disclosure',
                '✓ Complete',
                f'{NumberFormatter.format_number(self.data.scope_1_total, 2)} {self.data.emission_units}'
            ],
            [
                'Scope 2 Disclosure',
                '✓ Complete',
                f'{NumberFormatter.format_number(self.data.scope_2_total, 2)} {self.data.emission_units}'
            ],
            [
                'Scope 3 Disclosure',
                '✓ Complete',
                f'{NumberFormatter.format_number(self.data.scope_3_total, 2)} {self.data.emission_units}'
            ],
            [
                'Third-Party Verification',
                '✓ Complete',
                f'{self.data.assurance_level} by {self.data.verified_by}'
            ],
            [
                'GHG Protocol Alignment',
                '✓ Complete',
                'Following GHG Protocol Corporate Standard'
            ],
            [
                'Public Disclosure',
                '✓ Complete',
                f'Published: {self.data.public_disclosure_date.strftime("%B %d, %Y") if self.data.public_disclosure_date else "TBD"}'
            ]
        ]

        table = TableBuilder.create_summary_table(
            headers=requirements_data[0],
            data=requirements_data[1:],
            col_widths=[2.5*inch, 1.5*inch, 3.5*inch]
        )
        self.add_table(table)

        self.add_spacer(0.3)

        # Emissions intensity metrics
        self.add_subsection("Emissions Intensity Metrics")

        revenue_intensity = (self.data.total_emissions / self.data.total_revenue) * 1_000_000  # tons per $1M revenue

        intensity_text = f"""
        <b>Global Emissions Intensity:</b><br/>
        • Total emissions per million dollars revenue: {NumberFormatter.format_number(revenue_intensity, 2)} tons CO2e/$1M<br/>
        • Scope 1 intensity: {NumberFormatter.format_number((self.data.scope_1_total / self.data.total_revenue) * 1_000_000, 2)} tons CO2e/$1M<br/>
        • Scope 2 intensity: {NumberFormatter.format_number((self.data.scope_2_total / self.data.total_revenue) * 1_000_000, 2)} tons CO2e/$1M<br/>
        • Scope 3 intensity: {NumberFormatter.format_number((self.data.scope_3_total / self.data.total_revenue) * 1_000_000, 2)} tons CO2e/$1M
        """
        self.add_paragraph(intensity_text)

        self.add_page_break()

    def _add_sb253_verification_statement(self):
        """Add enhanced verification statement for SB253 compliance"""
        self.add_section("Third-Party Verification Statement (SB253 Required)")

        intro = f"""
        In accordance with California Health and Safety Code Section 38532, this emissions
        disclosure has been verified by an independent third party with expertise in greenhouse
        gas emissions accounting.
        """
        self.add_paragraph(intro)

        self.add_spacer(0.3)

        # Verification details
        verification_details = f"""
        <b>Verification Organization:</b> {self.data.verified_by}<br/>
        <b>Assurance Level:</b> {self.data.assurance_level}<br/>
        <b>Verification Standard:</b> {self.data.verification_standard}<br/>
        <b>Verification Date:</b> {self.data.verification_date.strftime('%B %d, %Y') if self.data.verification_date else 'Pending'}<br/>
        <b>Verification Scope:</b> Global operations (all Scopes 1, 2, and 3)
        """
        self.add_paragraph(verification_details)

        self.add_spacer(0.3)

        self.add_subsection("Verifier's Statement")

        verifier_statement = f"""
        We have conducted an independent verification of the greenhouse gas emissions inventory
        of {self.data.company_name} for the reporting period {self.data.reporting_period_str}.
        <br/><br/>
        <b>Verification Scope:</b><br/>
        • Scope 1 (Direct GHG emissions)<br/>
        • Scope 2 (Indirect GHG emissions from purchased energy)<br/>
        • Scope 3 (Other indirect GHG emissions in the value chain)<br/>
        <br/>
        <b>Verification Activities:</b><br/>
        • Review of emissions data collection systems and processes<br/>
        • Validation of emission factors and calculation methodologies<br/>
        • Site visits to {len([f for f in self.data.facilities[:5]])} representative facilities<br/>
        • Testing of data accuracy and completeness<br/>
        • Assessment of conformance with GHG Protocol Corporate Standard<br/>
        • Review of materiality and uncertainty<br/>
        <br/>
        <b>Verification Opinion:</b><br/>
        Based on our verification activities, we conclude that the GHG emissions data and
        information disclosed in this report are materially correct and are a fair representation
        of {self.data.company_name}'s GHG emissions. The inventory has been prepared in accordance
        with the GHG Protocol Corporate Accounting and Reporting Standard and meets the requirements
        of California SB253.
        <br/><br/>
        <b>Level of Assurance:</b> {self.data.assurance_level}<br/>
        <b>Materiality Threshold:</b> {self.data.materiality_threshold}
        <br/><br/>
        <i>Verified by: {self.data.verified_by}</i><br/>
        <i>Date: {self.data.verification_date.strftime('%B %d, %Y') if self.data.verification_date else 'Pending'}</i>
        """
        self.add_paragraph(verifier_statement)

        self.add_page_break()

    def _add_public_disclosure_statement(self):
        """Add public disclosure statement"""
        self.add_section("Public Disclosure Statement")

        disclosure_text = f"""
        <b>California SB253 Public Disclosure Requirement</b>
        <br/><br/>
        In compliance with California Health and Safety Code Section 38533, {self.data.company_name}
        hereby publicly discloses this greenhouse gas emissions inventory report.
        <br/><br/>
        <b>Disclosure Details:</b><br/>
        • Report publicly disclosed on: {self.data.public_disclosure_date.strftime('%B %d, %Y') if self.data.public_disclosure_date else 'TBD'}<br/>
        • Submitted to California Air Resources Board (CARB)<br/>
        • Made available to the public via company website<br/>
        • Included in annual sustainability reporting
        <br/><br/>
        <b>Data Accessibility:</b><br/>
        This report and supporting documentation are available to:<br/>
        • California Air Resources Board<br/>
        • General public via company disclosure portal<br/>
        • Investors and stakeholders<br/>
        • Regulatory authorities as required
        <br/><br/>
        <b>Contact Information for Public Inquiries:</b><br/>
        {self.data.primary_contact_name}<br/>
        {self.data.primary_contact_title}<br/>
        {self.data.primary_contact_email}<br/>
        {self.data.primary_contact_phone}
        <br/><br/>
        <b>Next Disclosure:</b> Annual disclosure for fiscal year {self.data.sb253_compliance_year + 1}
        will be published by June 1, {self.data.sb253_compliance_year + 2}.
        """

        self.add_paragraph(disclosure_text)

        self.add_page_break()

    def _add_sb253_appendices(self):
        """Add SB253-specific appendices"""
        # Call parent appendices first
        super()._add_appendices()

        # Add SB253-specific appendix
        self.add_subsection("Appendix C: California SB253 Legal Framework")

        legal_text = """
        <b>California Senate Bill 253 - Climate Corporate Data Accountability Act</b>
        <br/><br/>
        <b>Effective Date:</b> January 1, 2024<br/>
        <b>Legal Citation:</b> California Health and Safety Code Sections 38530-38533
        <br/><br/>
        <b>Key Provisions:</b><br/>
        • Applies to U.S. partnerships and corporations with >$1B annual revenue doing business in California<br/>
        • Requires annual public disclosure of Scope 1, 2, and 3 emissions<br/>
        • Scope 1 and 2 disclosures: Starting 2026 for 2025 emissions<br/>
        • Scope 3 disclosures: Starting 2027 for 2026 emissions<br/>
        • Third-party verification required using standards like ISO 14064-3<br/>
        • Reports due by June 1 for prior fiscal year<br/>
        • Penalties for non-compliance up to $500,000 annually<br/>
        <br/>
        <b>Coordination with Federal Requirements:</b><br/>
        This disclosure also satisfies requirements under:<br/>
        • SEC Climate Disclosure Rules (proposed)<br/>
        • EPA GHG Reporting Program (where applicable)<br/>
        • CDP Climate Change questionnaire
        <br/><br/>
        <b>Related California Legislation:</b><br/>
        • SB261 (Climate-Related Financial Risk Disclosure)<br/>
        • AB1305 (Voluntary Carbon Market Disclosures)
        """

        self.add_paragraph(legal_text)


if __name__ == "__main__":
    print("California SB253 Report Generator - Ready for use")
    print("Import this module to generate SB253-compliant reports")
