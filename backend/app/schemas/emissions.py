"""
Pydantic schemas for Emissions and Activity Data
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import date
from decimal import Decimal
from enum import Enum


class ScopeType(str, Enum):
    """Emission scope types"""
    SCOPE_1 = "scope_1"
    SCOPE_2 = "scope_2"
    SCOPE_3 = "scope_3"


class DataQualityTier(str, Enum):
    """Data quality tiers"""
    TIER_1 = "tier_1"  # Supplier/metered data
    TIER_2 = "tier_2"  # Regional averages
    TIER_3 = "tier_3"  # Industry averages
    TIER_4 = "tier_4"  # Estimates


# ============= Activity Data Schemas =============

class ActivityDataBase(BaseModel):
    """Base activity data (fuel use, electricity, etc.)"""
    facility_id: int = Field(..., description="Facility ID")
    activity_type: str = Field(..., max_length=100, description="electricity, natural_gas, diesel, etc.")
    activity_date: date = Field(..., description="Date of activity")

    # Activity amount
    activity_amount: Decimal = Field(..., gt=0, description="Amount of activity")
    activity_unit: str = Field(..., max_length=50, description="kwh, liters, therms, kg, etc.")

    # Metadata
    data_source: Optional[str] = Field(None, max_length=255, description="Utility bill, meter reading, etc.")
    data_quality: DataQualityTier = Field(default=DataQualityTier.TIER_2)
    notes: Optional[str] = Field(None, max_length=1000)
    uploaded_file_name: Optional[str] = Field(None, max_length=255)

    class Config:
        from_attributes = True


class ActivityDataCreate(ActivityDataBase):
    """Schema for creating activity data"""
    pass


class ActivityDataResponse(ActivityDataBase):
    """Schema for activity data response"""
    id: int
    created_at: date

    class Config:
        from_attributes = True


class ActivityDataListResponse(BaseModel):
    """Schema for list of activity data"""
    total: int
    activity_data: List[ActivityDataResponse]


# ============= Emissions Data Schemas =============

class EmissionsDataBase(BaseModel):
    """Base emissions data"""
    facility_id: int = Field(..., description="Facility ID")
    scope: ScopeType = Field(..., description="Emission scope")
    category: str = Field(..., max_length=100, description="Emission category")

    # Reporting period
    reporting_period_start: date = Field(..., description="Start date of reporting period")
    reporting_period_end: date = Field(..., description="End date of reporting period")

    # Emissions (in kg CO2e)
    co2e_kg: Decimal = Field(..., ge=0, description="Total CO2 equivalent in kg")
    co2_kg: Optional[Decimal] = Field(None, ge=0, description="CO2 in kg")
    ch4_kg: Optional[Decimal] = Field(None, ge=0, description="CH4 in kg")
    n2o_kg: Optional[Decimal] = Field(None, ge=0, description="N2O in kg")
    biogenic_co2_kg: Optional[Decimal] = Field(None, ge=0, description="Biogenic CO2 in kg (reported separately)")

    # Calculation details
    emission_factor_id: Optional[int] = Field(None, description="Emission factor used")
    calculation_method: Optional[str] = Field(None, max_length=255)
    calculation_formula: Optional[str] = Field(None, max_length=1000)

    # Data quality
    data_quality: DataQualityTier = Field(default=DataQualityTier.TIER_2)
    data_completeness_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    estimated: bool = Field(default=False, description="Whether data is estimated")

    # Metadata
    notes: Optional[str] = Field(None, max_length=1000)

    @validator('reporting_period_end')
    def validate_period(cls, v, values):
        if 'reporting_period_start' in values and v < values['reporting_period_start']:
            raise ValueError('reporting_period_end must be after reporting_period_start')
        return v

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "facility_id": 1,
                "scope": "scope_1",
                "category": "stationary_combustion",
                "reporting_period_start": "2024-01-01",
                "reporting_period_end": "2024-12-31",
                "co2e_kg": 1500000.0,
                "data_quality": "tier_1",
                "estimated": False
            }
        }


class EmissionsDataCreate(EmissionsDataBase):
    """Schema for creating emissions data"""
    pass


class EmissionsDataUpdate(BaseModel):
    """Schema for updating emissions data (all fields optional)"""
    co2e_kg: Optional[Decimal] = Field(None, ge=0)
    co2_kg: Optional[Decimal] = Field(None, ge=0)
    ch4_kg: Optional[Decimal] = Field(None, ge=0)
    n2o_kg: Optional[Decimal] = Field(None, ge=0)
    data_quality: Optional[DataQualityTier] = None
    data_completeness_pct: Optional[Decimal] = Field(None, ge=0, le=100)
    estimated: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=1000)


class EmissionsDataResponse(EmissionsDataBase):
    """Schema for emissions data response"""
    id: int
    co2e_tons: Decimal = Field(..., description="CO2e in metric tons")
    created_at: date
    updated_at: Optional[date] = None

    class Config:
        from_attributes = True


class EmissionsDataListResponse(BaseModel):
    """Schema for list of emissions data"""
    total: int
    emissions_data: List[EmissionsDataResponse]


# ============= Scope 3 Category Schemas =============

class Scope3CategoryData(BaseModel):
    """Scope 3 data by category"""
    category_number: int = Field(..., ge=1, le=15, description="Scope 3 category (1-15)")
    category_name: str = Field(..., max_length=255)
    co2e_kg: Decimal = Field(..., ge=0)
    methodology: Optional[str] = Field(None, max_length=500)
    excluded: bool = Field(default=False)
    exclusion_rationale: Optional[str] = Field(None, max_length=1000)

    class Config:
        from_attributes = True


class Scope3CategoryCreate(Scope3CategoryData):
    """Create Scope 3 category data"""
    facility_id: int
    reporting_period_start: date
    reporting_period_end: date


class Scope3CategoryResponse(Scope3CategoryData):
    """Scope 3 category response"""
    id: int
    facility_id: int
    co2e_tons: Decimal

    class Config:
        from_attributes = True


# ============= Bulk Import Schemas =============

class BulkImportResponse(BaseModel):
    """Response for bulk import operations"""
    success: bool
    records_processed: int
    records_created: int
    records_failed: int
    errors: List[Dict[str, Any]] = []
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "records_processed": 100,
                "records_created": 95,
                "records_failed": 5,
                "errors": [
                    {"row": 23, "error": "Invalid date format"}
                ],
                "message": "Bulk import completed with 5 errors"
            }
        }
