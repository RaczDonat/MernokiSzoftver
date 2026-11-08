

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Booking, BookingStatus, Trip, User, UserRole
from ..schemas import BookingCreate, BookingRead
from ..services.booking_service import (
    ConcurrentBookingError,
    TripLockedError,
    TripNotFoundError,
    create_booking,
)
from ..services.pricing import CapacityError

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=list[BookingRead])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Booking]:
    """Saját foglalások (admin minden foglalást lát a statisztikákhoz)."""
    stmt = select(Booking).order_by(Booking.created_at.desc(), Booking.id.desc())
    if current_user.role is not UserRole.ADMIN:
        stmt = stmt.where(Booking.user_id == current_user.id)
    return list(db.execute(stmt).scalars().all())


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def book_trip(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Booking:

    try:
        return create_booking(
            db,
            user_id=current_user.id,
            trip_id=payload.trip_id,
            seats=payload.seats,
        )
    except TripNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except TripLockedError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except CapacityError as exc:
        # 409 Conflict: az erőforrás jelenlegi állapota nem engedi a műveletet.
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ConcurrentBookingError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A foglalás feldolgozása sikertelen.",
        ) from exc


@router.post("/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None or (
        booking.user_id != current_user.id and current_user.role is not UserRole.ADMIN
    ):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="A foglalás nem található.")
    if booking.status is BookingStatus.CANCELLED:
        return booking
    try:
        trip = db.get(Trip, booking.trip_id)
        if trip:
            trip.booked_seats = max(0, trip.booked_seats - booking.seats)
        booking.status = BookingStatus.CANCELLED
        db.commit()
        db.refresh(booking)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="A lemondás sikertelen.") from exc
    return booking
