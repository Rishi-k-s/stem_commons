from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.config import settings
from app.core.bootstrap import bootstrap_admin, validate_security_config
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate security config, create the PostGIS extension and tables,
    # then bootstrap the first admin (if configured) on startup.
    validate_security_config()
    init_db()
    bootstrap_admin()
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
