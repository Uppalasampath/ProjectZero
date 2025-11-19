"""
API endpoints for report generation
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from io import BytesIO

from app.db.base import get_db
from app.services.report_service import ReportService


router = APIRouter()


# Request/Response models
class GenerateReportRequest(BaseModel):
    """Request to generate a report"""
    inventory_id: UUID
    report_type: str = "GHG_PROTOCOL"  # GHG_PROTOCOL, CSRD, CDP, etc.
    report_format: str = "PDF"  # PDF, EXCEL, XBRL


class GenerateReportResponse(BaseModel):
    """Response after generating a report"""
    report_id: UUID
    status: str
    message: str
    file_url: Optional[str] = None
    generation_duration_ms: int

    class Config:
        from_attributes = True


class ReportListItem(BaseModel):
    """Report list item"""
    id: UUID
    report_type: str
    report_format: str
    report_title: str
    reporting_period_start: datetime
    reporting_period_end: datetime
    generated_at: datetime
    file_size_bytes: int
    download_count: int

    class Config:
        from_attributes = True


# Endpoints

@router.post("/generate", response_model=GenerateReportResponse)
async def generate_report(
    request: GenerateReportRequest,
    db: Session = Depends(get_db),
    # user_id: UUID = Depends(get_current_user)  # TODO: Add auth
):
    """
    Generate an audit-ready emissions report

    Supports multiple report types:
    - GHG_PROTOCOL: GHG Protocol Corporate Standard
    - CSRD: EU Corporate Sustainability Reporting Directive (coming soon)
    - CDP: Carbon Disclosure Project (coming soon)

    Args:
        request: Report generation request
        db: Database session
        user_id: Current user ID

    Returns:
        Report generation response with report ID and download URL
    """
    # For demo, use a dummy user ID
    # In production, get from authentication
    dummy_user_id = UUID('00000000-0000-0000-0000-000000000001')

    service = ReportService(db)

    try:
        if request.report_type == "GHG_PROTOCOL":
            pdf_bytes, report_record = service.generate_ghg_protocol_report(
                inventory_id=request.inventory_id,
                user_id=dummy_user_id
            )

            return GenerateReportResponse(
                report_id=report_record.id,
                status="success",
                message="GHG Protocol report generated successfully",
                file_url=f"/api/v1/reports/{report_record.id}/download",
                generation_duration_ms=report_record.generation_duration_ms
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Report type '{request.report_type}' not supported yet. Currently supports: GHG_PROTOCOL"
            )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/{report_id}", response_model=ReportListItem)
async def get_report(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get report metadata

    Args:
        report_id: Report ID
        db: Database session

    Returns:
        Report metadata
    """
    service = ReportService(db)
    report = service.get_report(report_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return report


@router.get("/{report_id}/download")
async def download_report(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Download report PDF file

    Args:
        report_id: Report ID
        db: Database session

    Returns:
        PDF file stream
    """
    service = ReportService(db)

    # Get report metadata
    report = service.get_report(report_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Download file
    pdf_bytes = service.download_report(report_id)

    if not pdf_bytes:
        raise HTTPException(status_code=404, detail="Report file not found")

    # Return as streaming response
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={report.report_title.replace(' ', '_')}.pdf"
        }
    )


@router.get("/", response_model=List[ReportListItem])
async def list_reports(
    organization_id: UUID,
    report_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List reports for an organization

    Args:
        organization_id: Organization ID
        report_type: Optional filter by report type
        limit: Maximum number of reports to return
        db: Database session

    Returns:
        List of reports
    """
    service = ReportService(db)
    reports = service.list_reports(
        organization_id=organization_id,
        report_type=report_type,
        limit=limit
    )

    return reports
