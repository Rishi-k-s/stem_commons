from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    auth,
    claims,
    machines,
    owner,
    photos,
    reports,
    resources,
    search,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(resources.router, prefix="/resources", tags=["resources"])
api_router.include_router(machines.router, tags=["machines"])
api_router.include_router(photos.router, tags=["photos"])
api_router.include_router(claims.router, tags=["claims"])
api_router.include_router(reports.router, tags=["reports"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(admin.router, tags=["admin"])
api_router.include_router(owner.router, tags=["owner"])
