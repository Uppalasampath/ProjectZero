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
    """Data structure for GHG Protocol report"""

    def __init__(
        self,
        company_name: str,
        reporting_period_start: date,
        reporting_period_end: date,
        scope_1_total: Decimal,
        scope_2_total: Decimal,
        scope_3_total: Decimal,
        scope_2_location_based: Optional[Decimal] = None,
        scope_2_market_based: Optional[Decimal] = None,
        scope_3_breakdown: Optional[Dict[int, Decimal]] = None,
        base_year: Optional[int] = None,
        base_year_emissions: Optional[Decimal] = None,
        net_zero_target_year: Optional[int] = None,
        data_quality_score: Optional[Decimal] = None,
        verification_status: Optional[str] = None,
        verified_by: Optional[str] = None,
        top_emission_sources: Optional[List[Dict]] = None,
        offsets_purchased: Optional[Decimal] = None,
        offsets_marketplace: Optional[Decimal] = None,
        calculation_count: Optional[int] = None
    ):
        self.company_name = company_name
        self.reporting_period_start = reporting_period_start
        self.reporting_period_end = reporting_period_end
        self.scope_1_total = float(scope_1_total)
        self.scope_2_total = float(scope_2_total)
        self.scope_3_total = float(scope_3_total)
        self.scope_2_location_based = float(scope_2_location_based) if scope_2_location_based else None
        self.scope_2_market_based = float(scope_2_market_based) if scope_2_market_based else None
        self.scope_3_breakdown = {k: float(v) for k, v in scope_3_breakdown.items()} if scope_3_breakdown else {}
        self.base_year = base_year
        self.base_year_emissions = float(base_year_emissions) if base_year_emissions else None
        self.net_zero_target_year = net_zero_target_year
        self.data_quality_score = float(data_quality_score) if data_quality_score else None
        self.verification_status = verification_status
        self.verified_by = verified_by
        self.top_emission_sources = top_emission_sources or []
        self.offsets_purchased = float(offsets_purchased) if offsets_purchased else 0
        self.offsets_marketplace = float(offsets_marketplace) if offsets_marketplace else 0
        self.calculation_count = calculation_count or 0

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
        """Generate complete GHG Protocol report"""

        # Cover page
        self.add_cover_page(
            subtitle="GHG Protocol Corporate Standard",
            reporting_period=self.data.reporting_period_str
        )

        # Table of contents
        self._add_table_of_contents()

        # Executive summary
        self._add_executive_summary()

        # Organizational boundaries
        self._add_organizational_boundaries()

        # Operational boundaries
        self._add_operational_boundaries()

        # Emissions summary
        self._add_emissions_summary()

        # Scope 1 detail
        self._add_scope_1_detail()

        # Scope 2 detail
        self._add_scope_2_detail()

        # Scope 3 detail
        self._add_scope_3_detail()

        # Progress toward targets
        if self.data.base_year and self.data.net_zero_target_year:
            self._add_progress_toward_targets()

        # Methodology
        self._add_methodology()

        # Data quality
        if self.data.data_quality_score:
            self._add_data_quality_assessment()

        # Verification statement
        if self.data.verification_status:
            self._add_verification_statement()

        # Appendices
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
        """Add Scope 2 details"""
        self.add_section("6. Scope 2: Indirect Emissions from Energy")

        if self.data.scope_2_location_based and self.data.scope_2_market_based:
            text = f"""
            Scope 2 emissions are reported using both location-based and market-based methods
            as recommended by the GHG Protocol Scope 2 Guidance.
            <br/><br/>
            • <b>Location-based method:</b> {NumberFormatter.format_emissions(self.data.scope_2_location_based)}<br/>
            • <b>Market-based method:</b> {NumberFormatter.format_emissions(self.data.scope_2_market_based)}<br/>
            """
        else:
            text = f"""
            Total Scope 2 emissions for the reporting period:
            <b>{NumberFormatter.format_emissions(self.data.scope_2_total)}</b>
            """

        self.add_paragraph(text)

        self.add_spacer(0.2)

        description = """
        Scope 2 emissions result from the generation of purchased electricity, heat, steam,
        and cooling consumed by the company. These are indirect emissions that occur at the
        facility where the energy is generated.
        """
        self.add_paragraph(description)

        self.add_page_break()

    def _add_scope_3_detail(self):
        """Add Scope 3 details"""
        self.add_section("7. Scope 3: Other Indirect Emissions")

        text = f"""
        Total Scope 3 emissions for the reporting period:
        <b>{NumberFormatter.format_emissions(self.data.scope_3_total)}</b>
        """
        self.add_paragraph(text)

        self.add_spacer(0.2)

        if self.data.scope_3_breakdown:
            self.add_subsection("Scope 3 Category Breakdown")

            category_data = []
            for cat_num, emissions in sorted(self.data.scope_3_breakdown.items()):
                if emissions > 0:
                    category_name = self.SCOPE_3_CATEGORIES.get(cat_num, f"Category {cat_num}")
                    pct = (emissions / self.data.scope_3_total * 100) if self.data.scope_3_total > 0 else 0
                    category_data.append([
                        f"Cat {cat_num}",
                        category_name,
                        NumberFormatter.format_number(emissions, 2),
                        NumberFormatter.format_percentage(pct)
                    ])

            cat_table = TableBuilder.create_summary_table(
                headers=['Category', 'Description', 'Emissions (tons CO2e)', 'Percentage'],
                data=category_data,
                col_widths=[0.75*inch, 2.5*inch, 1.75*inch, 1.5*inch]
            )

            self.add_table(cat_table)

            # Bar chart of top categories
            if len(category_data) > 1:
                self.add_spacer(0.3)
                self.add_subsection("Top Scope 3 Categories")

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
