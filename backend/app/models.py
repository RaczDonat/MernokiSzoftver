"""SQLAlchemy ORM modellek: Users, Trips, Bookings.

Relációk:
  User  1 --- n  Booking
  Trip  1 --- n  Booking
"""

from __future__ import annotations

import enum
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class BookingStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    PENDING = "pending"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    # Soha nem tárolunk nyers jelszót – csak hash-t (pl. passlib/bcrypt).
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.CUSTOMER, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Trip(Base):
    __tablename__ = "trips"
    __table_args__ = (
        CheckConstraint("max_capacity > 0", name="ck_trip_capacity_positive"),
        CheckConstraint("booked_seats >= 0", name="ck_trip_booked_non_negative"),
        CheckConstraint("booked_seats <= max_capacity", name="ck_trip_no_overbooking"),
        CheckConstraint("base_price >= 0", name="ck_trip_price_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    destination: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    country: Mapped[str] = mapped_column(String(2), default="", nullable=False)
    accommodation: Mapped[str] = mapped_column(String(160), default="—", nullable=False)
    image: Mapped[str] = mapped_column(String(2000), default="stock:mallorca", nullable=False)
    category: Mapped[str] = mapped_column(String(30), default="Európa", nullable=False)
    # Ideiglenesen zárolt utazás: látható, de nem foglalható.
    locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    departure_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    max_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    booked_seats: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan"
    )

    @property
    def free_seats(self) -> int:
        return max(self.max_capacity - self.booked_seats, 0)

    @property
    def availability_ratio(self) -> float:
        if self.max_capacity <= 0:
            return 0.0
        return self.free_seats / self.max_capacity


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (CheckConstraint("seats >= 1", name="ck_booking_seats_positive"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), index=True, nullable=False
    )
    seats: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    # A foglalás pillanatában érvényes, ténylegesen fizetett ár.
    price_paid: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    surcharge_applied: Mapped[bool] = mapped_column(default=False, nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.CONFIRMED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="bookings")
    trip: Mapped[Trip] = relationship(back_populates="bookings")
