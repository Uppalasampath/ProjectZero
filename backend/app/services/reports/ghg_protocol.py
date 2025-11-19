"""
GHG Protocol Corporate Standard Report Generator
Generates audit-ready emissions inventory reports
"""
from typing import Dict, List, Optional
from decimal import Decimal
from datetime import date, datetime
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, KeepTogether

from .base import (
    BaseReportGenerator,
    ReportColors,
    NumberFormatter,
    ChartGenerator,
    TableBuilder
)


class GHGProtocolReportData:
    """Data structure for GHG Protocol report - Regulatory Compliant"""

    def __init__(
        self,
        # Basic Company Information
        company_name: str,
        reporting_period_start: date,
        reporting_period_end: date,

        # Regulatory Identifiers (REQUIRED)
        naics_code: Optional[str] = None,
        duns_number: Optional[str] = None,
        epa_facility_id: Optional[str] = None,
        reporting_entity_id: Optional[str] = None,

        # Contact Information
        primary_contact_name: Optional[str] = None,
        primary_contact_title: Optional[str] = None,
        primary_contact_email: Optional[str] = None,
        primary_contact_phone: Optional[str] = None,

        # Emissions Totals
        scope_1_total: Decimal = Decimal('0'),
        scope_2_total: Decimal = Decimal('0'),
        scope_3_total: Decimal = Decimal('0'),

        # Scope 2 Dual Reporting (REQUIRED)
        scope_2_location_based: Optional[Decimal] = None,
        scope_2_market_based: Optional[Decimal] = None,
        scope_2_location_based_details: Optional[Dict] = None,  # Grid factors, sources
        scope_2_market_based_details: Optional[Dict] = None,    # RECs, PPAs

        # GHG Breakdown by Gas Type (REQUIRED)
        ghg_breakdown: Optional[Dict[str, Decimal]] = None,  # CO2, CH4, N2O, HFCs, PFCs, SF6, NF3

        # Scope 3 Complete Reporting
        scope_3_breakdown: Optional[Dict[int, Decimal]] = None,
        scope_3_exclusions: Optional[Dict[int, str]] = None,  # Rationale for excluded categories
        scope_3_methodologies: Optional[Dict[int, str]] = None,  # Method for each category

        # Facility-Level Data (REQUIRED for EPA)
        facilities: Optional[List[Dict]] = None,  # Each facility with address, emissions

        # Activity Data (REQUIRED)
        activity_data: Optional[List[Dict]] = None,  # Detailed activity data tables

        # Base Year and Historical Data
        base_year: Optional[int] = None,
        base_year_emissions: Optional[Decimal] = None,
        base_year_recalculation_policy: Optional[str] = None,  # REQUIRED
        historical_emissions: Optional[Dict[int, Decimal]] = None,  # Year: emissions

        # Targets and Progress
        net_zero_target_year: Optional[int] = None,
        interim_targets: Optional[List[Dict]] = None,  # Year, target, achieved

        # Carbon Offsets (REQUIRED project-level disclosure)
        offsets_purchased: Optional[Decimal] = None,
        offsets_marketplace: Optional[Decimal] = None,
        offset_projects: Optional[List[Dict]] = None,  # Project name, type, registry, serial numbers

        # Data Quality
        data_quality_score: Optional[Decimal] = None,
        data_quality_procedures: Optional[str] = None,  # REQUIRED
        materiality_threshold: Optional[str] = None,  # REQUIRED (e.g., "5% of total emissions")

        # Verification and Assurance (REQUIRED)
        verification_status: Optional[str] = None,
        assurance_level: Optional[str] = None,  # Limited, Reasonable, None
        verified_by: Optional[str] = None,
        verification_date: Optional[date] = None,
        verification_standard: Optional[str] = None,  # ISO 14064-3, AA1000AS, etc.

        # Organizational Structure
        organizational_chart: Optional[str] = None,  # Description or path to chart
        reporting_hierarchy: Optional[List[Dict]] = None,  # Parent, subsidiaries
        consolidation_approach: Optional[str] = None,  # Equity share, operational control, financial control

        # Unit Specifications (REQUIRED)
        emission_units: str = "metric tons CO2e",  # MUST specify metric vs short tons

        # Methodologies
        employee_commuting_methodology: Optional[str] = None,  # REQUIRED if Cat 7 reported
        business_travel_methodology: Optional[str] = None,     # REQUIRED if Cat 6 reported
        purchased_goods_methodology: Optional[str] = None,     # REQUIRED if Cat 1 reported

        # Document Control (REQUIRED)
        document_version: str = "1.0",
        revision_history: Optional[List[Dict]] = None,  # Version, date, changes, author
        approval_signature: Optional[str] = None,
        approval_title: Optional[str] = None,
        approval_date: Optional[date] = None,

        # Additional
        top_emission_sources: Optional[List[Dict]] = None,
        calculation_count: Optional[int] = None,
        reporting_standard: str = "GHG Protocol Corporate Standard"
    ):
        # Basic info
        self.company_name = company_name
        self.reporting_period_start = reporting_period_start
        self.reporting_period_end = reporting_period_end

        # Regulatory identifiers
        self.naics_code = naics_code
        self.duns_number = duns_number
        self.epa_facility_id = epa_facility_id
        self.reporting_entity_id = reporting_entity_id

        # Contact info
        self.primary_contact_name = primary_contact_name
        self.primary_contact_title = primary_contact_title
        self.primary_contact_email = primary_contact_email
        self.primary_contact_phone = primary_contact_phone

        # Emissions
        self.scope_1_total = float(scope_1_total)
        self.scope_2_total = float(scope_2_total)
        self.scope_3_total = float(scope_3_total)

        # Scope 2 dual reporting
        self.scope_2_location_based = float(scope_2_location_based) if scope_2_location_based else None
        self.scope_2_market_based = float(scope_2_market_based) if scope_2_market_based else None
        self.scope_2_location_based_details = scope_2_location_based_details or {}
        self.scope_2_market_based_details = scope_2_market_based_details or {}

        # GHG breakdown
        self.ghg_breakdown = {k: float(v) for k, v in ghg_breakdown.items()} if ghg_breakdown else {}

        # Scope 3
        self.scope_3_breakdown = {k: float(v) for k, v in scope_3_breakdown.items()} if scope_3_breakdown else {}
        self.scope_3_exclusions = scope_3_exclusions or {}
        self.scope_3_methodologies = scope_3_methodologies or {}

        # Facilities
        self.facilities = facilities or []

        # Activity data
        self.activity_data = activity_data or []

        # Base year
        self.base_year = base_year
        self.base_year_emissions = float(base_year_emissions) if base_year_emissions else None
        self.base_year_recalculation_policy = base_year_recalculation_policy
        self.historical_emissions = {k: float(v) for k, v in historical_emissions.items()} if historical_emissions else {}

        # Targets
        self.net_zero_target_year = net_zero_target_year
        self.interim_targets = interim_targets or []

        # Offsets
        self.offsets_purchased = float(offsets_purchased) if offsets_purchased else 0
        self.offsets_marketplace = float(offsets_marketplace) if offsets_marketplace else 0
        self.offset_projects = offset_projects or []

        # Data quality
        self.data_quality_score = float(data_quality_score) if data_quality_score else None
        self.data_quality_procedures = data_quality_procedures
        self.materiality_threshold = materiality_threshold

        # Verification
        self.verification_status = verification_status
        self.assurance_level = assurance_level
        self.verified_by = verified_by
        self.verification_date = verification_date
        self.verification_standard = verification_standard

        # Organizational
        self.organizational_chart = organizational_chart
        self.reporting_hierarchy = reporting_hierarchy or []
        self.consolidation_approach = consolidation_approach

        # Units
        self.emission_units = emission_units

        # Methodologies
        self.employee_commuting_methodology = employee_commuting_methodology
        self.business_travel_methodology = business_travel_methodology
        self.purchased_goods_methodology = purchased_goods_methodology

        # Document control
        self.document_version = document_version
        self.revision_history = revision_history or []
        self.approval_signature = approval_signature
        self.approval_title = approval_title
        self.approval_date = approval_date

        # Additional
        self.top_emission_sources = top_emission_sources or []
        self.calculation_count = calculation_count or 0
        self.reporting_standard = reporting_standard

    @property
    def total_emissions(self) -> float:
        """Total emissions across all scopes"""
        return self.scope_1_total + self.scope_2_total + self.scope_3_total

    @property
    def total_offsets(self) -> float:
        """Total carbon offsets"""
        return self.offsets_purchased + self.offsets_marketplace

    @property
    def net_emissions(self) -> float:
        """Net emissions after offsets"""
        return self.total_emissions - self.total_offsets

    @property
    def reporting_period_str(self) -> str:
        """Formatted reporting period"""
        return f"{self.reporting_period_start.strftime('%B %d, %Y')} - {self.reporting_period_end.strftime('%B %d, %Y')}"


