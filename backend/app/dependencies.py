"""Authentikációs és jogosultsági dependency-k (Bearer token)."""

from __future__ import annotations

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, UserRole
from .security import decode_token


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise _unauthorized("Hiányzó azonosítás.")
    user_id = decode_token(authorization[7:].strip())
    if user_id is None:
        raise _unauthorized("Lejárt vagy érvénytelen munkamenet, jelentkezz be újra.")
    user = db.get(User, user_id)
    if user is None:
        raise _unauthorized("A fiók nem létezik.")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role is not UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin jogosultság szükséges."
        )
    return current_user
