"""
Pydantic schemas for Dashboard and Analytics
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date
from decimal import Decimal


class EmissionsByScope(BaseModel):
    """Emissions aggregated by scope"""
    scope_1: Decimal = Field(..., description="Scope 1 emissions in metric tons CO2e")
    scope_2: Decimal = Field(..., description="Scope 2 emissions in metric tons CO2e")
    scope_3: Decimal = Field(..., description="Scope 3 emissions in metric tons CO2e")
    total: Decimal = Field(..., description="Total emissions in metric tons CO2e")

    class Config:
        json_schema_extra = {
            "example": {
                "scope_1": 1500.5,
                "scope_2": 2300.2,
                "scope_3": 3200.8,
                "total": 7001.5
            }
        }


class EmissionsByFacility(BaseModel):
    """Emissions by facility"""
    facility_id: int
    facility_name: str
    scope_1: Decimal
    scope_2: Decimal
    scope_3: Decimal
    total: Decimal
    percentage_of_total: Decimal = Field(..., description="Percentage of company total")


class EmissionsByCategory(BaseModel):
    """Emissions by category"""
    category: str
    scope: str
    co2e_tons: Decimal
    percentage_of_scope: Decimal


class EmissionsByGas(BaseModel):
    """Emissions by gas type"""
    co2: Decimal = Field(..., description="CO2 in metric tons")
    ch4: Decimal = Field(..., description="CH4 in metric tons")
    n2o: Decimal = Field(..., description="N2O in metric tons")
    f_gases: Decimal = Field(default=0, description="F-gases in metric tons CO2e")
    total_co2e: Decimal = Field(..., description="Total in metric tons CO2e")


class EmissionsTrend(BaseModel):
    """Emissions trend over time"""
    period: str = Field(..., description="YYYY-MM or YYYY-Q1, etc.")
    period_start: date
    period_end: date
    scope_1: Decimal
    scope_2: Decimal
    scope_3: Decimal
    total: Decimal


class DataQualitySummary(BaseModel):
    """Data quality summary"""
    tier_1_pct: Decimal = Field(..., description="% of data from Tier 1 sources")
    tier_2_pct: Decimal = Field(..., description="% of data from Tier 2 sources")
    tier_3_pct: Decimal = Field(..., description="% of data from Tier 3 sources")
    tier_4_pct: Decimal = Field(..., description="% of data from Tier 4 sources")
    estimated_pct: Decimal = Field(..., description="% of data that is estimated")
    completeness_pct: Decimal = Field(..., description="Overall data completeness")
    overall_quality_score: Decimal = Field(..., ge=0, le=5, description="Quality score 1-5")


class DashboardSummary(BaseModel):
    """Complete dashboard summary"""
    company_id: int
    company_name: str
    reporting_period_start: date
    reporting_period_end: date

    # Emissions aggregations
    emissions_by_scope: EmissionsByScope
    emissions_by_facility: List[EmissionsByFacility]
    emissions_by_category: List[EmissionsByCategory]
    emissions_by_gas: EmissionsByGas

    # Trends
    emissions_trend: List[EmissionsTrend]

    # Data quality
    data_quality: DataQualitySummary

    # Key metrics
    total_facilities: int
    total_emissions_tons: Decimal
    emissions_intensity: Optional[Decimal] = Field(None, description="Tons CO2e per $1M revenue")
    year_over_year_change_pct: Optional[Decimal] = Field(None, description="% change from previous year")

    class Config:
        json_schema_extra = {
            "example": {
                "company_id": 1,
                "company_name": "Acme Corp",
                "reporting_period_start": "2024-01-01",
                "reporting_period_end": "2024-12-31",
                "total_facilities": 5,
                "total_emissions_tons": 7001.5
            }
        }


class CarbonEngineMetrics(BaseModel):
    """Carbon engine calculation metrics"""
    total_activity_records: int
    total_emissions_calculated: Decimal
    calculation_method: str
    emission_factors_used: int
    data_coverage_pct: Decimal
    last_calculation_date: date

    class Config:
        json_schema_extra = {
            "example": {
                "total_activity_records": 1250,
                "total_emissions_calculated": 7001.5,
                "calculation_method": "GHG Protocol Corporate Standard",
                "emission_factors_used": 45,
                "data_coverage_pct": 92.5,
                "last_calculation_date": "2024-12-31"
            }
        }


class DashboardQueryParams(BaseModel):
    """Query parameters for dashboard"""
    company_id: int = Field(..., description="Company ID")
    start_date: date = Field(..., description="Start date")
    end_date: date = Field(..., description="End date")
    facility_ids: Optional[List[int]] = Field(None, description="Filter by specific facilities")
    scopes: Optional[List[str]] = Field(None, description="Filter by scopes")

    class Config:
        json_schema_extra = {
            "example": {
                "company_id": 1,
                "start_date": "2024-01-01",
                "end_date": "2024-12-31"
            }
        }
