"""Load India district boundaries from a GeoJSON file into district_boundaries.

Usage:
    python -m app.load_district_boundaries path/to/boundaries.geojson

Expected GeoJSON format — a FeatureCollection where each Feature has:
  geometry : Polygon or MultiPolygon
  properties:
    state    : state name  (also accepts: ST_NM, state_name)
    district : district name  (also accepts: DISTRICT, dtname, district_name)

Example:
    # Download from https://github.com/datameet/maps/tree/master/Districts
    # Then run:
    docker-compose exec backend python -m app.load_district_boundaries \\
        /app/data/India_Districts.geojson
"""
import json
import sys
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models.district_boundary import DistrictBoundary  # noqa: F401 (ensure table exists)


_STATE_KEYS = ("state", "ST_NM", "state_name", "STATE")
_DISTRICT_KEYS = ("district", "DISTRICT", "dtname", "district_name", "Dist_Name")


def _pick(props: dict, keys: tuple[str, ...]) -> str | None:
    for k in keys:
        v = props.get(k)
        if v:
            return str(v).strip()
    return None


def _to_multipolygon_wkt(geometry: dict) -> str:
    """Convert a GeoJSON Polygon or MultiPolygon to WKT MULTIPOLYGON."""
    gtype = geometry["type"]
    coords = geometry["coordinates"]

    def ring_wkt(ring: list) -> str:
        return "(" + ", ".join(f"{x} {y}" for x, y in ring) + ")"

    def polygon_wkt(poly_coords: list) -> str:
        return "(" + ", ".join(ring_wkt(r) for r in poly_coords) + ")"

    if gtype == "Polygon":
        return f"MULTIPOLYGON({polygon_wkt(coords)})"
    elif gtype == "MultiPolygon":
        parts = ", ".join(polygon_wkt(p) for p in coords)
        return f"MULTIPOLYGON({parts})"
    else:
        raise ValueError(f"Unsupported geometry type: {gtype}")


def load(path: Path) -> None:
    print(f"Reading {path} …")
    data = json.loads(path.read_text())
    features = data.get("features", [])
    print(f"Found {len(features)} features")

    init_db()
    db = SessionLocal()
    inserted = skipped = errors = 0

    try:
        for feat in features:
            props = feat.get("properties") or {}
            state = _pick(props, _STATE_KEYS)
            district = _pick(props, _DISTRICT_KEYS)
            geom_data = feat.get("geometry")

            if not state or not district or not geom_data:
                skipped += 1
                continue

            try:
                wkt = _to_multipolygon_wkt(geom_data)
            except (ValueError, KeyError) as exc:
                print(f"  SKIP {state}/{district}: {exc}")
                errors += 1
                continue

            stmt = (
                insert(DistrictBoundary)
                .values(
                    state=state,
                    district=district,
                    geom=f"SRID=4326;{wkt}",
                )
                .on_conflict_do_update(
                    constraint="uq_district_boundary",
                    set_={"geom": f"SRID=4326;{wkt}"},
                )
            )
            db.execute(stmt)
            inserted += 1

            if inserted % 50 == 0:
                db.commit()
                print(f"  … {inserted} upserted")

        db.commit()
    finally:
        db.close()

    print(f"Done: {inserted} upserted, {skipped} skipped, {errors} errors")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    load(Path(sys.argv[1]))
