from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.claim import Claim
from app.models.resource import Resource
from app.schemas.claim import ClaimCreate, ClaimOut

router = APIRouter()


@router.post(
    "/resources/{resource_id}/claim",
    response_model=ClaimOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_claim(resource_id: int, payload: ClaimCreate, db: Session = Depends(get_db)):
    if not db.get(Resource, resource_id):
        raise HTTPException(status_code=404, detail="Resource not found")
    claim = Claim(resource_id=resource_id, **payload.model_dump())
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim


@router.get("/claims", response_model=list[ClaimOut])
def list_claims(
    db: Session = Depends(get_db),
    status_: str | None = None,
):
    query = db.query(Claim)
    if status_:
        query = query.filter(Claim.status == status_)
    return query.order_by(Claim.created_at.desc()).all()


@router.patch("/claims/{claim_id}/approve", response_model=ClaimOut)
def approve_claim(claim_id: int, db: Session = Depends(get_db)):
    return _review_claim(claim_id, "Approved", db)


@router.patch("/claims/{claim_id}/reject", response_model=ClaimOut)
def reject_claim(claim_id: int, db: Session = Depends(get_db)):
    return _review_claim(claim_id, "Rejected", db)


def _review_claim(claim_id: int, new_status: str, db: Session) -> Claim:
    claim = db.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = new_status
    claim.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(claim)
    return claim
