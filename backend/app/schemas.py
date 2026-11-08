
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .models import BookingStatus, UserRole

USERNAME_PATTERN = r"^[a-z0-9._-]{3,20}$"
TripCategory = Literal["Európa", "Tenger", "Hegyvidék"]


def _normalize(v: object) -> object:
    return v.strip().lower() if isinstance(v, str) else v


#Felhasználók/azonosítás:


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: EmailStr
    role: UserRole


class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=20)
    password: str = Field(min_length=1, max_length=128)

    _norm = field_validator("username", mode="before")(_normalize)


class RegisterIn(BaseModel):
    username: str = Field(pattern=USERNAME_PATTERN)
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr

    _norm = field_validator("username", "email", mode="before")(_normalize)

    @field_validator("full_name", mode="before")
    @classmethod
    def _strip(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v


class AdminUserCreate(RegisterIn):
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    username: str = Field(pattern=USERNAME_PATTERN)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    new_password: str | None = Field(default=None, min_length=6, max_length=128)

    _norm = field_validator("username", "email", mode="before")(_normalize)

    @field_validator("new_password", mode="before")
    @classmethod
    def _empty_to_none(cls, v: object) -> object:
        return None if v == "" else v


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


#Utazások:


class TripBase(BaseModel):
    destination: str = Field(min_length=1, max_length=120)
    title: str = Field(min_length=3, max_length=160)
    departure_date: date
    duration_days: int = Field(ge=1, le=365)
    max_capacity: int = Field(ge=1, le=10_000)
    base_price: Decimal = Field(gt=0)
    country: str = Field(default="", max_length=2)
    accommodation: str = Field(default="—", max_length=160)
    image: str = Field(default="stock:mallorca", max_length=2000)
    category: TripCategory = "Európa"


class TripCreate(TripBase):
    """Admin által létrehozott új utazás."""

    country: str = Field(pattern=r"^[A-Za-z]{2}$")

    @field_validator("departure_date")
    @classmethod
    def _not_in_past(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("Az indulás nem lehet múltbeli dátum.")
        return v

    @field_validator("image")
    @classmethod
    def _safe_image(cls, v: str) -> str:
        if not (v.startswith("stock:") or v.startswith("https://") or v.startswith("http://")):
            raise ValueError("A kép csak stock kép vagy http(s) URL lehet.")
        return v


class TripUpdate(BaseModel):
    locked: bool | None = None
    max_capacity: int | None = Field(default=None, ge=1, le=10_000)
    base_price: Decimal | None = Field(default=None, ge=0)


class TripRead(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booked_seats: int
    free_seats: int
    availability_ratio: float
    locked: bool


#Foglalások:


class BookingCreate(BaseModel):
    trip_id: int = Field(ge=1)
    seats: int = Field(default=1, ge=1, le=20)


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    trip_id: int
    seats: int
    price_paid: Decimal
    surcharge_applied: bool
    status: BookingStatus
    created_at: datetime
