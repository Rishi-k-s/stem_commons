from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ResourceBase(BaseModel):
    name: str
    type: str  # Makerspace / ATAL Lab / Vendor
    status: str = "Working"
    description: Optional[str] = None
    city: str
    district: Optional[str] = None
    state: str
    address: Optional[str] = None
    phone: Optional[str] = None
    contact: Optional[str] = None  # email
    website: Optional[str] = None
    facilities: list[str] = []
    lat: float
    lng: float


class ResourceCreate(ResourceBase):
    pass


class ResourceSubmit(BaseModel):
    """Public submission payload (no auth). Created as unverified, pending
    admin review. Blends the resource fields with point-of-contact and
    submitter metadata."""

    # Resource
    name: str = Field(min_length=1, max_length=255)
    type: str
    description: Optional[str] = None
    facilities: list[str] = []
    website: Optional[str] = None

    # Location (chosen via the map picker)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    address: Optional[str] = None
    lat: float
    lng: float

    # Point of contact / submitter
    poc_name: str = Field(min_length=1, max_length=255)
    designation: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = None
    submitted_by: str = Field(min_length=1, max_length=255)


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    contact: Optional[str] = None
    website: Optional[str] = None
    facilities: Optional[list[str]] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ResourceOut(ResourceBase):
    id: int
    is_verified: bool = False
    created_at: Optional[datetime] = None

    @classmethod
    def from_model(cls, r) -> "ResourceOut":
        return cls(
            id=r.id,
            name=r.name,
            type=r.type,
            status=r.status,
            description=r.full_description or r.short_description,
            city=r.city,
            district=r.district,
            state=r.state,
            address=r.address_line1,
            phone=r.contact_phone,
            contact=r.contact_email,
            website=r.website,
            facilities=r.facilities or [],
            lat=float(r.latitude) if r.latitude is not None else 0.0,
            lng=float(r.longitude) if r.longitude is not None else 0.0,
            is_verified=r.is_verified,
            created_at=r.created_at,
        )


class ResourceNearbyOut(ResourceOut):
    distance_km: float
