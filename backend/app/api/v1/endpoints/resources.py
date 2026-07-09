from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.cache import cache_delete, cache_delete_prefix, cache_get, cache_set
from app.db.session import get_db
from app.models.resource import Resource
from app.models.user import User
from app.schemas.common import Page
from app.schemas.resource import ResourceCreate, ResourceOut, ResourceSubmit, ResourceUpdate
from app.services import resource_service


def _invalidate_resource_caches() -> None:
    """Clear caches that become stale after any resource write."""
    cache_delete("stem:stats")
    cache_delete("stem:map-pins")
    cache_delete("stem:states")
    cache_delete_prefix("stem:districts")

router = APIRouter()


@router.get("", response_model=Page[ResourceOut])
def list_resources(
    db: Session = Depends(get_db),
    q: str | None = Query(None, description="Full-text query across name/city/state/type"),
    state: str | None = None,
    district: str | None = None,
    type: str | None = None,
    status_: str | None = Query(None, alias="status"),
    facility: list[str] | None = Query(None, description="Repeatable facility filter"),
    verified: bool | None = Query(
        None,
        description="Filter by verification status. true=verified only, "
        "false=pending review only, omitted=all public resources.",
    ),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
    sort: str = Query("name-asc", description="name-asc | name-desc | recent"),
):
    query = db.query(Resource).filter(Resource.is_public.is_(True))

    if verified is not None:
        query = query.filter(Resource.is_verified.is_(verified))

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Resource.name.ilike(like),
                Resource.city.ilike(like),
                Resource.state.ilike(like),
                Resource.type.ilike(like),
            )
        )
    if state:
        query = query.filter(Resource.state == state)
    if district:
        query = query.filter(Resource.district == district)
    if type:
        query = query.filter(Resource.type == type)
    if status_:
        query = query.filter(Resource.status == status_)
    if facility:
        for f in facility:
            query = query.filter(Resource.facilities.contains([f]))

    total = query.order_by(None).count()

    order = (
        Resource.name.desc() if sort == "name-desc"
        else Resource.created_at.desc() if sort == "recent"
        else Resource.name.asc()
    )
    rows = (
        query.order_by(order)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    pages = (total + limit - 1) // limit if limit else 0

    return Page[ResourceOut](
        data=[ResourceOut.from_model(r) for r in rows],
        total=total,
        page=page,
        limit=limit,
        pages=pages,
    )


@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    resource = resource_service.create_resource(payload)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    _invalidate_resource_caches()
    return ResourceOut.from_model(resource)


@router.post("/submit", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def submit_resource(payload: ResourceSubmit, db: Session = Depends(get_db)):
    """Public, unauthenticated submission. The resource is created as
    unverified so an admin can review and verify it later."""
    resource = resource_service.create_submission(payload)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    _invalidate_resource_caches()
    return ResourceOut.from_model(resource)


@router.get("/map-pins")
def map_pins(db: Session = Depends(get_db)):
    """Lightweight endpoint — returns only the fields needed to render map pins."""
    KEY = "stem:map-pins"
    if (cached := cache_get(KEY)) is not None:
        return cached
    rows = (
        db.query(Resource.id, Resource.name, Resource.type, Resource.status, Resource.city, Resource.state, Resource.latitude, Resource.longitude)
        .filter(Resource.is_public.is_(True), Resource.is_verified.is_(True), Resource.latitude.isnot(None))
        .all()
    )
    result = [
        {"id": r.id, "name": r.name, "type": r.type, "status": r.status, "city": r.city, "state": r.state, "lat": float(r.latitude), "lng": float(r.longitude)}
        for r in rows
    ]
    cache_set(KEY, result, ttl=300)
    return result


@router.get("/stats")
def resource_stats(db: Session = Depends(get_db)):
    """Public endpoint — counts for the landing page."""
    KEY = "stem:stats"
    if (cached := cache_get(KEY)) is not None:
        return cached
    total = db.query(func.count(Resource.id)).filter(Resource.is_public.is_(True)).scalar() or 0
    by_type = dict(
        db.query(Resource.type, func.count(Resource.id))
        .filter(Resource.is_public.is_(True))
        .group_by(Resource.type)
        .all()
    )
    states_count = (
        db.query(func.count(func.distinct(Resource.state)))
        .filter(Resource.is_public.is_(True))
        .scalar()
        or 0
    )
    result = {
        "total": int(total),
        "by_type": {k: int(v) for k, v in by_type.items()},
        "states_count": int(states_count),
    }
    cache_set(KEY, result, ttl=300)
    return result


@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return ResourceOut.from_model(resource)


@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(
    resource_id: int,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource_service.apply_update(resource, payload)
    db.commit()
    db.refresh(resource)
    _invalidate_resource_caches()
    return ResourceOut.from_model(resource)


@router.post("/{resource_id}/verify", response_model=ResourceOut)
def verify_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Approve a pending submission so it becomes a verified resource."""
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.is_verified = True
    db.commit()
    db.refresh(resource)
    _invalidate_resource_caches()
    return ResourceOut.from_model(resource)


@router.post("/{resource_id}/unverify", response_model=ResourceOut)
def unverify_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Revoke verification, moving a resource back into the pending queue."""
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.is_verified = False
    db.commit()
    db.refresh(resource)
    _invalidate_resource_caches()
    return ResourceOut.from_model(resource)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()
    _invalidate_resource_caches()
