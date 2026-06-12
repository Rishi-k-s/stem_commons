from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "STEM Commons API"
    API_V1_PREFIX: str = "/api/v1"

    # PostgreSQL + PostGIS connection string.
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/stem_commons"

    # Allowed CORS origins (comma-separated in the env file).
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    ENVIRONMENT: str = "development"

    # ── Auth / security ────────────────────────────────────────
    # MUST be overridden via env in production. A long random string,
    # e.g. `python -c "import secrets; print(secrets.token_urlsafe(64))"`.
    SECRET_KEY: str = "CHANGE_ME_dev_only_insecure_secret_key_override_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # Bootstrap admin — created on first startup if no admin exists.
    # Leave the password empty in production and create the admin manually.
    FIRST_ADMIN_EMAIL: str = ""
    FIRST_ADMIN_USERNAME: str = "admin"
    FIRST_ADMIN_PASSWORD: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}


settings = Settings()
