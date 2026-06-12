from sqlalchemy import text

from app.db.base import Base  # noqa: F401  (imports all models)
from app.db.session import engine


def init_db() -> None:
    """Enable PostGIS and create all tables if they don't exist."""
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
    Base.metadata.create_all(bind=engine)
    _run_lightweight_migrations()


def _run_lightweight_migrations() -> None:
    """Idempotent ALTERs for columns added after a table already exists.

    ``create_all`` only creates missing tables, never alters existing ones, and
    this project doesn't use Alembic yet — so additive columns are applied here.
    """
    statements = [
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS submission_meta JSONB",
        "UPDATE resources SET is_verified = TRUE WHERE submission_meta IS NULL AND is_verified = FALSE",
        # Spatial index for district boundary polygon lookups.
        "CREATE INDEX IF NOT EXISTS idx_district_boundaries_geom ON district_boundaries USING GIST(geom)",
    ]
    with engine.connect() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
        conn.commit()
