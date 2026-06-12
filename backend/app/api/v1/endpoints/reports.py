from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.report import Report
from app.models.resource import Resource
from app.models.user import User
from app.schemas.report import ReportCreate, ReportOut, ReportStatusUpdate

router = APIRouter()

_VALID_STATUSES = {"Open", "In Progress", "Resolved", "Invalid"}


def _to_out(report: Report) -> ReportOut:
    out = ReportOut.model_validate(report)
    out.resource_name = report.resource.name if report.resource else None
    return out


@router.post(
    "/resources/{resource_id}/report",
    response_model=ReportOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_report(resource_id: int, payload: ReportCreate, db: Session = Depends(get_db)):
    if not db.get(Resource, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
    report = Report(resource_id=resource_id, **payload.model_dump())
    db.add(report)
    db.commit()
    db.refresh(report)
    return _to_out(report)


@router.get("/reports", response_model=list[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    status_: str | None = None,
    _admin: User = Depends(require_admin),
):
    query = db.query(Report)
    if status_:
        query = query.filter(Report.status == status_)
    reports = query.order_by(Report.created_at.desc()).all()
    return [_to_out(r) for r in reports]


@router.patch("/reports/{report_id}/resolve", response_model=ReportOut)
def resolve_report(
    report_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return _set_status(report_id, "Resolved", db)


@router.patch("/reports/{report_id}/status", response_model=ReportOut)
def update_report_status(
    report_id: int,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if payload.status not in _VALID_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status. Allowed: {sorted(_VALID_STATUSES)}",
        )
    return _set_status(report_id, payload.status, db)


def _set_status(report_id: int, new_status: str, db: Session) -> ReportOut:
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = new_status
    report.resolved_at = (
        datetime.now(timezone.utc) if new_status in {"Resolved", "Invalid"} else None
    )
    db.commit()
    db.refresh(report)
    return _to_out(report)
