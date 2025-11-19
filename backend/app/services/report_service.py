"""
Report Generation Service
Fetches data from database and generates PDF/Excel reports
"""
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.emission_data import (
    EmissionInventory,
    EmissionDataSource,
    Calculation,
    Organization,
    GeneratedReport
)
from app.services.reports import GHGProtocolReportGenerator, GHGProtocolReportData
import hashlib
import os


class ReportService:
    """Service for generating and managing reports"""

    def __init__(self, db: Session):
        self.db = db

    def generate_ghg_protocol_report(
        self,
        inventory_id: UUID,
        user_id: UUID,
        output_path: Optional[str] = None
    ) -> tuple[bytes, GeneratedReport]:
        """
        Generate GHG Protocol Corporate Standard PDF report

        Args:
            inventory_id: Emission inventory ID
            user_id: User generating the report
            output_path: Optional path to save report file

        Returns:
            Tuple of (PDF bytes, GeneratedReport database record)
        """
        # Fetch inventory
        inventory = self.db.query(EmissionInventory).filter(
            EmissionInventory.id == inventory_id
        ).first()

        if not inventory:
            raise ValueError(f"Inventory {inventory_id} not found")

        # Fetch organization
        organization = self.db.query(Organization).filter(
            Organization.id == inventory.organization_id
        ).first()

        if not organization:
            raise ValueError(f"Organization {inventory.organization_id} not found")

        # Get top emission sources
        top_sources = self._get_top_emission_sources(inventory.organization_id, inventory.id)

        # Prepare report data
        report_data = GHGProtocolReportData(
            company_name=organization.company_name,
            reporting_period_start=inventory.reporting_period_start,
            reporting_period_end=inventory.reporting_period_end,
            scope_1_total=inventory.scope_1_total,
            scope_2_total=inventory.scope_2_total,
            scope_3_total=inventory.scope_3_total,
            scope_2_location_based=inventory.scope_2_location_based,
            scope_2_market_based=inventory.scope_2_market_based,
            scope_3_breakdown=inventory.scope_3_breakdown,
            base_year=organization.baseline_year,
            base_year_emissions=self._get_base_year_emissions(
                organization.id,
                organization.baseline_year
            ) if organization.baseline_year else None,
            net_zero_target_year=organization.net_zero_target_year,
            data_quality_score=inventory.data_quality_score,
            verification_status=inventory.verification_status,
            verified_by=inventory.verified_by_organization,
            top_emission_sources=top_sources,
            offsets_purchased=inventory.carbon_offsets_purchased or Decimal(0),
            offsets_marketplace=inventory.carbon_credits_from_marketplace or Decimal(0),
            calculation_count=inventory.calculation_count
        )

        # Generate PDF
        start_time = datetime.utcnow()
        generator = GHGProtocolReportGenerator(report_data)
        pdf_bytes = generator.generate()
        generation_duration = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        # Calculate file hash
        file_hash = hashlib.sha256(pdf_bytes).hexdigest()

        # Save file if path provided
        file_url = None
        if output_path:
            os.makedirs(output_path, exist_ok=True)
            filename = f"ghg_protocol_{inventory_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            file_path = os.path.join(output_path, filename)
            with open(file_path, 'wb') as f:
                f.write(pdf_bytes)
            file_url = file_path
        else:
            # Default storage location
            storage_path = os.getenv('REPORTS_STORAGE_PATH', './storage/reports')
            os.makedirs(storage_path, exist_ok=True)
            filename = f"ghg_protocol_{inventory_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            file_path = os.path.join(storage_path, filename)
            with open(file_path, 'wb') as f:
                f.write(pdf_bytes)
            file_url = file_path

        # Create database record
        generated_report = GeneratedReport(
            organization_id=inventory.organization_id,
            inventory_id=inventory.id,
            report_type='GHG_PROTOCOL',
            report_format='PDF',
            reporting_period_start=inventory.reporting_period_start,
            reporting_period_end=inventory.reporting_period_end,
            file_url=file_url,
            file_size_bytes=len(pdf_bytes),
            file_hash=file_hash,
            report_title='GHG Emissions Inventory Report',
            report_version='1.0',
            template_version='1.0',
            generated_by=user_id,
            generation_duration_ms=generation_duration
        )

        self.db.add(generated_report)
        self.db.commit()
        self.db.refresh(generated_report)

        return pdf_bytes, generated_report

    def _get_top_emission_sources(
        self,
        organization_id: UUID,
        inventory_id: UUID,
        limit: int = 10
    ) -> list[dict]:
        """
        Get top emission sources for an inventory

        Args:
            organization_id: Organization ID
            inventory_id: Inventory ID
            limit: Number of top sources to return

        Returns:
            List of emission sources with emissions and percentages
        """
        # Get inventory to know the reporting period
        inventory = self.db.query(EmissionInventory).filter(
            EmissionInventory.id == inventory_id
        ).first()

        if not inventory:
            return []

        # Query calculations for this period
        sources = self.db.query(
            EmissionDataSource.category,
            func.sum(Calculation.co2e_kg).label('total_kg')
        ).join(
            Calculation,
            Calculation.data_source_id == EmissionDataSource.id
        ).filter(
            EmissionDataSource.organization_id == organization_id,
            EmissionDataSource.reporting_period_start >= inventory.reporting_period_start,
            EmissionDataSource.reporting_period_end <= inventory.reporting_period_end
        ).group_by(
            EmissionDataSource.category
        ).order_by(
            func.sum(Calculation.co2e_kg).desc()
        ).limit(limit).all()

        # Calculate total for percentages
        total_emissions = sum(source.total_kg for source in sources)

        # Format results
        result = []
        for source in sources:
            emissions_tons = float(source.total_kg) / 1000
            percentage = (float(source.total_kg) / total_emissions * 100) if total_emissions > 0 else 0

            result.append({
                'category': source.category.replace('_', ' ').title(),
                'emissions': emissions_tons,
                'percentage': percentage
            })

        return result

    def _get_base_year_emissions(
        self,
        organization_id: UUID,
        base_year: int
    ) -> Optional[Decimal]:
        """
        Get total emissions for base year

        Args:
            organization_id: Organization ID
            base_year: Base year

        Returns:
            Total emissions in tons CO2e, or None if not found
        """
        inventory = self.db.query(EmissionInventory).filter(
            EmissionInventory.organization_id == organization_id,
            func.extract('year', EmissionInventory.reporting_period_start) == base_year
        ).first()

        if inventory:
            return inventory.total_emissions

        return None

    def get_report(self, report_id: UUID) -> Optional[GeneratedReport]:
        """Get report by ID"""
        return self.db.query(GeneratedReport).filter(
            GeneratedReport.id == report_id
        ).first()

    def list_reports(
        self,
        organization_id: UUID,
        report_type: Optional[str] = None,
        limit: int = 50
    ) -> list[GeneratedReport]:
        """List reports for an organization"""
        query = self.db.query(GeneratedReport).filter(
            GeneratedReport.organization_id == organization_id
        )

        if report_type:
            query = query.filter(GeneratedReport.report_type == report_type)

        return query.order_by(
            GeneratedReport.generated_at.desc()
        ).limit(limit).all()

    def download_report(self, report_id: UUID) -> Optional[bytes]:
        """
        Download report file

        Args:
            report_id: Report ID

        Returns:
            PDF bytes, or None if not found
        """
        report = self.get_report(report_id)

        if not report or not report.file_url:
            return None

        # Read file
        try:
            with open(report.file_url, 'rb') as f:
                pdf_bytes = f.read()

            # Update download stats
            report.download_count += 1
            report.last_downloaded_at = datetime.utcnow()
            self.db.commit()

            return pdf_bytes
        except FileNotFoundError:
            return None
