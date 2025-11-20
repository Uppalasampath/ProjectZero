"""
API v1 Router
Combines all API endpoints for MVP Phase 1
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    reports,
    companies,
    facilities,
    emissions,
    dashboard,
    connectors
)

api_router = APIRouter()

# MVP Phase 1: Data Entry endpoints
api_router.include_router(
    companies.router,
    prefix="/companies",
    tags=["companies"]
)

api_router.include_router(
    facilities.router,
    prefix="/facilities",
    tags=["facilities"]
)

api_router.include_router(
    emissions.router,
    prefix="/emissions",
    tags=["emissions"]
)

# MVP Phase 1: Dashboard & Analytics
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"]
)

# MVP Phase 1: External Service Connectors
api_router.include_router(
    connectors.router,
    prefix="/connectors",
    tags=["connectors"]
)

# MVP Phase 1: Report Configuration & Generation
api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["reports"]
)
