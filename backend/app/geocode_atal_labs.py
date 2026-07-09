"""
Geocode ATAL Labs using district-level centroids from Nominatim (OpenStreetMap).
Labs in the same district get a small random jitter so they don't stack.

Usage (inside backend container):
    python -m app.geocode_atal_labs

Nominatim ToS: 1 req/sec, must set a User-Agent.
"""

import random
import time

import requests
from sqlalchemy import text

import app.db.base  # noqa: F401
from app.db.session import SessionLocal

JITTER = 0.08          # degrees (~8 km) max offset per lab
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "STEMCommons/1.0 (stem.rishikrishna.com)"}


def geocode_district(district: str, state: str) -> tuple[float, float] | None:
    query = f"{district}, {state}, India"
    try:
        r = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1},
            headers=HEADERS,
            timeout=10,
        )
        data = r.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        print(f"  Nominatim error for {query}: {e}")
    return None


def jitter(val: float) -> float:
    return val + random.uniform(-JITTER, JITTER)


def run() -> None:
    db = SessionLocal()
    try:
        # Get unique (district, state) combos that still have no coordinates
        rows = db.execute(text("""
            SELECT DISTINCT district, state
            FROM resources
            WHERE type = 'ATAL Lab'
              AND latitude IS NULL
            ORDER BY state, district
        """)).fetchall()

        print(f"Geocoding {len(rows)} unique districts...")

        for i, (district, state) in enumerate(rows, 1):
            coords = geocode_district(district, state)
            if coords is None:
                # fallback: try state only
                coords = geocode_district("", state)
            if coords is None:
                print(f"  [{i}/{len(rows)}] SKIP {district}, {state}")
                time.sleep(1)
                continue

            lat, lng = coords
            print(f"  [{i}/{len(rows)}] {district}, {state} → {lat:.4f}, {lng:.4f}")

            # Fetch all lab IDs in this district with no coords
            ids = db.execute(text("""
                SELECT id FROM resources
                WHERE type = 'ATAL Lab'
                  AND district = :d AND state = :s
                  AND latitude IS NULL
            """), {"d": district, "s": state}).scalars().all()

            for rid in ids:
                jlat, jlng = jitter(lat), jitter(lng)
                db.execute(text("""
                    UPDATE resources SET
                        latitude  = :lat,
                        longitude = :lng,
                        location  = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                    WHERE id = :id
                """), {"lat": jlat, "lng": jlng, "id": rid})

            db.commit()
            time.sleep(1)   # Nominatim rate limit

        print("\nDone.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
