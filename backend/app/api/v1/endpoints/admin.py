"""Admin-only endpoints. All routes require the Admin role."""
import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.cache import cache_delete, cache_delete_prefix
from app.db.session import get_db
from app.models.activity_log import AdminActivityLog
from app.models.claim import Claim
from app.models.report import Report
from app.models.resource import Resource
from app.models.user import User
from app.schemas.auth import UserOut
from app.schemas.resource import ResourceOut

router = APIRouter(prefix="/admin")

_VALID_ROLES = {"User", "Verified Owner", "Admin"}


# ── Helpers ──────────────────────────────────────────────────────

def _counts_by(db: Session, column) -> dict[str, int]:
    rows = (
        db.query(column, func.count())
        .group_by(column)
        .order_by(func.count().desc())
        .all()
    )
    return {str(k): int(v) for k, v in rows if k is not None}


def _log(
    db: Session,
    admin: User,
    action: str,
    target_type: str | None = None,
    target_id: int | None = None,
    details: dict | None = None,
) -> None:
    """Stage an activity log entry — committed by the caller's transaction."""
    db.add(
        AdminActivityLog(
            admin_id=admin.id,
            admin_username=admin.username,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
        )
    )


# ── Analytics ────────────────────────────────────────────────────

@router.get("/analytics/overview")
def analytics_overview(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total = db.query(func.count(Resource.id)).scalar() or 0
    verified = (
        db.query(func.count(Resource.id)).filter(Resource.is_verified.is_(True)).scalar() or 0
    )
    claims_total = db.query(func.count(Claim.id)).scalar() or 0
    claims_pending = (
        db.query(func.count(Claim.id)).filter(Claim.status == "Pending").scalar() or 0
    )
    reports_total = db.query(func.count(Report.id)).scalar() or 0
    reports_open = (
        db.query(func.count(Report.id)).filter(Report.status == "Open").scalar() or 0
    )
    return {
        "resources": {
            "total": int(total),
            "verified": int(verified),
            "pending": int(total - verified),
            "by_type": _counts_by(db, Resource.type),
            "by_status": _counts_by(db, Resource.status),
            "by_state": dict(list(_counts_by(db, Resource.state).items())[:8]),
        },
        "claims": {"total": int(claims_total), "pending": int(claims_pending)},
        "reports": {"total": int(reports_total), "open": int(reports_open)},
    }


# ── Recent submissions ───────────────────────────────────────────

@router.get("/resources/recent", response_model=list[ResourceOut])
def recent_submissions(
    limit: int = Query(20, ge=1, le=100),
    pending_only: bool = Query(True, description="When true, return only unverified resources"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Resources sorted newest-first. Defaults to pending review only."""
    q = db.query(Resource).order_by(Resource.created_at.desc())
    if pending_only:
        q = q.filter(Resource.is_verified.is_(False))
    return [ResourceOut.from_model(r) for r in q.limit(limit).all()]


# ── User management ──────────────────────────────────────────────

class RoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def _check_role(cls, v: str) -> str:
        if v not in _VALID_ROLES:
            raise ValueError(f"Must be one of: {', '.join(sorted(_VALID_ROLES))}")
        return v


class ActiveUpdate(BaseModel):
    is_active: bool


@router.get("/users", response_model=list[UserOut])
def list_users(
    role: str | None = Query(None, description="Filter by role"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List all users, optionally filtered by role."""
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    old_role = user.role
    user.role = payload.role
    _log(db, admin, "role_change", "user", user.id,
         {"from": old_role, "to": payload.role, "username": user.username})
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/active", response_model=UserOut)
def update_user_active(
    user_id: int,
    payload: ActiveUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user.is_active = payload.is_active
    action = "user_activated" if payload.is_active else "user_deactivated"
    _log(db, admin, action, "user", user.id, {"username": user.username})
    db.commit()
    db.refresh(user)
    return user


# ── Activity log ─────────────────────────────────────────────────

class ActivityLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    admin_id: int | None
    admin_username: str
    action: str
    target_type: str | None
    target_id: int | None
    details: dict | None
    created_at: datetime


@router.get("/activity", response_model=list[ActivityLogOut])
def activity_log(
    limit: int = Query(50, ge=1, le=200),
    action: str | None = Query(None, description="Filter by action type"),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin activity feed, newest first."""
    q = db.query(AdminActivityLog).order_by(AdminActivityLog.created_at.desc())
    if action:
        q = q.filter(AdminActivityLog.action == action)
    return q.limit(limit).all()


# ── CSV export ───────────────────────────────────────────────────

@router.get("/export/resources")
def export_resources_csv(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    resources = db.query(Resource).order_by(Resource.id.asc()).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "id", "name", "type", "status", "is_verified",
        "city", "district", "state", "address",
        "latitude", "longitude", "contact_phone", "contact_email",
        "website", "facilities", "created_at",
    ])
    for r in resources:
        writer.writerow([
            r.id, r.name, r.type, r.status, r.is_verified,
            r.city, r.district, r.state, r.address_line1,
            r.latitude, r.longitude, r.contact_phone, r.contact_email,
            r.website, "; ".join(r.facilities or []),
            r.created_at.isoformat() if r.created_at else "",
        ])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=resources.csv"},
    )


# ── Bulk operations ──────────────────────────────────────────────

class BulkIds(BaseModel):
    ids: list[int]


@router.post("/resources/bulk-verify")
def bulk_verify(
    payload: BulkIds,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not payload.ids:
        return {"updated": 0}
    updated = (
        db.query(Resource)
        .filter(Resource.id.in_(payload.ids))
        .update({Resource.is_verified: True}, synchronize_session=False)
    )
    _log(db, admin, "bulk_verify", "resource", None,
         {"ids": payload.ids, "count": int(updated)})
    db.commit()
    cache_delete("stem:stats")
    return {"updated": int(updated)}


@router.post("/resources/bulk-delete")
def bulk_delete(
    payload: BulkIds,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if not payload.ids:
        return {"deleted": 0}
    deleted = (
        db.query(Resource)
        .filter(Resource.id.in_(payload.ids))
        .delete(synchronize_session=False)
    )
    _log(db, admin, "bulk_delete", "resource", None,
         {"ids": payload.ids, "count": int(deleted)})
    db.commit()
    cache_delete("stem:stats")
    cache_delete_prefix("stem:districts")
    cache_delete("stem:states")
    return {"deleted": int(deleted)}
