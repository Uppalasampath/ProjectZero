"""
Pydantic schemas for Report Configuration and Generation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import date
from enum import Enum


class ReportType(str, Enum):
    """Report types available"""
    GHG_PROTOCOL = "ghg_protocol"
    SB253 = "sb253"
    CDP = "cdp"
    TCFD = "tcfd"
    CUSTOM = "custom"


class ReportFormat(str, Enum):
    """Report output formats"""
    PDF = "pdf"
    EXCEL = "excel"
    JSON = "json"


class AssuranceLevel(str, Enum):
    """Third-party assurance levels"""
    NONE = "none"
    LIMITED = "limited"
    REASONABLE = "reasonable"


class ReportSection(str, Enum):
    """Available report sections"""
    EXECUTIVE_SUMMARY = "executive_summary"
    COMPANY_INFO = "company_info"
    ORGANIZATIONAL_BOUNDARY = "organizational_boundary"
    REPORTING_PERIOD = "reporting_period"
    GHG_BREAKDOWN = "ghg_breakdown"
    SCOPE_1_DETAIL = "scope_1_detail"
    SCOPE_2_DETAIL = "scope_2_detail"
    SCOPE_3_DETAIL = "scope_3_detail"
    FACILITY_EMISSIONS = "facility_emissions"
    EMISSIONS_TREND = "emissions_trend"
    DATA_QUALITY = "data_quality"
    METHODOLOGY = "methodology"
    BASE_YEAR = "base_year"
    CARBON_OFFSETS = "carbon_offsets"
    REDUCTION_TARGETS = "reduction_targets"
    VERIFICATION = "verification"
    APPENDIX = "appendix"


class ReportConfigBase(BaseModel):
    """Base report configuration"""
    company_id: int = Field(..., description="Company ID")
    report_type: ReportType = Field(..., description="Type of report")
    report_format: ReportFormat = Field(default=ReportFormat.PDF, description="Output format")

    # Reporting period
    reporting_period_start: date = Field(..., description="Start date")
    reporting_period_end: date = Field(..., description="End date")

    # Report sections to include
    sections: List[ReportSection] = Field(..., min_items=1, description="Sections to include in report")

    # Authorization
    authorized_by_name: str = Field(..., min_length=1, max_length=255, description="Authorizing person name")
    authorized_by_title: str = Field(..., max_length=100, description="Authorizing person title")
    authorization_date: Optional[date] = Field(None, description="Date of authorization")

    # Verification
    assurance_level: AssuranceLevel = Field(default=AssuranceLevel.NONE)
    verifier_name: Optional[str] = Field(None, max_length=255)
    verifier_accreditation: Optional[str] = Field(None, max_length=255)
    verification_date: Optional[date] = None

    # Additional options
    include_facility_breakdown: bool = Field(default=True)
    include_category_breakdown: bool = Field(default=True)
    include_gas_breakdown: bool = Field(default=True)
    include_trends: bool = Field(default=False)
    include_charts: bool = Field(default=True)

    # Custom options
    custom_logo_url: Optional[str] = Field(None, max_length=500)
    custom_footer_text: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=2000)

    @validator('reporting_period_end')
    def validate_period(cls, v, values):
        if 'reporting_period_start' in values and v < values['reporting_period_start']:
            raise ValueError('reporting_period_end must be after reporting_period_start')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "company_id": 1,
                "report_type": "ghg_protocol",
                "report_format": "pdf",
                "reporting_period_start": "2024-01-01",
                "reporting_period_end": "2024-12-31",
                "sections": [
                    "company_info",
                    "scope_1_detail",
                    "scope_2_detail",
                    "scope_3_detail",
                    "verification"
                ],
                "authorized_by_name": "John Smith",
                "authorized_by_title": "Chief Sustainability Officer",
                "assurance_level": "limited"
            }
        }


class ReportConfigCreate(ReportConfigBase):
    """Schema for creating report configuration"""
    pass


class ReportConfigUpdate(BaseModel):
    """Schema for updating report configuration"""
    sections: Optional[List[ReportSection]] = None
    authorized_by_name: Optional[str] = Field(None, min_length=1, max_length=255)
    authorized_by_title: Optional[str] = Field(None, max_length=100)
    assurance_level: Optional[AssuranceLevel] = None
    verifier_name: Optional[str] = Field(None, max_length=255)
    include_facility_breakdown: Optional[bool] = None
    include_trends: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=2000)


class ReportConfigResponse(ReportConfigBase):
    """Schema for report configuration response"""
    id: int
    created_at: date
    updated_at: Optional[date] = None

    class Config:
        from_attributes = True


class ReportGenerateRequest(BaseModel):
    """Request to generate a report"""
    config_id: Optional[int] = Field(None, description="Use existing config ID")
    config: Optional[ReportConfigCreate] = Field(None, description="Or provide inline config")

    @validator('config')
    def validate_config_or_id(cls, v, values):
        if not v and not values.get('config_id'):
            raise ValueError('Either config_id or config must be provided')
        if v and values.get('config_id'):
            raise ValueError('Provide either config_id or config, not both')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "config_id": 1
            }
        }


class ReportGenerateResponse(BaseModel):
    """Response after generating report"""
    success: bool
    report_id: int
    report_type: ReportType
    report_format: ReportFormat
    file_size_bytes: int
    download_url: str
    expires_at: Optional[date] = Field(None, description="Download link expiry")
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "report_id": 123,
                "report_type": "ghg_protocol",
                "report_format": "pdf",
                "file_size_bytes": 524288,
                "download_url": "/api/v1/reports/123/download",
                "message": "Report generated successfully"
            }
        }


class ReportResponse(BaseModel):
    """Schema for report metadata response"""
    id: int
    company_id: int
    report_type: ReportType
    report_format: ReportFormat
    reporting_period_start: date
    reporting_period_end: date
    file_name: str
    file_size_bytes: int
    download_url: str
    generated_at: date
    generated_by: Optional[str] = None
    status: str = Field(..., description="pending, completed, failed")

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Schema for list of reports"""
    total: int
    reports: List[ReportResponse]


class ExternalServiceConnector(BaseModel):
    """Configuration for external service connectors"""
    service_name: str = Field(..., max_length=100, description="Name of external service")
    service_type: str = Field(..., max_length=50, description="ERP, utility, waste_management, etc.")
    api_endpoint: str = Field(..., max_length=500, description="API endpoint URL")
    api_key: Optional[str] = Field(None, max_length=255, description="API key (encrypted)")
    auth_type: str = Field(default="api_key", description="api_key, oauth2, basic, etc.")
    enabled: bool = Field(default=True)
    sync_frequency: Optional[str] = Field(None, description="daily, weekly, monthly, manual")
    last_sync_date: Optional[date] = None
    mapping_config: Optional[Dict] = Field(None, description="Field mapping configuration")

    class Config:
        json_schema_extra = {
            "example": {
                "service_name": "SAP ERP",
                "service_type": "erp",
                "api_endpoint": "https://api.sap.com/v1/emissions",
                "auth_type": "oauth2",
                "sync_frequency": "daily"
            }
        }
