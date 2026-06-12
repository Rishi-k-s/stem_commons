from fastapi import APIRouter, Depends, Query
from geoalchemy2.functions import ST_DWithin, ST_Distance
from sqlalchemy import cast, distinct, func, or_
from sqlalchemy.orm import Session
from geoalchemy2 import Geography

from app.db.session import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceNearbyOut, ResourceOut

router = APIRouter()


@router.get("/resources", response_model=list[ResourceOut])
def search_resources(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    like = f"%{q}%"
    rows = (
        db.query(Resource)
        .filter(
            or_(
                Resource.name.ilike(like),
                Resource.city.ilike(like),
                Resource.state.ilike(like),
                Resource.type.ilike(like),
            )
        )
        .order_by(Resource.name.asc())
        .limit(limit)
        .all()
    )
    return [ResourceOut.from_model(r) for r in rows]


@router.get("/states", response_model=list[str])
def list_states(db: Session = Depends(get_db)):
    rows = db.query(distinct(Resource.state)).order_by(Resource.state.asc()).all()
    return [r[0] for r in rows if r[0]]


@router.get("/districts/{state}", response_model=list[str])
def list_districts(state: str, db: Session = Depends(get_db)):
    rows = (
        db.query(distinct(Resource.district))
        .filter(Resource.state == state)
        .order_by(Resource.district.asc())
        .all()
    )
    return [r[0] for r in rows if r[0]]


@router.get("/autocomplete", response_model=list[str])
def autocomplete(q: str = Query(..., min_length=1), limit: int = 10, db: Session = Depends(get_db)):
    like = f"{q}%"
    rows = (
        db.query(Resource.name)
        .filter(Resource.name.ilike(like))
        .order_by(Resource.name.asc())
        .limit(limit)
        .all()
    )
    return [r[0] for r in rows]


@router.get("/nearby", response_model=list[ResourceNearbyOut])
def nearby(
    latitude: float = Query(..., alias="latitude"),
    longitude: float = Query(..., alias="longitude"),
    radius: float = Query(5, description="Search radius in kilometres"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    point = cast(
        func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326), Geography
    )
    distance = ST_Distance(Resource.location, point)

    rows = (
        db.query(Resource, (distance / 1000.0).label("distance_km"))
        .filter(Resource.location.isnot(None))
        .filter(ST_DWithin(Resource.location, point, radius * 1000.0))
        .order_by(distance.asc())
        .limit(limit)
        .all()
    )

    results: list[ResourceNearbyOut] = []
    for resource, distance_km in rows:
        out = ResourceOut.from_model(resource)
        results.append(ResourceNearbyOut(**out.model_dump(), distance_km=round(float(distance_km), 2)))
    return results
