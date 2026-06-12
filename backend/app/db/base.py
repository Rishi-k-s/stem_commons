"""Import all models here so that ``Base.metadata`` knows about every table.

Used by table creation (``init_db``) and any future Alembic autogeneration.
"""
from app.db.base_class import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.resource import Resource  # noqa: F401
from app.models.machine import Machine  # noqa: F401
from app.models.photo import Photo  # noqa: F401
from app.models.claim import Claim  # noqa: F401
from app.models.report import Report  # noqa: F401
