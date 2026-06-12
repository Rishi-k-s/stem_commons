from geoalchemy2 import Geometry
from sqlalchemy import Column, Integer, String, UniqueConstraint

from app.db.base_class import Base


class DistrictBoundary(Base):
    __tablename__ = "district_boundaries"

    id = Column(Integer, primary_key=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    # Stored as MULTIPOLYGON; the import script normalises Polygons before insert.
    geom = Column(Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=False)

    __table_args__ = (
        UniqueConstraint("state", "district", name="uq_district_boundary"),
    )
