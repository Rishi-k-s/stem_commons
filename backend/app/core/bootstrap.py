"""
Startup helpers: validate critical security config and bootstrap the first
admin account from environment variables when the users table is empty of
admins.
"""
from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User

logger = logging.getLogger("uvicorn.error")

_INSECURE_SECRET = "CHANGE_ME_dev_only_insecure_secret_key_override_in_production"


def validate_security_config() -> None:
    """Fail fast in production if the signing key was never overridden."""
    if settings.is_production and settings.SECRET_KEY == _INSECURE_SECRET:
        raise RuntimeError(
            "SECRET_KEY must be set to a strong random value in production. "
            'Generate one with: python -c "import secrets; print(secrets.token_urlsafe(64))"'
        )


def bootstrap_admin() -> None:
    """Create the initial admin from env vars if no admin exists yet."""
    email = settings.FIRST_ADMIN_EMAIL.strip().lower()
    password = settings.FIRST_ADMIN_PASSWORD
    if not email or not password:
        return  # nothing to bootstrap

    db: Session = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == "Admin").first()
        if existing_admin is not None:
            return  # an admin already exists; do not create another

        # Avoid colliding with an existing (non-admin) account on that email.
        if db.query(User).filter(User.email == email).first() is not None:
            logger.warning("Bootstrap admin skipped: email %s already in use.", email)
            return

        admin = User(
            username=settings.FIRST_ADMIN_USERNAME.strip() or "admin",
            email=email,
            password_hash=hash_password(password),
            role="Admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        logger.info("Bootstrap admin created: %s", email)
    finally:
        db.close()
