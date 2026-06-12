"""Helpers for translating between the API's flat resource shape and the
richer ORM model (including the PostGIS geography point)."""
from geoalchemy2.elements import WKTElement

from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate


def _point(lat: float, lng: float) -> WKTElement:
    # PostGIS expects POINT(longitude latitude).
    return WKTElement(f"POINT({lng} {lat})", srid=4326)


def create_resource(data: ResourceCreate) -> Resource:
    return Resource(
        name=data.name,
        type=data.type,
        status=data.status,
        full_description=data.description,
        short_description=(data.description or "")[:500] or None,
        address_line1=data.address,
        city=data.city,
        district=data.district or data.city,
        state=data.state,
        latitude=data.lat,
        longitude=data.lng,
        location=_point(data.lat, data.lng),
        contact_phone=data.phone,
        contact_email=data.contact,
        website=data.website,
        facilities=data.facilities or [],
    )


def apply_update(resource: Resource, data: ResourceUpdate) -> Resource:
    fields = data.model_dump(exclude_unset=True)

    mapping = {
        "name": "name",
        "type": "type",
        "status": "status",
        "city": "city",
        "district": "district",
        "state": "state",
        "address": "address_line1",
        "phone": "contact_phone",
        "contact": "contact_email",
        "website": "website",
        "facilities": "facilities",
    }
    for src, dest in mapping.items():
        if src in fields:
            setattr(resource, dest, fields[src])

    if "description" in fields:
        resource.full_description = fields["description"]
        resource.short_description = (fields["description"] or "")[:500] or None

    if "lat" in fields or "lng" in fields:
        lat = fields.get("lat", float(resource.latitude) if resource.latitude is not None else 0.0)
        lng = fields.get("lng", float(resource.longitude) if resource.longitude is not None else 0.0)
        resource.latitude = lat
        resource.longitude = lng
        resource.location = _point(lat, lng)

    return resource
