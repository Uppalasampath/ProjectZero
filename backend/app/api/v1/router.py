"""
API v1 Router
Combines all API endpoints
"""
from fastapi import APIRouter

from app.api.v1.endpoints import reports

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["reports"]
)

# Future endpoint routers:
# api_router.include_router(emissions.router, prefix="/emissions", tags=["emissions"])
# api_router.include_router(calculations.router, prefix="/calculations", tags=["calculations"])
# api_router.include_router(inventories.router, prefix="/inventories", tags=["inventories"])
