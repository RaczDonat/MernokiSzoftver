"""
Alapértelmezés: SQLite – a teljes adatbázis egyetlen fájl (backend/travel.db).
"""

from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

_DEFAULT_DB = Path(__file__).resolve().parent.parent / "travel.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB.as_posix()}")

# SQLite esetén a check_same_thread=False kell a FastAPI threadpool miatt.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


class Base(DeclarativeBase):


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: kérésenként egy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
