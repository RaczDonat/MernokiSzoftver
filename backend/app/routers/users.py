

from __future__ import annotations

from fastapi import APIRouter, Response, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_admin
from ..models import Booking, BookingStatus, Trip, User
from ..schemas import AdminUserCreate, UserRead, UserUpdate
from ..security import hash_password
from .auth import ensure_unique

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)) -> list[User]:
    return list(db.execute(select(User).order_by(User.id)).scalars())


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: AdminUserCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)
) -> User:
    ensure_unique(db, payload.username, payload.email)
    user = User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A fiók már létezik.") from exc
    return user


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "A fiók nem található.")
    ensure_unique(db, payload.username, payload.email, exclude_id=user_id)
    user.username = payload.username
    user.full_name = payload.full_name
    user.email = payload.email
    if payload.new_password:
        user.hashed_password = hash_password(payload.new_password)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Ütköző adatok.") from exc
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response, response_model=None)
def delete_user(
    user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)
) -> None:
    if user_id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A saját fiókodat nem törölheted.")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "A fiók nem található.")
    try:
        
        active = select(Booking).where(
            Booking.user_id == user_id, Booking.status != BookingStatus.CANCELLED
        )
        for b in db.execute(active).scalars():
            trip = db.get(Trip, b.trip_id)
            if trip:
                trip.booked_seats = max(0, trip.booked_seats - b.seats)
        db.delete(user)
        db.commit()
    except Exception:
        db.rollback()
        raise
