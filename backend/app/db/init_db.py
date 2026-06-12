from sqlalchemy import text

from app.db.base import Base  # noqa: F401  (imports all models)
from app.db.session import engine


def init_db() -> None:
    """Enable PostGIS and create all tables if they don't exist."""
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
