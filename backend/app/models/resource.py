from geoalchemy2 import Geography
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False, index=True)  # Makerspace / ATAL Lab / Vendor
    status = Column(String(50), nullable=False, default="Working", index=True)

    short_description = Column(String(500))
    full_description = Column(Text)

    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False)
    district = Column(String(100))
    state = Column(String(100), nullable=False, index=True)
    pincode = Column(String(10))

    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    location = Column(Geography(geometry_type="POINT", srid=4326))

    contact_phone = Column(String(20))
    contact_email = Column(String(255))
    website = Column(String(500))
    social_media = Column(JSONB)
    operating_hours = Column(JSONB)

    # Bridge column mirroring the frontend's facility tags for simple filtering.
    facilities = Column(JSONB, default=list)

    is_verified = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    created_by = Column(Integer, ForeignKey("users.id"))
    verified_owner = Column(Integer, ForeignKey("users.id"))

    machines = relationship("Machine", back_populates="resource", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="resource", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="resource", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="resource", cascade="all, delete-orphan")
