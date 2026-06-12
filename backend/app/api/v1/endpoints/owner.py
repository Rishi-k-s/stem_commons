"""Owner-scoped endpoints. A "Verified Owner" can view and manage only the
resources they have been granted ownership of (via an approved claim), and
change their own password. Admins may use these endpoints too."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_owner_or_admin
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.resource import Resource
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest
from app.schemas.resource import ResourceOut, ResourceUpdate
from app.services import resource_service

router = APIRouter(prefix="/owner")


def _owned_resource(resource_id: int, user: User, db: Session) -> Resource:
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    # Admins may manage any resource; owners only their own.
    if user.role != "Admin" and resource.verified_owner != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this resource",
        )
    return resource


@router.get("/resources", response_model=list[ResourceOut])
def list_my_resources(
    db: Session = Depends(get_db),
    user: User = Depends(require_owner_or_admin),
):
    rows = (
        db.query(Resource)
        .filter(Resource.verified_owner == user.id)
        .order_by(Resource.name.asc())
        .all()
    )
    return [ResourceOut.from_model(r) for r in rows]


@router.put("/resources/{resource_id}", response_model=ResourceOut)
def update_my_resource(
    resource_id: int,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_owner_or_admin),
):
    resource = _owned_resource(resource_id, user, db)
    resource_service.apply_update(resource, payload)
    db.commit()
    db.refresh(resource)
    return ResourceOut.from_model(resource)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    user.password_hash = hash_password(payload.new_password)
    db.commit()
