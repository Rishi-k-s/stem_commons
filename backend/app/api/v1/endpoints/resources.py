from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.resource import Resource
from app.models.user import User
from app.schemas.common import Page
from app.schemas.resource import ResourceCreate, ResourceOut, ResourceUpdate
from app.services import resource_service

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
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=1000),
):
    query = db.query(Resource).filter(Resource.is_public.is_(True))

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
    rows = (
        query.order_by(Resource.name.asc())
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
    return ResourceOut.from_model(resource)


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
