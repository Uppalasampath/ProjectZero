"""
Pydantic schemas for Company/Organization data
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import date
from decimal import Decimal


class CompanyBase(BaseModel):
    """Base company information"""
    company_name: str = Field(..., min_length=1, max_length=255, description="Legal company name")
    trade_name: Optional[str] = Field(None, max_length=255, description="Trade name or DBA")
    naics_code: Optional[str] = Field(None, pattern=r"^\d{6}$", description="6-digit NAICS code")
    sic_code: Optional[str] = Field(None, pattern=r"^\d{4}$", description="4-digit SIC code")
    industry_sector: Optional[str] = Field(None, max_length=100)
    sub_sector: Optional[str] = Field(None, max_length=100)

    # Regulatory identifiers
    tax_id: Optional[str] = Field(None, max_length=50, description="Tax ID / EIN")
    duns_number: Optional[str] = Field(None, pattern=r"^\d{9}$", description="9-digit DUNS number")
    stock_ticker: Optional[str] = Field(None, max_length=10, description="Stock ticker symbol")
    epa_facility_id: Optional[str] = Field(None, max_length=50)
    reporting_entity_id: Optional[str] = Field(None, max_length=50)
    carb_registration_id: Optional[str] = Field(None, max_length=50, description="California CARB ID")

    # Contact information
    headquarters_address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state_province: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: str = Field(..., max_length=100)

    environmental_contact_name: Optional[str] = Field(None, max_length=255)
    environmental_contact_title: Optional[str] = Field(None, max_length=100)
    environmental_contact_email: Optional[EmailStr] = None
    environmental_contact_phone: Optional[str] = Field(None, max_length=50)

    # Financial information
    fiscal_year_end: Optional[str] = Field(None, pattern=r"^\d{2}-\d{2}$", description="MM-DD format")
    total_revenue: Optional[Decimal] = Field(None, ge=0, description="Total annual revenue (USD)")
    california_revenue: Optional[Decimal] = Field(None, ge=0, description="California revenue (for SB253)")
    number_of_employees: Optional[int] = Field(None, ge=0)

    # Organizational boundary
    consolidation_approach: Optional[str] = Field(
        None,
        description="Equity Share, Financial Control, or Operational Control"
    )
    consolidation_percentage: Optional[Decimal] = Field(None, ge=0, le=100)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "company_name": "Acme Manufacturing Corp",
                "naics_code": "332710",
                "country": "United States",
                "total_revenue": 5000000000,
                "consolidation_approach": "Operational Control"
            }
        }


class CompanyCreate(CompanyBase):
    """Schema for creating a new company"""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating company (all fields optional)"""
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    trade_name: Optional[str] = Field(None, max_length=255)
    naics_code: Optional[str] = Field(None, pattern=r"^\d{6}$")
    sic_code: Optional[str] = Field(None, pattern=r"^\d{4}$")
    industry_sector: Optional[str] = Field(None, max_length=100)
    sub_sector: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    duns_number: Optional[str] = Field(None, pattern=r"^\d{9}$")
    stock_ticker: Optional[str] = Field(None, max_length=10)
    headquarters_address: Optional[str] = Field(None, max_length=500)
    city: Optional[str] = Field(None, max_length=100)
    state_province: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    environmental_contact_email: Optional[EmailStr] = None
    total_revenue: Optional[Decimal] = Field(None, ge=0)
    california_revenue: Optional[Decimal] = Field(None, ge=0)
    number_of_employees: Optional[int] = Field(None, ge=0)


class CompanyResponse(CompanyBase):
    """Schema for company response"""
    id: int
    created_at: date
    updated_at: Optional[date] = None

    class Config:
        from_attributes = True


class CompanyListResponse(BaseModel):
    """Schema for list of companies"""
    total: int
    companies: List[CompanyResponse]

    class Config:
        from_attributes = True