class GHGProtocolReportGenerator(BaseReportGenerator):
    """
    GHG Protocol Corporate Standard Report Generator

    Generates comprehensive emissions inventory reports compliant with
    the GHG Protocol Corporate Accounting and Reporting Standard.
    """

    SCOPE_3_CATEGORIES = {
        1: "Purchased goods and services",
        2: "Capital goods",
        3: "Fuel- and energy-related activities",
        4: "Upstream transportation and distribution",
        5: "Waste generated in operations",
        6: "Business travel",
        7: "Employee commuting",
        8: "Upstream leased assets",
        9: "Downstream transportation and distribution",
        10: "Processing of sold products",
        11: "Use of sold products",
        12: "End-of-life treatment of sold products",
        13: "Downstream leased assets",
        14: "Franchises",
        15: "Investments"
    }

    def __init__(self, report_data: GHGProtocolReportData):
        super().__init__(
            company_name=report_data.company_name,
            report_title="GHG Emissions Inventory Report"
        )
        self.data = report_data

    def generate(self) -> bytes:
        """Generate complete regulatory-compliant GHG Protocol report"""

        # Cover page with regulatory information
        self.add_cover_page(
            subtitle=f"{self.data.reporting_standard} | {self.data.emission_units}",
            reporting_period=self.data.reporting_period_str
        )

        # Document control and certification
        self._add_document_control()

        # Company and regulatory information
        self._add_company_information()

        # Table of contents
        self._add_table_of_contents()

        # Executive summary
        self._add_executive_summary()

        # Organizational boundaries with hierarchy
        self._add_organizational_boundaries()

        # Operational boundaries
        self._add_operational_boundaries()

        # Emissions summary with GHG breakdown
        self._add_emissions_summary()

        # GHG breakdown by gas type
        if self.data.ghg_breakdown:
            self._add_ghg_breakdown()

        # Facility-level emissions
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

        # Verification and assurance statement
        if self.data.verification_status or self.data.assurance_level:
            self._add_verification_statement()

        # Appendices (enhanced)
        self._add_appendices()

        # Build PDF
        return self.build("ghg_protocol_report.pdf")

    def _add_table_of_contents(self):
        """Add table of contents"""
        self.add_section("Table of Contents")

        toc_items = [
            "1. Executive Summary",
            "2. Organizational Boundaries",
            "3. Operational Boundaries",
            "4. Emissions Summary",
            "5. Scope 1: Direct Emissions",
            "6. Scope 2: Indirect Emissions from Energy",
            "7. Scope 3: Other Indirect Emissions",
        ]

        if self.data.base_year:
            toc_items.append("8. Progress Toward Targets")

        toc_items.extend([
            f"{len(toc_items) + 1}. Methodology and Assumptions",
            f"{len(toc_items) + 2}. Data Quality Assessment",
        ])

        if self.data.verification_status:
            toc_items.append(f"{len(toc_items) + 1}. Verification Statement")

        toc_items.append(f"{len(toc_items) + 1}. Appendices")

        for item in toc_items:
            self.add_paragraph(item, 'ReportBody')

        self.add_page_break()

    def _add_executive_summary(self):
        """Add executive summary section"""
        self.add_section("1. Executive Summary")

        # Summary paragraph
        summary_text = f"""
        This report presents the greenhouse gas (GHG) emissions inventory for {self.data.company_name}
        for the reporting period {self.data.reporting_period_str}. The inventory has been prepared
        in accordance with the GHG Protocol Corporate Accounting and Reporting Standard.
        """
        self.add_paragraph(summary_text)

        self.add_spacer(0.2)

        # Key findings
        self.add_subsection("Key Findings")

        total = self.data.total_emissions

        findings = f"""
        • <b>Total GHG Emissions:</b> {NumberFormatter.format_emissions(total)}<br/>
        • <b>Scope 1 Emissions:</b> {NumberFormatter.format_emissions(self.data.scope_1_total)}
          ({NumberFormatter.format_percentage(self.data.scope_1_total/total*100)} of total)<br/>
        • <b>Scope 2 Emissions:</b> {NumberFormatter.format_emissions(self.data.scope_2_total)}
          ({NumberFormatter.format_percentage(self.data.scope_2_total/total*100)} of total)<br/>
        • <b>Scope 3 Emissions:</b> {NumberFormatter.format_emissions(self.data.scope_3_total)}
          ({NumberFormatter.format_percentage(self.data.scope_3_total/total*100)} of total)<br/>
        """

        if self.data.total_offsets > 0:
            findings += f"""
            • <b>Carbon Offsets:</b> {NumberFormatter.format_emissions(self.data.total_offsets)}<br/>
            • <b>Net Emissions:</b> {NumberFormatter.format_emissions(self.data.net_emissions)}<br/>
            """

        if self.data.base_year_emissions:
            change_pct = ((total - self.data.base_year_emissions) / self.data.base_year_emissions) * 100
            change_direction = "increase" if change_pct > 0 else "decrease"
            findings += f"""
            • <b>Change from Base Year ({self.data.base_year}):</b> {abs(change_pct):.1f}% {change_direction}<br/>
            """

        self.add_paragraph(findings)

        self.add_spacer(0.3)

        # Emissions by scope pie chart
        self.add_subsection("Emissions by Scope")

        pie_data = [
            (f"Scope 1\n({NumberFormatter.format_percentage(self.data.scope_1_total/total*100)})",
             self.data.scope_1_total),
            (f"Scope 2\n({NumberFormatter.format_percentage(self.data.scope_2_total/total*100)})",
             self.data.scope_2_total),
            (f"Scope 3\n({NumberFormatter.format_percentage(self.data.scope_3_total/total*100)})",
             self.data.scope_3_total),
        ]

        pie_chart = ChartGenerator.create_pie_chart(
            data=pie_data,
            slice_colors=[ReportColors.SCOPE_1, ReportColors.SCOPE_2, ReportColors.SCOPE_3]
        )

        self.add_chart(pie_chart)

        self.add_page_break()

    def _add_organizational_boundaries(self):
        """Add organizational boundaries section"""
        self.add_section("2. Organizational Boundaries")

        text = f"""
        {self.data.company_name} has defined its organizational boundaries using the
        <b>operational control</b> approach as outlined in the GHG Protocol Corporate Standard.
        Under this approach, the company accounts for 100% of GHG emissions from operations
        over which it has operational control.
        """
        self.add_paragraph(text)

        self.add_spacer(0.2)

        self.add_subsection("Consolidation Approach")

        consolidation_text = """
        The operational control approach was selected because it:
        <br/><br/>
        • Aligns with the company's financial reporting boundaries<br/>
        • Provides the most accurate representation of emissions under the company's control<br/>
        • Enables effective emissions reduction strategies and accountability<br/>
        • Is consistent with industry best practices
        """
        self.add_paragraph(consolidation_text)

        self.add_page_break()

    def _add_operational_boundaries(self):
        """Add operational boundaries section"""
        self.add_section("3. Operational Boundaries")

        text = """
        The operational boundaries define which GHG emissions are included in the inventory.
        This inventory includes emissions from the following sources:
        """
        self.add_paragraph(text)

        self.add_spacer(0.2)

        # Scope descriptions
        self.add_subsection("Scope 1: Direct Emissions")
        scope_1_text = """
        Direct GHG emissions from sources owned or controlled by the company, including:
        <br/><br/>
        • Stationary combustion (boilers, generators, furnaces)<br/>
        • Mobile combustion (company vehicles and equipment)<br/>
        • Process emissions (industrial processes)<br/>
        • Fugitive emissions (refrigerants, HVAC systems)
        """
        self.add_paragraph(scope_1_text)

        self.add_spacer(0.2)

        self.add_subsection("Scope 2: Indirect Emissions from Energy")
        scope_2_text = """
        Indirect GHG emissions from the generation of purchased electricity, heat, steam,
        and cooling consumed by the company.
        """
        self.add_paragraph(scope_2_text)

        self.add_spacer(0.2)

        if self.data.scope_3_total > 0:
            self.add_subsection("Scope 3: Other Indirect Emissions")
            scope_3_text = f"""
            All other indirect emissions that occur in the company's value chain.
            This inventory includes the following Scope 3 categories:
            <br/><br/>
            """

            for category_num, emissions in sorted(self.data.scope_3_breakdown.items()):
                if emissions > 0:
                    category_name = self.SCOPE_3_CATEGORIES.get(category_num, f"Category {category_num}")
                    scope_3_text += f"• Category {category_num}: {category_name}<br/>"

            self.add_paragraph(scope_3_text)

        self.add_page_break()

    def _add_emissions_summary(self):
        """Add emissions summary section"""
        self.add_section("4. Emissions Summary")

        # Summary table
        total = self.data.total_emissions

        table_data = [
            ['Scope', 'Emissions (tons CO2e)', 'Percentage of Total'],
            [
                'Scope 1: Direct Emissions',
                NumberFormatter.format_number(self.data.scope_1_total, 2),
                NumberFormatter.format_percentage(self.data.scope_1_total/total*100)
            ],
            [
                'Scope 2: Indirect Emissions from Energy',
                NumberFormatter.format_number(self.data.scope_2_total, 2),
                NumberFormatter.format_percentage(self.data.scope_2_total/total*100)
            ],
            [
                'Scope 3: Other Indirect Emissions',
                NumberFormatter.format_number(self.data.scope_3_total, 2),
                NumberFormatter.format_percentage(self.data.scope_3_total/total*100)
            ],
            [
                '<b>Total Emissions</b>',
                f'<b>{NumberFormatter.format_number(total, 2)}</b>',
                '<b>100%</b>'
            ]
        ]

        if self.data.total_offsets > 0:
            table_data.append([
                'Less: Carbon Offsets',
                f'({NumberFormatter.format_number(self.data.total_offsets, 2)})',
                ''
            ])
            table_data.append([
                '<b>Net Emissions</b>',
                f'<b>{NumberFormatter.format_number(self.data.net_emissions, 2)}</b>',
                ''
            ])

        table = TableBuilder.create_summary_table(
            headers=table_data[0],
            data=table_data[1:],
            col_widths=[3*inch, 2*inch, 1.5*inch]
        )

        self.add_table(table)

        # Top emission sources
        if self.data.top_emission_sources:
            self.add_spacer(0.3)
            self.add_subsection("Top Emission Sources")

            source_data = []
            for source in self.data.top_emission_sources[:10]:  # Top 10
                source_data.append([
                    source.get('category', 'Unknown'),
                    NumberFormatter.format_number(source.get('emissions', 0), 2),
                    NumberFormatter.format_percentage(source.get('percentage', 0))
                ])

            sources_table = TableBuilder.create_summary_table(
                headers=['Emission Source', 'Emissions (tons CO2e)', 'Percentage'],
                data=source_data,
                col_widths=[3*inch, 2*inch, 1.5*inch]
            )

            self.add_table(sources_table)

        self.add_page_break()

    def _add_scope_1_detail(self):
        """Add Scope 1 details"""
        self.add_section("5. Scope 1: Direct Emissions")

        text = f"""
        Total Scope 1 emissions for the reporting period:
        <b>{NumberFormatter.format_emissions(self.data.scope_1_total)}</b>
        """
        self.add_paragraph(text)

        self.add_spacer(0.2)

        description = """
        Scope 1 emissions include all direct GHG emissions from sources owned or controlled
        by the company. These emissions are the result of activities such as combustion of
        fuels in stationary sources (boilers, furnaces), mobile sources (vehicles, equipment),
        process emissions, and fugitive emissions from refrigerants and other sources.
        """
        self.add_paragraph(description)

        # Placeholder for breakdown by category
        # In a real implementation, this would show detailed breakdown

        self.add_page_break()

    def _add_scope_2_detail(self):
        """Add Scope 2 details with dual reporting"""
        self.add_section("6. Scope 2: Indirect Emissions from Energy")

        description = """
        Scope 2 emissions result from the generation of purchased electricity, heat, steam,
        and cooling consumed by the company. These are indirect emissions that occur at the
        facility where the energy is generated.
        """
        self.add_paragraph(description)

        self.add_spacer(0.2)

        # Dual reporting requirement
        if self.data.scope_2_location_based and self.data.scope_2_market_based:
            self.add_subsection("Dual Reporting - Location-Based and Market-Based Methods")

            dual_text = f"""
            In accordance with the GHG Protocol Scope 2 Guidance, {self.data.company_name} reports
            Scope 2 emissions using both the location-based and market-based methods.
            """
            self.add_paragraph(dual_text)

            self.add_spacer(0.2)

            # Comparison table
            dual_data = [
                ['Reporting Method', f'Emissions ({self.data.emission_units})', 'Description'],
                [
                    'Location-Based',
                    NumberFormatter.format_number(self.data.scope_2_location_based, 2),
                    'Reflects average emissions intensity of grids'
                ],
                [
                    'Market-Based',
                    NumberFormatter.format_number(self.data.scope_2_market_based, 2),
                    'Reflects emissions from contractual instruments (RECs, PPAs)'
                ]
            ]

            table = TableBuilder.create_summary_table(
                headers=dual_data[0],
                data=dual_data[1:],
                col_widths=[2*inch, 2*inch, 3*inch]
            )
            self.add_table(table)

            self.add_spacer(0.3)

            # Location-based details
            if self.data.scope_2_location_based_details:
                self.add_subsection("Location-Based Method Details")

                location_text = f"""
                The location-based method uses average emission factors for the grid regions where
                electricity is consumed. The following grid emission factors were used:
                """
                self.add_paragraph(location_text)

                self.add_spacer(0.1)

                location_details = self.data.scope_2_location_based_details
                if location_details.get('grid_factors'):
                    grid_data = [['Grid Region', 'Emission Factor', 'Source']]
                    for grid in location_details['grid_factors']:
                        grid_data.append([
                            grid.get('region', 'N/A'),
                            grid.get('factor', 'N/A'),
                            grid.get('source', 'N/A')
                        ])

                    table = TableBuilder.create_summary_table(
                        headers=grid_data[0],
                        data=grid_data[1:]
                    )
                    self.add_table(table)

                    self.add_spacer(0.3)

            # Market-based details
            if self.data.scope_2_market_based_details:
                self.add_subsection("Market-Based Method Details")

                market_text = f"""
                The market-based method reflects {self.data.company_name}'s contractual purchases
                of renewable energy and other energy attribute certificates.
                """
                self.add_paragraph(market_text)

                self.add_spacer(0.1)

                market_details = self.data.scope_2_market_based_details

                # RECs/guarantees of origin
                if market_details.get('renewable_certificates'):
                    rec_data = [['Certificate Type', 'Quantity (MWh)', 'Vintage Year', 'Registry']]
                    for cert in market_details['renewable_certificates']:
                        rec_data.append([
                            cert.get('type', 'N/A'),
                            NumberFormatter.format_number(cert.get('quantity_mwh', 0), 2),
                            str(cert.get('vintage_year', 'N/A')),
                            cert.get('registry', 'N/A')
                        ])

                    table = TableBuilder.create_summary_table(
                        headers=rec_data[0],
                        data=rec_data[1:]
                    )
                    self.add_table(table)

                    self.add_spacer(0.2)

                # PPAs
                if market_details.get('ppas'):
                    self.add_paragraph("<b>Power Purchase Agreements (PPAs):</b>")

                    for ppa in market_details['ppas']:
                        ppa_text = f"""
                        • {ppa.get('project_name', 'N/A')} - {NumberFormatter.format_number(ppa.get('capacity_mw', 0), 2)} MW,
                          {ppa.get('technology', 'N/A')}, {ppa.get('location', 'N/A')}<br/>
                        """
                        self.add_paragraph(ppa_text)

                    self.add_spacer(0.2)

                # Residual grid factor for unbundled electricity
                if market_details.get('residual_grid_factor'):
                    residual_text = f"""
                    For electricity without contractual instruments, a residual grid emission factor
                    of {market_details['residual_grid_factor']} was applied.
                    """
                    self.add_paragraph(residual_text)

        else:
            text = f"""
            Total Scope 2 emissions for the reporting period:
            <b>{NumberFormatter.format_number(self.data.scope_2_total, 2)} {self.data.emission_units}</b>
            <br/><br/>
            <i>Note: Dual reporting (location-based and market-based methods) is recommended by the
            GHG Protocol Scope 2 Guidance and may be required by certain regulatory frameworks.</i>
            """
            self.add_paragraph(text)

        self.add_page_break()

    def _add_scope_3_detail(self):
        """Add Scope 3 details with complete category reporting and exclusions"""
        self.add_section("7. Scope 3: Other Indirect Emissions")

        intro = f"""
        Scope 3 emissions are indirect emissions that occur in {self.data.company_name}'s value chain,
        both upstream and downstream. The GHG Protocol Corporate Value Chain (Scope 3) Standard identifies
        15 categories of Scope 3 emissions.
        <br/><br/>
        <b>Total Scope 3 Emissions:</b> {NumberFormatter.format_number(self.data.scope_3_total, 2)} {self.data.emission_units}
        """
        self.add_paragraph(intro)

        self.add_spacer(0.3)

        # Complete category reporting with status
        self.add_subsection("Complete Scope 3 Category Reporting")

        reporting_text = """
        The following table provides a complete accounting of all 15 Scope 3 categories, including
        quantified emissions, exclusions with rationale, and methodology used for each category.
        """
        self.add_paragraph(reporting_text)

        self.add_spacer(0.2)

        # Detailed category table
        category_report_data = [['Category', 'Description', f'Emissions ({self.data.emission_units})', 'Status', 'Methodology/Exclusion Rationale']]

        for cat_num in range(1, 16):
            category_name = self.SCOPE_3_CATEGORIES.get(cat_num, f"Category {cat_num}")

            # Check if category has emissions
            emissions = self.data.scope_3_breakdown.get(cat_num, 0) if self.data.scope_3_breakdown else 0

            # Check if excluded
            is_excluded = cat_num in self.data.scope_3_exclusions
            exclusion_rationale = self.data.scope_3_exclusions.get(cat_num, '')

            # Get methodology
            methodology = self.data.scope_3_methodologies.get(cat_num, '')

            if emissions > 0:
                status = 'Reported'
                method_or_rationale = methodology if methodology else 'Calculated using activity data and emission factors'
            elif is_excluded:
                status = 'Excluded'
                method_or_rationale = exclusion_rationale
            else:
                status = 'Not Applicable'
                method_or_rationale = 'Not relevant to organizational activities'

            category_report_data.append([
                f"{cat_num}",
                category_name,
                NumberFormatter.format_number(emissions, 2) if emissions > 0 else 'N/A',
                status,
                method_or_rationale
            ])

        cat_table = TableBuilder.create_summary_table(
            headers=category_report_data[0],
            data=category_report_data[1:],
            col_widths=[0.4*inch, 1.8*inch, 0.9*inch, 0.8*inch, 3.6*inch]
        )
        self.add_table(cat_table)

        self.add_spacer(0.3)

        # Breakdown of reported categories
        if self.data.scope_3_breakdown:
            self.add_subsection("Reported Categories Breakdown")

            reported_data = [['Category', 'Description', f'Emissions ({self.data.emission_units})', '% of Scope 3']]

            for cat_num, emissions in sorted(self.data.scope_3_breakdown.items()):
                if emissions > 0:
                    category_name = self.SCOPE_3_CATEGORIES.get(cat_num, f"Category {cat_num}")
                    pct = (emissions / self.data.scope_3_total * 100) if self.data.scope_3_total > 0 else 0
                    reported_data.append([
                        f"Cat {cat_num}",
                        category_name,
                        NumberFormatter.format_number(emissions, 2),
                        NumberFormatter.format_number(pct, 1) + '%'
                    ])

            # Total row
            reported_data.append([
                'Total',
                '',
                NumberFormatter.format_number(self.data.scope_3_total, 2),
                '100.0%'
            ])

            table = TableBuilder.create_summary_table(
                headers=reported_data[0],
                data=reported_data[1:],
                col_widths=[0.75*inch, 2.5*inch, 1.5*inch, 1.25*inch]
            )
            self.add_table(table)

            # Bar chart of top categories
            if len(self.data.scope_3_breakdown) > 1:
                self.add_spacer(0.3)
                self.add_subsection("Top Scope 3 Categories (Visual)")

                # Sort by emissions and take top 5
                sorted_cats = sorted(
                    [(cat_num, emissions) for cat_num, emissions in self.data.scope_3_breakdown.items()],
                    key=lambda x: x[1],
                    reverse=True
                )[:5]

                cat_labels = [f"Cat {cat}" for cat, _ in sorted_cats]
                cat_values = [emissions for _, emissions in sorted_cats]

                bar_chart = ChartGenerator.create_bar_chart(
                    categories=cat_labels,
                    values=cat_values,
                    color=ReportColors.SCOPE_3
                )

                self.add_chart(bar_chart)

        # Specific methodologies for key categories
        self.add_spacer(0.3)
        self.add_subsection("Calculation Methodologies for Reported Categories")

        if self.data.purchased_goods_methodology and 1 in self.data.scope_3_breakdown:
            self.add_paragraph(f"<b>Category 1 - Purchased Goods and Services:</b>")
            self.add_paragraph(self.data.purchased_goods_methodology)
            self.add_spacer(0.2)

        if self.data.business_travel_methodology and 6 in self.data.scope_3_breakdown:
            self.add_paragraph(f"<b>Category 6 - Business Travel:</b>")
            self.add_paragraph(self.data.business_travel_methodology)
            self.add_spacer(0.2)

        if self.data.employee_commuting_methodology and 7 in self.data.scope_3_breakdown:
            self.add_paragraph(f"<b>Category 7 - Employee Commuting:</b>")
            self.add_paragraph(self.data.employee_commuting_methodology)
            self.add_spacer(0.2)

        self.add_page_break()

    def _add_progress_toward_targets(self):
        """Add progress toward net-zero targets"""
        section_num = 8 if self.data.scope_3_total > 0 else 7
        self.add_section(f"{section_num}. Progress Toward Targets")

        if self.data.base_year and self.data.base_year_emissions:
            reduction = self.data.base_year_emissions - self.data.total_emissions
            reduction_pct = (reduction / self.data.base_year_emissions) * 100

            text = f"""
            {self.data.company_name} has committed to achieving net-zero emissions by
            {self.data.net_zero_target_year}. Progress is measured against a base year of
            {self.data.base_year}.
            <br/><br/>
            • <b>Base Year ({self.data.base_year}) Emissions:</b> {NumberFormatter.format_emissions(self.data.base_year_emissions)}<br/>
            • <b>Current Year Emissions:</b> {NumberFormatter.format_emissions(self.data.total_emissions)}<br/>
            • <b>Reduction Achieved:</b> {NumberFormatter.format_emissions(abs(reduction))}
              ({NumberFormatter.format_percentage(abs(reduction_pct))})<br/>
            """

            if self.data.net_zero_target_year:
                years_to_target = self.data.net_zero_target_year - self.data.reporting_period_end.year
                annual_reduction_needed = self.data.net_emissions / years_to_target if years_to_target > 0 else 0

                text += f"""
                <br/>
                • <b>Years to Net-Zero Target:</b> {years_to_target}<br/>
                • <b>Annual Reduction Needed:</b> {NumberFormatter.format_emissions(annual_reduction_needed)} per year<br/>
                """

            self.add_paragraph(text)

        self.add_page_break()

    def _add_methodology(self):
        """Add methodology section"""
        section_num = 9 if self.data.base_year else 8
        self.add_section(f"{section_num}. Methodology and Assumptions")

        self.add_subsection("Calculation Methodology")

        methodology_text = """
        All emissions calculations follow the GHG Protocol Corporate Accounting and Reporting
        Standard methodology. The general calculation approach is:
        <br/><br/>
        <b>GHG Emissions = Activity Data × Emission Factor</b>
        <br/><br/>
        Where:<br/>
        • <b>Activity Data:</b> Quantitative measure of activity (e.g., kWh electricity, liters fuel)<br/>
        • <b>Emission Factor:</b> Factor that converts activity data to GHG emissions (e.g., kg CO2e per kWh)<br/>
        """
        self.add_paragraph(methodology_text)

        self.add_spacer(0.2)

        self.add_subsection("Emission Factors")

        factors_text = f"""
        Emission factors used in this inventory are sourced from recognized databases including:
        <br/><br/>
        • U.S. Environmental Protection Agency (EPA)<br/>
        • UK Department for Environment, Food & Rural Affairs (DEFRA)<br/>
        • International Energy Agency (IEA)<br/>
        • Intergovernmental Panel on Climate Change (IPCC)<br/>
        <br/>
        Total data points in inventory: <b>{self.data.calculation_count}</b>
        """
        self.add_paragraph(factors_text)

        self.add_spacer(0.2)

        self.add_subsection("Global Warming Potentials")

        gwp_text = """
        Global Warming Potentials (GWPs) from the IPCC Fifth Assessment Report (AR5) are used
        to convert non-CO2 gases to CO2 equivalents over a 100-year time horizon.
        """
        self.add_paragraph(gwp_text)

        self.add_page_break()

    def _add_data_quality_assessment(self):
        """Add data quality assessment"""
        section_num = 10 if self.data.base_year else 9
        self.add_section(f"{section_num}. Data Quality Assessment")

        quality_score = self.data.data_quality_score

        # Determine tier based on score
        if quality_score >= 4.0:
            tier = 1
            tier_desc = "Primary data, directly measured, supplier-specific"
        elif quality_score >= 3.0:
            tier = 2
            tier_desc = "Secondary data, region-specific emission factors"
        elif quality_score >= 2.0:
            tier = 3
            tier_desc = "Industry average data"
        elif quality_score >= 1.0:
            tier = 4
            tier_desc = "Spend-based estimation"
        else:
            tier = 5
            tier_desc = "Proxy data, highly uncertain"

        text = f"""
        The overall data quality score for this inventory is <b>{quality_score:.2f} out of 5.0</b>,
        corresponding to Tier {tier} quality.
        """
        self.add_paragraph(text)

        self.add_spacer(0.2)

        # Quality tier table
        quality_table = TableBuilder.create_data_quality_table(
            tier=tier,
            description=tier_desc,
            percentage=100
        )

        self.add_table(quality_table)

        self.add_page_break()

    def _add_verification_statement(self):
        """Add verification statement"""
        section_num = 11 if self.data.data_quality_score else (10 if self.data.base_year else 9)
        self.add_section(f"{section_num}. Verification Statement")

        if self.data.verification_status == 'verified':
            statement = f"""
            This GHG emissions inventory has been verified by <b>{self.data.verified_by or 'an independent third party'}</b>
            in accordance with ISO 14064-3 standards for greenhouse gas assertions.
            <br/><br/>
            The verification process included:<br/>
            • Review of organizational and operational boundaries<br/>
            • Assessment of data collection and calculation methodologies<br/>
            • Verification of emission factors and activity data<br/>
            • Review of supporting documentation and evidence<br/>
            • Assessment of data quality and uncertainty<br/>
            <br/>
            <b>Verification Opinion:</b> The reported emissions are materially correct and have been
            calculated in accordance with the GHG Protocol Corporate Standard.
            """
        else:
            statement = f"""
            Verification Status: <b>{self.data.verification_status or 'Pending'}</b>
            <br/><br/>
            This inventory has not yet been verified by an independent third party. The company
            plans to engage a qualified verifier to assess the inventory in accordance with
            ISO 14064-3 standards.
            """

        self.add_paragraph(statement)

        self.add_page_break()

    def _add_document_control(self):
        """Add document control and certification section"""
        self.add_section("Document Control & Certification")

        # Document version and control
        doc_control = f"""
        <b>Document Version:</b> {self.data.document_version}<br/>
        <b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %H:%M %Z')}<br/>
        <b>Reporting Period:</b> {self.data.reporting_period_str}<br/>
        <b>Reporting Standard:</b> {self.data.reporting_standard}<br/>
        <b>Units:</b> {self.data.emission_units}<br/>
        """
        self.add_paragraph(doc_control)

        self.add_spacer(0.2)

        # Revision history
        if self.data.revision_history:
            self.add_subsection("Revision History")

            revision_rows = []
            for rev in self.data.revision_history:
                revision_rows.append([
                    rev.get('version', ''),
                    rev.get('date', ''),
                    rev.get('changes', ''),
                    rev.get('author', '')
                ])

            table = TableBuilder.create_summary_table(
                headers=['Version', 'Date', 'Changes', 'Author'],
                data=revision_rows,
                col_widths=[1*inch, 1.5*inch, 3*inch, 1.5*inch]
            )
            self.add_table(table)

            self.add_spacer(0.3)

        # Certification statement
        self.add_subsection("Certification Statement")

        cert_text = f"""
        I certify that the information contained in this GHG emissions inventory report is true,
        accurate, and complete to the best of my knowledge. This inventory has been prepared in
        accordance with the {self.data.reporting_standard} and represents a fair and accurate
        account of {self.data.company_name}'s greenhouse gas emissions for the reporting period
        {self.data.reporting_period_str}.
        """
        self.add_paragraph(cert_text)

        self.add_spacer(0.3)

        # Signature block
        if self.data.approval_signature:
            signature_info = f"""
            <b>Authorized Signature:</b> {self.data.approval_signature}<br/>
            <b>Title:</b> {self.data.approval_title or 'N/A'}<br/>
            <b>Date:</b> {self.data.approval_date.strftime('%B %d, %Y') if self.data.approval_date else 'Pending'}<br/>
            """
            self.add_paragraph(signature_info)
        else:
            self.add_paragraph("<i>Signature: _____________________________ Date: ______________</i>")

        self.add_page_break()

    def _add_company_information(self):
        """Add company and regulatory information"""
        self.add_section("Company & Regulatory Information")

        # Basic company info
        company_info = f"""
        <b>Company Name:</b> {self.data.company_name}<br/>
        """

        if self.data.naics_code:
            company_info += f"<b>NAICS Code:</b> {self.data.naics_code}<br/>"

        if self.data.duns_number:
            company_info += f"<b>DUNS Number:</b> {self.data.duns_number}<br/>"

        if self.data.epa_facility_id:
            company_info += f"<b>EPA Facility ID:</b> {self.data.epa_facility_id}<br/>"

        if self.data.reporting_entity_id:
            company_info += f"<b>Reporting Entity ID:</b> {self.data.reporting_entity_id}<br/>"

        self.add_paragraph(company_info)

        self.add_spacer(0.3)

        # Primary contact
        if self.data.primary_contact_name:
            self.add_subsection("Primary Contact")

            contact_info = f"""
            <b>Name:</b> {self.data.primary_contact_name}<br/>
            <b>Title:</b> {self.data.primary_contact_title or 'N/A'}<br/>
            <b>Email:</b> {self.data.primary_contact_email or 'N/A'}<br/>
            <b>Phone:</b> {self.data.primary_contact_phone or 'N/A'}<br/>
            """
            self.add_paragraph(contact_info)

            self.add_spacer(0.3)

        # Materiality threshold
        if self.data.materiality_threshold:
            self.add_subsection("Materiality Threshold")

            materiality_text = f"""
            For the purposes of this inventory, emissions sources representing less than
            {self.data.materiality_threshold} are considered immaterial and may be excluded from
            detailed reporting. All material sources have been included and quantified.
            """
            self.add_paragraph(materiality_text)

        self.add_page_break()

    def _add_ghg_breakdown(self):
        """Add greenhouse gas breakdown by gas type"""
        section_num = 5
        self.add_section(f"{section_num}. GHG Breakdown by Gas Type")

        intro = f"""
        The following table presents {self.data.company_name}'s emissions broken down by individual
        greenhouse gas species. All gases have been converted to CO2 equivalent using Global Warming
        Potentials (GWP) from the IPCC Fifth Assessment Report (AR5).
        """
        self.add_paragraph(intro)

        self.add_spacer(0.2)

        # GHG breakdown table
        ghg_data = [['Greenhouse Gas', f'Emissions ({self.data.emission_units})', 'GWP (AR5)', f'CO2e ({self.data.emission_units})']]

        gwp_values = {
            'CO2': 1,
            'CH4': 28,
            'N2O': 265,
            'HFC-134a': 1300,
            'HFC-125': 3170,
            'SF6': 23500,
            'NF3': 16100,
            'PFC-14': 6630
        }

        total_co2e = 0
        for gas, co2e in self.data.ghg_breakdown.items():
            gwp = gwp_values.get(gas, 1)
            mass = co2e / gwp if gwp > 1 else co2e
            ghg_data.append([
                gas,
                NumberFormatter.format_number(mass, 2),
                str(gwp),
                NumberFormatter.format_number(co2e, 2)
            ])
            total_co2e += co2e

        ghg_data.append(['Total', '', '', NumberFormatter.format_number(total_co2e, 2)])

        table = TableBuilder.create_summary_table(
            headers=ghg_data[0],
            data=ghg_data[1:]
        )
        self.add_table(table)

        self.add_page_break()

    def _add_facility_level_emissions(self):
        """Add facility-level emissions data"""
        section_num = 6
        self.add_section(f"{section_num}. Facility-Level Emissions")

        intro = f"""
        {self.data.company_name} operates multiple facilities that contribute to the organization's
        total GHG emissions. The following table provides a breakdown of emissions by facility location.
        """
        self.add_paragraph(intro)

        self.add_spacer(0.2)

        # Facility table
        facility_data = [['Facility Name', 'Address', 'Scope 1', 'Scope 2', 'Scope 3', 'Total']]

        for facility in self.data.facilities:
            facility_data.append([
                facility.get('name', 'N/A'),
                facility.get('address', 'N/A'),
                NumberFormatter.format_number(facility.get('scope_1', 0), 2),
                NumberFormatter.format_number(facility.get('scope_2', 0), 2),
                NumberFormatter.format_number(facility.get('scope_3', 0), 2),
                NumberFormatter.format_number(
                    facility.get('scope_1', 0) +
                    facility.get('scope_2', 0) +
                    facility.get('scope_3', 0), 2
                )
            ])

        # Totals row
        total_s1 = sum(f.get('scope_1', 0) for f in self.data.facilities)
        total_s2 = sum(f.get('scope_2', 0) for f in self.data.facilities)
        total_s3 = sum(f.get('scope_3', 0) for f in self.data.facilities)

        facility_data.append([
            'Total', '',
            NumberFormatter.format_number(total_s1, 2),
            NumberFormatter.format_number(total_s2, 2),
            NumberFormatter.format_number(total_s3, 2),
            NumberFormatter.format_number(total_s1 + total_s2 + total_s3, 2)
        ])

        table = TableBuilder.create_summary_table(
            headers=facility_data[0],
            data=facility_data[1:],
            col_widths=[1.5*inch, 2*inch, 1*inch, 1*inch, 1*inch, 1*inch]
        )
        self.add_table(table)

        self.add_page_break()

    def _add_carbon_offsets_detail(self):
        """Add detailed carbon offsets project disclosure"""
        section_num = 10
        self.add_section(f"{section_num}. Carbon Offsets - Project-Level Disclosure")

        intro = f"""
        {self.data.company_name} has purchased carbon offsets to compensate for a portion of its
        GHG emissions. The following table provides project-level details for all offset purchases,
        in accordance with regulatory requirements for offset disclosure.
        """
        self.add_paragraph(intro)

        self.add_spacer(0.2)

        # Offsets table
        offset_data = [['Project Name', 'Project Type', 'Registry', 'Serial Numbers', f'Quantity ({self.data.emission_units})']]

        for project in self.data.offset_projects:
            offset_data.append([
                project.get('name', 'N/A'),
                project.get('type', 'N/A'),
                project.get('registry', 'N/A'),
                project.get('serial_numbers', 'N/A'),
                NumberFormatter.format_number(project.get('quantity', 0), 2)
            ])

        # Total
        total_offsets = sum(p.get('quantity', 0) for p in self.data.offset_projects)
        offset_data.append(['Total Offsets', '', '', '', NumberFormatter.format_number(total_offsets, 2)])

        table = TableBuilder.create_summary_table(
            headers=offset_data[0],
            data=offset_data[1:],
            col_widths=[2*inch, 1.5*inch, 1.2*inch, 1.8*inch, 1*inch]
        )
        self.add_table(table)

        self.add_spacer(0.3)

        # Net emissions after offsets
        net_emissions = self.data.total_emissions - total_offsets

        summary = f"""
        <b>Total Gross Emissions:</b> {NumberFormatter.format_number(self.data.total_emissions, 2)} {self.data.emission_units}<br/>
        <b>Total Carbon Offsets:</b> {NumberFormatter.format_number(total_offsets, 2)} {self.data.emission_units}<br/>
        <b>Net Emissions:</b> {NumberFormatter.format_number(net_emissions, 2)} {self.data.emission_units}<br/>
        """
        self.add_paragraph(summary)

        self.add_page_break()

    def _add_base_year_recalculation_policy(self):
        """Add base year recalculation policy"""
        section_num = 11
        self.add_section(f"{section_num}. Base Year Recalculation Policy")

        intro = f"""
        {self.data.company_name} has established a base year recalculation policy in accordance with
        the GHG Protocol Corporate Standard. This policy defines the circumstances under which the
        base year emissions inventory will be recalculated.
        """
        self.add_paragraph(intro)

        self.add_spacer(0.2)

        self.add_subsection("Policy Statement")

        if self.data.base_year_recalculation_policy:
            self.add_paragraph(self.data.base_year_recalculation_policy)
        else:
            default_policy = """
            The base year emissions will be recalculated if one or more of the following triggers occur:
            <br/><br/>
            • <b>Structural changes:</b> Mergers, acquisitions, or divestments that transfer ownership
              or control of emissions sources that collectively represent more than 5% of base year emissions<br/>
            • <b>Changes in calculation methodologies:</b> Changes that result in a significant impact
              on the base year emissions data<br/>
            • <b>Discovery of significant errors:</b> Errors in base year data or calculation methodologies
              that result in a cumulative change of more than 5% of base year emissions<br/>
            • <b>Changes in emission factors:</b> Significant changes to publicly available emission factors
              or GWP values<br/>
            <br/>
            The significance threshold is defined as 5% of base year emissions.
            """
            self.add_paragraph(default_policy)

        self.add_page_break()

    def _add_activity_data_disclosure(self):
        """Add activity data disclosure tables"""
        section_num = 12
        self.add_section(f"{section_num}. Activity Data Disclosure")

        intro = f"""
        This section provides detailed activity data that forms the basis for the emissions calculations
        in this inventory. Activity data is disclosed in accordance with regulatory requirements for
        transparency and verification.
        """
        self.add_paragraph(intro)

        self.add_spacer(0.2)

        # Activity data tables
        for i, activity_group in enumerate(self.data.activity_data):
            scope = activity_group.get('scope', 'Unknown')
            category = activity_group.get('category', 'Unknown')

            self.add_subsection(f"{scope} - {category}")

            activities = activity_group.get('activities', [])

            if activities:
                activity_table_data = [['Activity Description', 'Quantity', 'Unit', 'Emission Factor', 'EF Unit', f'Emissions ({self.data.emission_units})']]

                for activity in activities:
                    activity_table_data.append([
                        activity.get('description', 'N/A'),
                        NumberFormatter.format_number(activity.get('quantity', 0), 2),
                        activity.get('unit', 'N/A'),
                        NumberFormatter.format_number(activity.get('emission_factor', 0), 4),
                        activity.get('ef_unit', 'N/A'),
                        NumberFormatter.format_number(activity.get('emissions', 0), 2)
                    ])

                table = TableBuilder.create_summary_table(
                    headers=activity_table_data[0],
                    data=activity_table_data[1:],
                    col_widths=[2*inch, 0.8*inch, 0.8*inch, 0.8*inch, 1*inch, 1.1*inch]
                )
                self.add_table(table)

                self.add_spacer(0.3)

        self.add_page_break()

    def _add_appendices(self):
        """Add appendices"""
        section_num = 12
        self.add_section(f"{section_num}. Appendices")

        self.add_subsection("Appendix A: GHG Protocol Principles")

        principles = """
        This inventory has been prepared in accordance with the following GHG Protocol principles:
        <br/><br/>
        • <b>Relevance:</b> Ensure the inventory appropriately reflects the GHG emissions and serves
          the decision-making needs of users<br/>
        • <b>Completeness:</b> Account for all GHG emission sources within the chosen boundaries<br/>
        • <b>Consistency:</b> Use consistent methodologies to allow meaningful comparisons over time<br/>
        • <b>Transparency:</b> Address relevant issues in a factual and coherent manner<br/>
        • <b>Accuracy:</b> Ensure emissions quantification is systematically neither over nor under
          actual emissions<br/>
        """
        self.add_paragraph(principles)

        self.add_spacer(0.3)

        self.add_subsection("Appendix B: Abbreviations and Acronyms")

        abbreviations = """
        • <b>CH4:</b> Methane<br/>
        • <b>CO2:</b> Carbon Dioxide<br/>
        • <b>CO2e:</b> Carbon Dioxide Equivalent<br/>
        • <b>GHG:</b> Greenhouse Gas<br/>
        • <b>GWP:</b> Global Warming Potential<br/>
        • <b>IPCC:</b> Intergovernmental Panel on Climate Change<br/>
        • <b>N2O:</b> Nitrous Oxide<br/>
        • <b>tCO2e:</b> Tons of Carbon Dioxide Equivalent<br/>
        """
        self.add_paragraph(abbreviations)

        self.add_spacer(0.3)

        # Report metadata
        self.add_subsection("Report Information")

        metadata = f"""
        • <b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %H:%M')}<br/>
        • <b>Reporting Standard:</b> GHG Protocol Corporate Accounting and Reporting Standard<br/>
        • <b>Report Version:</b> 1.0<br/>
        """
        self.add_paragraph(metadata)
