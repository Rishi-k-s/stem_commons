"""
Import ATAL Labs from CSV into the resources table.

Usage (inside the backend container):
    python -m app.import_atal_labs /data/atal_lab.csv

Rows are skipped if a resource with the same atl_uid already exists.
"""

import csv
import sys

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.resource import Resource


def title_case(s: str) -> str:
    """Convert ALL CAPS names to Title Case."""
    return s.strip().title()


def import_csv(path: str) -> None:
    db: Session = SessionLocal()
    try:
        # Collect existing ATL UIDs to skip duplicates
        existing = set(
            row[0]
            for row in db.query(Resource.submission_meta["atl_uid"].astext).filter(
                Resource.type == "ATAL Lab",
                Resource.submission_meta["atl_uid"].astext.isnot(None),
            )
        )
        print(f"Found {len(existing)} existing ATAL Lab entries — will skip duplicates.")

        added = skipped = 0
        batch: list[Resource] = []

        with open(path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                atl_uid = row.get("ATL UID CODE", "").strip()
                if atl_uid in existing:
                    skipped += 1
                    continue

                state = title_case(row.get("STATE/ UT", ""))
                district = title_case(row.get("DISTRICT", ""))
                name = title_case(row.get("NAME OF SCHOOL", ""))
                udise = row.get("UDISE CODE", "").strip()

                if not name or not state:
                    skipped += 1
                    continue

                resource = Resource(
                    name=name,
                    type="ATAL Lab",
                    status="Working",
                    city=district or state,
                    district=district,
                    state=state,
                    is_verified=True,
                    is_public=True,
                    short_description=f"ATAL Tinkering Lab at {name}, {district}, {state}.",
                    submission_meta={"atl_uid": atl_uid, "udise_code": udise},
                )
                batch.append(resource)
                existing.add(atl_uid)
                added += 1

                if len(batch) >= 500:
                    db.bulk_save_objects(batch)
                    db.commit()
                    batch.clear()
                    print(f"  ...{added} inserted so far")

        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        print(f"\nDone. Added: {added}  Skipped: {skipped}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.import_atal_labs <path/to/atal_lab.csv>")
        sys.exit(1)
    import_csv(sys.argv[1])
