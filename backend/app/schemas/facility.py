"""
Pydantic schemas for Facility data
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date
from decimal import Decimal


class FacilityBase(BaseModel):
    """Base facility information"""
    company_id: int = Field(..., description="Company ID this facility belongs to")
    facility_name: str = Field(..., min_length=1, max_length=255)
    facility_id_external: Optional[str] = Field(None, max_length=100, description="External facility ID")
    facility_type: Optional[str] = Field(
        None,
        max_length=100,
        description="manufacturing, office, warehouse, data_center, etc."
    )

    # Regulatory identifiers
    epa_facility_id: Optional[str] = Field(None, max_length=50)
    state_facility_id: Optional[str] = Field(None, max_length=50)

    # Location
    street_address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state_province: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(..., max_length=100)
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)

    # Operational details
    operational_status: str = Field(
        default="active",
        description="active, idle, or closed"
    )
    operational_months: Optional[int] = Field(None, ge=1, le=12, description="Months operated in reporting year")
    square_footage: Optional[Decimal] = Field(None, ge=0)
    number_of_employees: Optional[int] = Field(None, ge=0)
    primary_activities: Optional[str] = Field(None, max_length=1000, description="Description of activities")
    production_volume: Optional[Decimal] = Field(None, ge=0)
    production_unit: Optional[str] = Field(None, max_length=50, description="Unit of production")

    @validator('operational_status')
    def validate_status(cls, v):
        allowed = ['active', 'idle', 'closed']
        if v.lower() not in allowed:
            raise ValueError(f'operational_status must be one of: {", ".join(allowed)}')
        return v.lower()

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "company_id": 1,
                "facility_name": "Main Manufacturing Plant",
                "facility_type": "manufacturing",
                "country": "United States",
                "city": "Detroit",
                "state_province": "Michigan",
                "operational_status": "active"
            }
        }


class FacilityCreate(FacilityBase):
    """Schema for creating a new facility"""
    pass


class FacilityUpdate(BaseModel):
    """Schema for updating facility (all fields optional)"""
    facility_name: Optional[str] = Field(None, min_length=1, max_length=255)
    facility_type: Optional[str] = Field(None, max_length=100)
    epa_facility_id: Optional[str] = Field(None, max_length=50)
    state_facility_id: Optional[str] = Field(None, max_length=50)
    street_address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state_province: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    operational_status: Optional[str] = None
    operational_months: Optional[int] = Field(None, ge=1, le=12)
    square_footage: Optional[Decimal] = Field(None, ge=0)
    number_of_employees: Optional[int] = Field(None, ge=0)


class FacilityResponse(FacilityBase):
    """Schema for facility response"""
    id: int
    created_at: date
    updated_at: Optional[date] = None

    class Config:
        from_attributes = True


class FacilityListResponse(BaseModel):
    """Schema for list of facilities"""
    total: int
    facilities: List[FacilityResponse]

    class Config:
        from_attributes = True
