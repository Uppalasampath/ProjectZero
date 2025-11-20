"""
Pydantic schemas for API validation and serialization
"""

from .company import (
    CompanyBase,
    CompanyCreate,
    CompanyUpdate,
    CompanyResponse,
    CompanyListResponse
)

from .facility import (
    FacilityBase,
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse,
    FacilityListResponse
)

from .emissions import (
    ScopeType,
    DataQualityTier,
    ActivityDataBase,
    ActivityDataCreate,
    ActivityDataResponse,
    ActivityDataListResponse,
    EmissionsDataBase,
    EmissionsDataCreate,
    EmissionsDataUpdate,
    EmissionsDataResponse,
    EmissionsDataListResponse,
    Scope3CategoryData,
    Scope3CategoryCreate,
    Scope3CategoryResponse,
    BulkImportResponse
)

from .dashboard import (
    EmissionsByScope,
    EmissionsByFacility,
    EmissionsByCategory,
    EmissionsByGas,
    EmissionsTrend,
    DataQualitySummary,
    DashboardSummary,
    CarbonEngineMetrics,
    DashboardQueryParams
)

from .report import (
    ReportType,
    ReportFormat,
    AssuranceLevel,
    ReportSection,
    ReportConfigBase,
    ReportConfigCreate,
    ReportConfigUpdate,
    ReportConfigResponse,
    ReportGenerateRequest,
    ReportGenerateResponse,
    ReportResponse,
    ReportListResponse,
    ExternalServiceConnector
)

__all__ = [
    # Company
    "CompanyBase",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyResponse",
    "CompanyListResponse",

    # Facility
    "FacilityBase",
    "FacilityCreate",
    "FacilityUpdate",
    "FacilityResponse",
    "FacilityListResponse",

    # Emissions
    "ScopeType",
    "DataQualityTier",
    "ActivityDataBase",
    "ActivityDataCreate",
    "ActivityDataResponse",
    "ActivityDataListResponse",
    "EmissionsDataBase",
    "EmissionsDataCreate",
    "EmissionsDataUpdate",
    "EmissionsDataResponse",
    "EmissionsDataListResponse",
    "Scope3CategoryData",
    "Scope3CategoryCreate",
    "Scope3CategoryResponse",
    "BulkImportResponse",

    # Dashboard
    "EmissionsByScope",
    "EmissionsByFacility",
    "EmissionsByCategory",
    "EmissionsByGas",
    "EmissionsTrend",
    "DataQualitySummary",
    "DashboardSummary",
    "CarbonEngineMetrics",
    "DashboardQueryParams",

    # Report
    "ReportType",
    "ReportFormat",
    "AssuranceLevel",
    "ReportSection",
    "ReportConfigBase",
    "ReportConfigCreate",
    "ReportConfigUpdate",
    "ReportConfigResponse",
    "ReportGenerateRequest",
    "ReportGenerateResponse",
    "ReportResponse",
    "ReportListResponse",
    "ExternalServiceConnector",
]
