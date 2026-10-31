
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..models import Booking, BookingStatus, Trip
from .pricing import CapacityError, PriceQuote, calculate_price


class TripNotFoundError(Exception):
    """A megadott azonosítóval nincs utazás."""


class TripLockedError(Exception):
    """Az utazást az admin ideiglenesen zárolta."""


class ConcurrentBookingError(Exception):
    """Egy párhuzamos foglalás közben módosította a kapacitást."""


def _lock_trip(db: Session, trip_id: int) -> Trip:
    stmt = select(Trip).where(Trip.id == trip_id)
    if db.bind is not None and db.bind.dialect.name in {"postgresql", "mysql"}:
        stmt = stmt.with_for_update()
    trip = db.execute(stmt).scalar_one_or_none()
    if trip is None:
        raise TripNotFoundError(f"A(z) {trip_id} azonosítójú utazás nem található.")
    return trip


def create_booking(db: Session, *, user_id: int, trip_id: int, seats: int = 1) -> Booking:
    """Foglalás létrehozása dinamikus árazással, egyetlen tranzakcióban.
    Raises:
        TripNotFoundError, CapacityError, ValueError, ConcurrentBookingError
    """
    try:
        trip = _lock_trip(db, trip_id)
        if trip.locked:
            raise TripLockedError("Ez az utazás ideiglenesen zárolva van.")
        expected_seats = trip.booked_seats

        quote: PriceQuote = calculate_price(
            base_price=Decimal(trip.base_price),
            max_capacity=trip.max_capacity,
            booked_seats=expected_seats,
            seats=seats,
        )

        result = db.execute(
            update(Trip)
            .where(Trip.id == trip.id, Trip.booked_seats == expected_seats)
            .where(Trip.booked_seats + seats <= Trip.max_capacity)
            .values(booked_seats=expected_seats + seats)
        )
        if result.rowcount != 1:
            raise ConcurrentBookingError(
                "A helyek időközben elfogytak, kérjük próbálja újra."
            )

        booking = Booking(
            user_id=user_id,
            trip_id=trip.id,
            seats=seats,
            price_paid=quote.total_price,
            surcharge_applied=quote.surcharge_applied,
            status=BookingStatus.CONFIRMED,
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    except (CapacityError, ValueError, TripNotFoundError, TripLockedError, ConcurrentBookingError):
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
