"""
Authentication endpoints: login (issues a JWT) and the current-user lookup.

A lightweight in-memory rate limiter throttles repeated login attempts per
client IP to slow credential-stuffing / brute-force attacks. For a multi-worker
production deployment this should be backed by a shared store (e.g. Redis); the
in-memory version guards single-process deployments and dev.
"""
from __future__ import annotations

import threading
import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.config import settings
from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserOut

router = APIRouter()

# ── Rate limiting ────────────────────────────────────────────────
_MAX_ATTEMPTS = 5
_WINDOW_SECONDS = 300  # 5 minutes
_attempts: dict[str, list[float]] = {}
_attempts_lock = threading.Lock()


def _client_ip(request: Request) -> str:
    # Honour a single proxy hop if present; otherwise the socket peer.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(key: str) -> None:
    now = time.time()
    with _attempts_lock:
        hits = [t for t in _attempts.get(key, []) if now - t < _WINDOW_SECONDS]
        if len(hits) >= _MAX_ATTEMPTS:
            retry = int(_WINDOW_SECONDS - (now - hits[0]))
            _attempts[key] = hits
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later.",
                headers={"Retry-After": str(max(retry, 1))},
            )
        _attempts[key] = hits


def _record_failure(key: str) -> None:
    with _attempts_lock:
        _attempts.setdefault(key, []).append(time.time())


def _clear_attempts(key: str) -> None:
    with _attempts_lock:
        _attempts.pop(key, None)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = _client_ip(request)
    rate_key = f"{ip}:{payload.email.lower()}"
    _check_rate_limit(rate_key)

    user = db.query(User).filter(User.email == payload.email.lower()).first()

    # Generic failure message — never reveal whether the email exists.
    # verify_password against a stored hash gives constant-ish timing.
    if user is None or not verify_password(payload.password, user.password_hash or ""):
        _record_failure(rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    _clear_attempts(rate_key)
    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserOut)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user
