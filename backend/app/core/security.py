"""
Security primitives: password hashing (bcrypt) and JWT access tokens.

Notes
-----
* Passwords are hashed with bcrypt (per-hash random salt, constant-time
  verification). bcrypt only considers the first 72 bytes of a password, so
  inputs are validated/truncated defensively at the call site.
* Access tokens are signed JWTs (HS256) with an expiry claim. The signing key
  comes from ``settings.SECRET_KEY`` which MUST be overridden in production.
"""
from __future__ import annotations

import datetime as dt

import bcrypt
import jwt

from app.config import settings

# bcrypt hard limit — longer inputs are silently truncated by the algorithm,
# so we reject them explicitly to avoid surprising behaviour.
_BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    """Return a salted bcrypt hash for ``password``."""
    pw = password.encode("utf-8")
    if len(pw) > _BCRYPT_MAX_BYTES:
        raise ValueError("Password must be at most 72 bytes long.")
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Constant-time check of ``password`` against a stored bcrypt hash."""
    if not password_hash:
        return False
    pw = password.encode("utf-8")
    if len(pw) > _BCRYPT_MAX_BYTES:
        pw = pw[:_BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(pw, password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str, role: str) -> str:
    """Create a signed JWT for the given user id (``subject``) and role."""
    now = dt.datetime.now(dt.timezone.utc)
    expire = now + dt.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(subject),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT. Raises ``jwt.PyJWTError`` on failure."""
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
