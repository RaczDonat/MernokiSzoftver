

from __future__ import annotations

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Response, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_admin
from ..models import Trip, User
from ..schemas import TripCreate, TripRead, TripUpdate

router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("", response_model=list[TripRead])
def list_trips(
    db: Session = Depends(get_db),
    destination: str | None = Query(default=None, max_length=120),
    date_from: date | None = None,
    date_to: date | None = None,
    max_price: Decimal | None = Query(default=None, ge=0),
    only_available: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[Trip]:
    """Utazások listázása szűrési feltételekkel."""
    stmt = select(Trip)
    if destination:
        stmt = stmt.where(Trip.destination.ilike(f"%{destination}%"))
    if date_from:
        stmt = stmt.where(Trip.departure_date >= date_from)
    if date_to:
        stmt = stmt.where(Trip.departure_date <= date_to)
    if max_price is not None:
        stmt = stmt.where(Trip.base_price <= max_price)
    if only_available:
        stmt = stmt.where(Trip.booked_seats < Trip.max_capacity)

    stmt = stmt.order_by(Trip.departure_date).limit(limit).offset(offset)

    try:
        return list(db.execute(stmt).scalars().all())
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Az utazások lekérdezése átmenetileg nem érhető el.",
        ) from exc


@router.get("/{trip_id}", response_model=TripRead)
def get_trip(trip_id: int, db: Session = Depends(get_db)) -> Trip:
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Az utazás nem található.")
    return trip


@router.post("", response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Trip:
    """Új utazás létrehozása – kizárólag admin szerepkörrel."""
    trip = Trip(**payload.model_dump(), booked_seats=0)
    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Az utazás létrehozása sikertelen.",
        ) from exc
    return trip


@router.patch("/{trip_id}", response_model=TripRead)
def update_trip(
    trip_id: int,
    payload: TripUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Trip:
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Az utazás nem található.")
    if payload.locked is not None:
        trip.locked = payload.locked
    if payload.max_capacity is not None:
        trip.max_capacity = max(trip.booked_seats, payload.max_capacity)
    if payload.base_price is not None:
        trip.base_price = payload.base_price
    try:
        db.commit()
        db.refresh(trip)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A módosítás sikertelen.") from exc
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response, response_model=None)
def delete_trip(
    trip_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)
) -> None:
    """Admin: utazás törlése a hozzá tartozó foglalásokkal együtt."""
    trip = db.get(Trip, trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Az utazás nem található.")
    db.delete(trip)
    db.commit()
