"""FastAPI belépési pont.

Indítás:  uvicorn app.main:app --port 8000  (a backend/ könyvtárból)
"""

from __future__ import annotations

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import Base, SessionLocal, engine
from .routers import auth, bookings, trips, users
from .seed import seed_if_empty

logger = logging.getLogger("voyara")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    """Táblák létrehozása és demo adatok betöltése üres adatbázisnál."""
    Base.metadata.create_all(bind=engine)
    if os.getenv("VOYARA_SKIP_SEED") != "1":
        with SessionLocal() as db:
            seed_if_empty(db)
    yield


app = FastAPI(
    title="Voyara Travel API",
    version="1.1.0",
    description="Utazáskezelő API dinamikus árazással és túlfoglalás-védelemmel.",
    lifespan=lifespan,
)

# A frontend a saját szerverén keresztül (proxy) éri el az API-t, így CORS
# élesben nem szükséges; ez csak közvetlen fejlesztői hívásokhoz kell.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(trips.router)
app.include_router(bookings.router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Nem várt hiba: részletek a logba, a kliens csak általános üzenetet kap."""
    logger.exception("Kezeletlen hiba a(z) %s útvonalon", request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Váratlan szerverhiba történt."},
    )


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
