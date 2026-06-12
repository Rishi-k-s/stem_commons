from fastapi import APIRouter, Depends, Query
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_DWithin, ST_Distance
from sqlalchemy import cast, distinct, func, or_
from sqlalchemy.orm import Session

from app.core.cache import cache_get, cache_set
from app.db.session import get_db
from app.models.district_boundary import DistrictBoundary
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
    KEY = "stem:states"
    if (cached := cache_get(KEY)) is not None:
        return cached
    rows = db.query(distinct(Resource.state)).order_by(Resource.state.asc()).all()
    result = [r[0] for r in rows if r[0]]
    cache_set(KEY, result, ttl=600)
    return result


@router.get("/districts/{state}", response_model=list[str])
def list_districts(state: str, db: Session = Depends(get_db)):
    KEY = f"stem:districts:{state}"
    if (cached := cache_get(KEY)) is not None:
        return cached
    rows = (
        db.query(distinct(Resource.district))
        .filter(Resource.state == state)
        .order_by(Resource.district.asc())
        .all()
    )
    result = [r[0] for r in rows if r[0]]
    cache_set(KEY, result, ttl=600)
    return result


@router.get("/autocomplete", response_model=list[str])
def autocomplete(
    q: str = Query(..., min_length=1),
    limit: int = 10,
    db: Session = Depends(get_db),
):
    KEY = f"stem:autocomplete:{q.lower()}"
    if (cached := cache_get(KEY)) is not None:
        return cached
    like = f"{q}%"
    rows = (
        db.query(Resource.name)
        .filter(Resource.name.ilike(like))
        .order_by(Resource.name.asc())
        .limit(limit)
        .all()
    )
    result = [r[0] for r in rows]
    cache_set(KEY, result, ttl=120)
    return result


@router.get("/nearby", response_model=list[ResourceNearbyOut])
def nearby(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius: float = Query(5, description="Search radius in kilometres"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Round coords to ~110m precision for a useful cache hit rate.
    KEY = f"stem:nearby:{round(latitude,3)}:{round(longitude,3)}:{radius}:{limit}"
    if (cached := cache_get(KEY)) is not None:
        return cached

    from geoalchemy2 import Geography

    point = cast(
        func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326), Geography
    )
    distance_expr = ST_Distance(Resource.location, point)

    rows = (
        db.query(Resource, (distance_expr / 1000.0).label("distance_km"))
        .filter(Resource.location.isnot(None))
        .filter(ST_DWithin(Resource.location, point, radius * 1000.0))
        .order_by(distance_expr.asc())
        .limit(limit)
        .all()
    )

    results = []
    for resource, distance_km in rows:
        out = ResourceOut.from_model(resource)
        results.append(
            ResourceNearbyOut(**out.model_dump(), distance_km=round(float(distance_km), 2))
        )

    cache_set(KEY, [r.model_dump() for r in results], ttl=60)
    return results


@router.get("/within-bounds", response_model=list[ResourceOut])
def within_bounds(
    sw_lat: float = Query(..., description="South-west latitude"),
    sw_lng: float = Query(..., description="South-west longitude"),
    ne_lat: float = Query(..., description="North-east latitude"),
    ne_lng: float = Query(..., description="North-east longitude"),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Return all public resources whose location falls inside a bounding box.
    Useful for filtering the map to the current viewport."""
    KEY = (
        f"stem:within-bounds:"
        f"{round(sw_lat,4)}:{round(sw_lng,4)}:"
        f"{round(ne_lat,4)}:{round(ne_lng,4)}:{limit}"
    )
    if (cached := cache_get(KEY)) is not None:
        return cached

    envelope = func.ST_MakeEnvelope(sw_lng, sw_lat, ne_lng, ne_lat, 4326)
    rows = (
        db.query(Resource)
        .filter(Resource.is_public.is_(True))
        .filter(Resource.location.isnot(None))
        .filter(func.ST_Within(cast(Resource.location, Geometry), envelope))
        .limit(limit)
        .all()
    )

    result = [ResourceOut.from_model(r).model_dump() for r in rows]
    cache_set(KEY, result, ttl=60)
    return result


@router.get("/within-district", response_model=list[ResourceOut])
def within_district(
    state: str = Query(...),
    district: str = Query(...),
    db: Session = Depends(get_db),
):
    """Return resources within a district.

    Uses the stored PostGIS polygon boundary when one exists; falls back to
    a simple string-match on state + district otherwise.
    """
    KEY = f"stem:within-district:{state}:{district}"
    if (cached := cache_get(KEY)) is not None:
        return cached

    boundary = (
        db.query(DistrictBoundary)
        .filter(
            DistrictBoundary.state == state,
            DistrictBoundary.district == district,
        )
        .first()
    )

    base = db.query(Resource).filter(Resource.is_public.is_(True))

    if boundary is not None:
        rows = (
            base.filter(Resource.location.isnot(None))
            .filter(
                func.ST_Within(
                    cast(Resource.location, Geometry),
                    cast(boundary.geom, Geometry),
                )
            )
            .all()
        )
    else:
        # No boundary polygon loaded yet — fall back to name match.
        rows = (
            base.filter(Resource.state == state)
            .filter(Resource.district == district)
            .all()
        )

    result = [ResourceOut.from_model(r).model_dump() for r in rows]
    cache_set(KEY, result, ttl=300)
    return result
