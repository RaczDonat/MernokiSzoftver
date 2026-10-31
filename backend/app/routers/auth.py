

from __future__ import annotations

import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import User, UserRole
from ..schemas import LoginIn, RegisterIn, TokenOut, UserRead
from ..security import create_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

_FAILED: dict[str, list[float]] = defaultdict(list)
_WINDOW, _MAX_FAILS = 300, 10


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "?")


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, request: Request, db: Session = Depends(get_db)) -> TokenOut:
    ip = _client_ip(request)
    now = time.time()
    _FAILED[ip] = [t for t in _FAILED[ip] if now - t < _WINDOW]
    if len(_FAILED[ip]) >= _MAX_FAILS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Túl sok sikertelen próbálkozás, várj pár percet.",
        )
    user = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none()
    # Egységes hibaüzenet: ne áruljuk el, hogy a név vagy a jelszó hibás.
    if user is None or not verify_password(payload.password, user.hashed_password):
        _FAILED[ip].append(now)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Hibás felhasználónév vagy jelszó."
        )
    _FAILED.pop(ip, None)
    return TokenOut(access_token=create_token(user.id), user=UserRead.model_validate(user))


def ensure_unique(db: Session, username: str, email: str, exclude_id: int | None = None) -> None:
    stmt = select(User).where(or_(User.username == username, User.email == email))
    for other in db.execute(stmt).scalars():
        if other.id == exclude_id:
            continue
        if other.username == username:
            raise HTTPException(status.HTTP_409_CONFLICT, "Ez a felhasználónév már foglalt.")
        raise HTTPException(status.HTTP_409_CONFLICT, "Ezzel az e-mail címmel már létezik fiók.")


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    """Nyilvános regisztráció – mindig ügyfél szerepkörrel."""
    ensure_unique(db, payload.username, payload.email)
    user = User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.CUSTOMER,
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A fiók már létezik.") from exc
    return TokenOut(access_token=create_token(user.id), user=UserRead.model_validate(user))


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
