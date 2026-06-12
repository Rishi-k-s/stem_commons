from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.report import Report
from app.models.resource import Resource
from app.schemas.report import ReportCreate, ReportOut

router = APIRouter()


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
    return report


@router.get("/reports", response_model=list[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    status_: str | None = None,
):
    query = db.query(Report)
    if status_:
        query = query.filter(Report.status == status_)
    return query.order_by(Report.created_at.desc()).all()


@router.patch("/reports/{report_id}/resolve", response_model=ReportOut)
def resolve_report(report_id: int, db: Session = Depends(get_db)):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "Resolved"
    report.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return report
