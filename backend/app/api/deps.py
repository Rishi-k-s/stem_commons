"""
Authentication & authorization dependencies.

``get_current_user`` decodes the bearer token and loads the active user.
``require_admin`` additionally enforces the ``Admin`` role. Use them on
protected routes via ``Depends(...)``.
"""
from __future__ import annotations

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

# tokenUrl points at the login endpoint so Swagger's "Authorize" works.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise _CREDENTIALS_ERROR
    except jwt.PyJWTError:
        raise _CREDENTIALS_ERROR

    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        raise _CREDENTIALS_ERROR
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


def require_owner_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Allow verified facility owners or admins. Per-resource ownership is
    enforced separately in the endpoints that touch a specific resource."""
    if current_user.role not in {"Admin", "Verified Owner"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner or admin privileges required",
        )
    return current_user
