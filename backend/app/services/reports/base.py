"""
PDF Report Generator Base Classes
Professional report styling and utilities
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from datetime import datetime
from typing import List, Dict, Any, Optional
from decimal import Decimal
import io


class ReportColors:
    """Color palette for reports"""
    PRIMARY = colors.HexColor('#10b981')  # Green
    SECONDARY = colors.HexColor('#3b82f6')  # Blue
    ACCENT = colors.HexColor('#8b5cf6')  # Purple
    DARK = colors.HexColor('#1f2937')  # Dark gray
    LIGHT_GRAY = colors.HexColor('#f3f4f6')
    MEDIUM_GRAY = colors.HexColor('#9ca3af')
    SUCCESS = colors.HexColor('#10b981')
    WARNING = colors.HexColor('#f59e0b')
    DANGER = colors.HexColor('#ef4444')

    # Scope colors
    SCOPE_1 = colors.HexColor('#3b82f6')  # Blue
    SCOPE_2 = colors.HexColor('#10b981')  # Green
    SCOPE_3 = colors.HexColor('#8b5cf6')  # Purple


class ReportStyles:
    """Paragraph styles for reports"""

    @staticmethod
    def get_styles():
        """Get custom paragraph styles"""
        styles = getSampleStyleSheet()

        # Title
        styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=ReportColors.DARK,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Subtitle
        styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=ReportColors.MEDIUM_GRAY,
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

        # Section Header
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=ReportColors.PRIMARY,
            spaceBefore=20,
            spaceAfter=12,
            fontName='Helvetica-Bold',
            borderWidth=0,
            borderColor=ReportColors.PRIMARY,
            borderPadding=0,
            leftIndent=0
        ))

        # Subsection Header
        styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=ReportColors.DARK,
            spaceBefore=12,
            spaceAfter=8,
            fontName='Helvetica-Bold'
        ))

        # Body Text
        styles.add(ParagraphStyle(
            name='ReportBody',
            parent=styles['Normal'],
            fontSize=10,
            textColor=ReportColors.DARK,
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            fontName='Helvetica'
        ))

        # Small Text
        styles.add(ParagraphStyle(
            name='SmallText',
            parent=styles['Normal'],
            fontSize=8,
            textColor=ReportColors.MEDIUM_GRAY,
            spaceAfter=6,
            fontName='Helvetica'
        ))

        # Footer
        styles.add(ParagraphStyle(
            name='Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=ReportColors.MEDIUM_GRAY,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

        # Table Header
        styles.add(ParagraphStyle(
            name='TableHeader',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER
        ))

        return styles


class NumberFormatter:
    """Utility for formatting numbers in reports"""

    @staticmethod
    def format_number(value: float, decimals: int = 2) -> str:
        """Format number with thousands separator"""
        return f"{value:,.{decimals}f}"

    @staticmethod
    def format_emissions(tons_co2e: float) -> str:
        """Format emissions value"""
        return f"{NumberFormatter.format_number(tons_co2e, 2)} tons CO2e"

    @staticmethod
    def format_percentage(value: float) -> str:
        """Format percentage"""
        return f"{value:.1f}%"

    @staticmethod
    def format_currency(amount: float, currency: str = "USD") -> str:
        """Format currency"""
        return f"{currency} {NumberFormatter.format_number(amount, 2)}"


class ChartGenerator:
    """Generate charts for reports"""

    @staticmethod
    def create_pie_chart(
        data: List[tuple],  # [(label, value), ...]
        slice_colors: List,
        width: int = 300,
        height: int = 300
    ) -> Drawing:
        """
        Create a pie chart

        Args:
            data: List of (label, value) tuples
            slice_colors: List of colors for slices
            width: Chart width
            height: Chart height

        Returns:
            Drawing object
        """
        drawing = Drawing(width, height)

        pie = Pie()
        pie.x = 50
        pie.y = 50
        pie.width = 200
        pie.height = 200

        # Set data
        pie.data = [value for _, value in data]
        pie.labels = [label for label, _ in data]

        # Set colors
        for i, color in enumerate(slice_colors):
            pie.slices[i].fillColor = color

        # Style
        pie.slices.strokeWidth = 0.5
        pie.slices.strokeColor = colors.white
        pie.slices.fontName = 'Helvetica'
        pie.slices.fontSize = 9

        # Show percentages
        pie.slices.labelRadius = 1.25
        pie.sideLabels = True

        drawing.add(pie)
        return drawing

    @staticmethod
    def create_bar_chart(
        categories: List[str],
        values: List[float],
        color: colors.Color = ReportColors.PRIMARY,
        width: int = 400,
        height: int = 250,
        y_axis_label: str = "tons CO2e"
    ) -> Drawing:
        """
        Create a vertical bar chart

        Args:
            categories: X-axis labels
            values: Y-axis values
            color: Bar color
            width: Chart width
            height: Chart height
            y_axis_label: Y-axis label

        Returns:
            Drawing object
        """
        drawing = Drawing(width, height)

        chart = VerticalBarChart()
        chart.x = 50
        chart.y = 50
        chart.width = width - 100
        chart.height = height - 100

        # Set data
        chart.data = [values]
        chart.categoryAxis.categoryNames = categories

        # Style bars
        chart.bars[0].fillColor = color
        chart.bars[0].strokeColor = colors.white
        chart.bars[0].strokeWidth = 0.5

        # Axis styling
        chart.valueAxis.valueMin = 0
        chart.valueAxis.valueMax = max(values) * 1.2 if values else 100
        chart.valueAxis.valueStep = max(values) / 5 if values else 20

        chart.categoryAxis.labels.boxAnchor = 'ne'
        chart.categoryAxis.labels.dx = -8
        chart.categoryAxis.labels.dy = -2
        chart.categoryAxis.labels.angle = 30
        chart.categoryAxis.labels.fontName = 'Helvetica'
        chart.categoryAxis.labels.fontSize = 8

        chart.valueAxis.labels.fontName = 'Helvetica'
        chart.valueAxis.labels.fontSize = 8

        drawing.add(chart)
        return drawing


class TableBuilder:
    """Utility for building styled tables"""

    @staticmethod
    def create_summary_table(
        headers: List[str],
        data: List[List[Any]],
        col_widths: Optional[List[float]] = None
    ) -> Table:
        """
        Create a styled summary table

        Args:
            headers: Column headers
            data: Table data (list of rows)
            col_widths: Column widths in inches

        Returns:
            Styled Table object
        """
        # Combine headers and data
        table_data = [headers] + data

        # Default column widths
        if not col_widths:
            num_cols = len(headers)
            col_widths = [6.5 * inch / num_cols] * num_cols

        # Create table
        table = Table(table_data, colWidths=col_widths)

        # Style
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), ReportColors.PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),

            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), ReportColors.DARK),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('LEFTPADDING', (0, 1), (-1, -1), 10),
            ('RIGHTPADDING', (0, 1), (-1, -1), 10),

            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, ReportColors.LIGHT_GRAY),

            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ReportColors.LIGHT_GRAY]),
        ]))

        return table

    @staticmethod
    def create_data_quality_table(
        tier: int,
        description: str,
        percentage: float
    ) -> Table:
        """Create data quality assessment table"""
        data = [
            ['Data Quality Tier', 'Description', 'Percentage of Data'],
            [f'Tier {tier}', description, f'{percentage:.1f}%']
        ]

        return TableBuilder.create_summary_table(
            headers=data[0],
            data=data[1:],
            col_widths=[1.5*inch, 3.5*inch, 1.5*inch]
        )


class PageTemplate:
    """Custom page template with header and footer"""

    @staticmethod
    def add_page_number(canvas, doc):
        """Add page number to footer"""
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(ReportColors.MEDIUM_GRAY)
        canvas.drawRightString(
            doc.pagesize[0] - 0.75*inch,
            0.5*inch,
            text
        )
        canvas.restoreState()

    @staticmethod
    def add_header_footer(canvas, doc, company_name: str, report_title: str):
        """Add header and footer to page"""
        canvas.saveState()

        # Header
        canvas.setFont('Helvetica-Bold', 10)
        canvas.setFillColor(ReportColors.DARK)
        canvas.drawString(
            0.75*inch,
            doc.pagesize[1] - 0.5*inch,
            company_name
        )

        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(ReportColors.MEDIUM_GRAY)
        canvas.drawRightString(
            doc.pagesize[0] - 0.75*inch,
            doc.pagesize[1] - 0.5*inch,
            report_title
        )

        # Header line
        canvas.setStrokeColor(ReportColors.LIGHT_GRAY)
        canvas.setLineWidth(0.5)
        canvas.line(
            0.75*inch,
            doc.pagesize[1] - 0.6*inch,
            doc.pagesize[0] - 0.75*inch,
            doc.pagesize[1] - 0.6*inch
        )

        # Footer
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(ReportColors.MEDIUM_GRAY)

        # Date
        canvas.drawString(
            0.75*inch,
            0.5*inch,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )

        # Page number
        page_num = canvas.getPageNumber()
        canvas.drawRightString(
            doc.pagesize[0] - 0.75*inch,
            0.5*inch,
            f"Page {page_num}"
        )

        # Footer line
        canvas.setStrokeColor(ReportColors.LIGHT_GRAY)
        canvas.setLineWidth(0.5)
        canvas.line(
            0.75*inch,
            0.7*inch,
            doc.pagesize[0] - 0.75*inch,
            0.7*inch
        )

        canvas.restoreState()


class BaseReportGenerator:
    """Base class for all report generators"""

    def __init__(
        self,
        company_name: str,
        report_title: str,
        page_size=letter
    ):
        self.company_name = company_name
        self.report_title = report_title
        self.page_size = page_size
        self.styles = ReportStyles.get_styles()
        self.story = []

    def add_cover_page(self, subtitle: str, reporting_period: str):
        """Add cover page to report"""
        # Logo placeholder
        self.story.append(Spacer(1, 2*inch))

        # Title
        title = Paragraph(self.report_title, self.styles['ReportTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 0.3*inch))

        # Subtitle
        subtitle_para = Paragraph(subtitle, self.styles['ReportSubtitle'])
        self.story.append(subtitle_para)
        self.story.append(Spacer(1, 0.5*inch))

        # Company name
        company_para = Paragraph(
            f"<b>{self.company_name}</b>",
            self.styles['ReportSubtitle']
        )
        self.story.append(company_para)
        self.story.append(Spacer(1, 0.3*inch))

        # Reporting period
        period_para = Paragraph(
            f"Reporting Period: {reporting_period}",
            self.styles['ReportBody']
        )
        self.story.append(KeepTogether([period_para]))
        self.story.append(Spacer(1, 0.2*inch))

        # Generated date
        date_para = Paragraph(
            f"Generated: {datetime.now().strftime('%B %d, %Y')}",
            self.styles['SmallText']
        )
        self.story.append(date_para)

        # Page break
        self.story.append(PageBreak())

    def add_section(self, title: str):
        """Add section header"""
        section = Paragraph(title, self.styles['SectionHeader'])
        self.story.append(section)

    def add_subsection(self, title: str):
        """Add subsection header"""
        subsection = Paragraph(title, self.styles['SubsectionHeader'])
        self.story.append(subsection)

    def add_paragraph(self, text: str, style: str = 'ReportBody'):
        """Add paragraph"""
        para = Paragraph(text, self.styles[style])
        self.story.append(para)

    def add_spacer(self, height: float = 0.2):
        """Add vertical space"""
        self.story.append(Spacer(1, height*inch))

    def add_table(self, table: Table):
        """Add table"""
        self.story.append(table)
        self.add_spacer(0.2)

    def add_chart(self, drawing: Drawing):
        """Add chart"""
        self.story.append(drawing)
        self.add_spacer(0.2)

    def add_page_break(self):
        """Add page break"""
        self.story.append(PageBreak())

    def build(self, filename: str) -> bytes:
        """
        Build the PDF report

        Args:
            filename: Output filename

        Returns:
            PDF bytes
        """
        # Create PDF in memory
        buffer = io.BytesIO()

        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=1*inch,
            title=self.report_title,
            author=self.company_name
        )

        # Build with custom page template
        doc.build(
            self.story,
            onFirstPage=lambda c, d: PageTemplate.add_header_footer(
                c, d, self.company_name, self.report_title
            ),
            onLaterPages=lambda c, d: PageTemplate.add_header_footer(
                c, d, self.company_name, self.report_title
            )
        )

        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes
