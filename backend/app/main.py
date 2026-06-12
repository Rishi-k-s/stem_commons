from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.config import settings
from app.core.bootstrap import bootstrap_admin, validate_security_config
from app.core.logging import RequestLoggingMiddleware, configure_logging
from app.db.init_db import init_db

configure_logging(settings.LOG_LEVEL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_security_config()
    init_db()
    bootstrap_admin()
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Middleware is applied last-in first-out, so CORS runs before logging.
app.add_middleware(RequestLoggingMiddleware)
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
