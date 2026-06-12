import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("stem_commons.access")

# Paths that generate too much noise to log at INFO level.
_SILENT_PATHS = {"/health"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        path = request.url.path
        if request.url.query:
            path = f"{path}?{request.url.query}"

        status = response.status_code
        msg = f"{request.method} {path} → {status} in {duration_ms:.1f}ms"

        if path.split("?")[0] in _SILENT_PATHS:
            logger.debug(msg)
        elif status >= 500:
            logger.error(msg)
        elif status >= 400:
            logger.warning(msg)
        else:
            logger.info(msg)

        return response


def configure_logging(level: str = "INFO") -> None:
    """Call once at startup to set up console logging for the whole app."""
    numeric = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(
        level=numeric,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # Quiet down noisy libraries.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if level.upper() == "DEBUG" else logging.WARNING
    )
