from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.security import generate_temp_password, hash_password
from app.db.session import get_db
from app.models.claim import Claim
from app.models.resource import Resource
from app.models.user import User
from app.schemas.claim import ClaimCreate, ClaimOut

router = APIRouter()


def _to_out(claim: Claim) -> ClaimOut:
    out = ClaimOut.model_validate(claim)
    out.resource_name = claim.resource.name if claim.resource else None
    return out


def _provision_owner(claim: Claim, db: Session) -> ClaimOut:
    """On approval, ensure a Verified Owner account exists for the claimer and
    link it as the resource's owner. Returns the claim plus, for a freshly
    created account, a one-time temporary password to hand to the owner."""
    out = _to_out(claim)
    email = claim.claimer_email.lower().strip()

    user = db.query(User).filter(User.email == email).first()
    temp_password: str | None = None
    existed = user is not None

    if user is None:
        temp_password = generate_temp_password()
        user = User(
            username=email[:100],
            email=email,
            password_hash=hash_password(temp_password),
            role="Verified Owner",
            is_active=True,
        )
        db.add(user)
        db.flush()  # assign user.id
    elif user.role == "User":
        # Promote an existing basic account to owner without touching its password.
        user.role = "Verified Owner"

    if claim.resource is not None:
        claim.resource.verified_owner = user.id

    db.commit()

    out.owner_email = email
    out.owner_account_existed = existed
    out.owner_temp_password = temp_password
    return out


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
    return _to_out(claim)


@router.get("/claims", response_model=list[ClaimOut])
def list_claims(
    db: Session = Depends(get_db),
    status_: str | None = None,
    _admin: User = Depends(require_admin),
):
    query = db.query(Claim)
    if status_:
        query = query.filter(Claim.status == status_)
    claims = query.order_by(Claim.created_at.desc()).all()
    return [_to_out(c) for c in claims]


@router.patch("/claims/{claim_id}/approve", response_model=ClaimOut)
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    claim = db.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = "Approved"
    claim.reviewed_at = datetime.now(timezone.utc)
    db.flush()
    return _provision_owner(claim, db)


@router.patch("/claims/{claim_id}/reject", response_model=ClaimOut)
def reject_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    return _review_claim(claim_id, "Rejected", db)


def _review_claim(claim_id: int, new_status: str, db: Session) -> ClaimOut:
    claim = db.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = new_status
    claim.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(claim)
    return _to_out(claim)
