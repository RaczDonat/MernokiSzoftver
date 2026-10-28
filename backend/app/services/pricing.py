
from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

LOW_AVAILABILITY_THRESHOLD = Decimal("0.20")
SURCHARGE_RATE = Decimal("0.15")


class CapacityError(Exception):
    """Ha nincs elég szabad hely, akkor a foglalást el kell utasítani."""


@dataclass(frozen=True)
class PriceQuote:
    unit_price: Decimal
    total_price: Decimal
    surcharge_applied: bool


def _round_huf(value: Decimal) -> Decimal:
    return value.quantize(Decimal("1"), rounding=ROUND_HALF_UP)


def calculate_price(
    base_price: Decimal,
    max_capacity: int,
    booked_seats: int,
    seats: int = 1,
) -> PriceQuote:
    
    if seats < 1:
        raise ValueError("A foglalt helyek száma legalább 1 kell legyen.")
    if max_capacity < 1:
        raise ValueError("A kapacitásnak pozitívnak kell lennie.")
    if booked_seats < 0:
        raise ValueError("A foglalt helyek száma nem lehet negatív.")

    seats_after = booked_seats + seats
    if seats_after > max_capacity:
        raise CapacityError(
            f"Nincs elég szabad hely: {max_capacity - booked_seats} elérhető, {seats} igényelt."
        )

    availability_after = Decimal(max_capacity - seats_after) / Decimal(max_capacity)
    surcharge_applied = availability_after < LOW_AVAILABILITY_THRESHOLD

    base = Decimal(base_price)
    unit_price = _round_huf(base * (Decimal(1) + SURCHARGE_RATE)) if surcharge_applied else base

    return PriceQuote(
        unit_price=unit_price,
        total_price=_round_huf(unit_price * seats),
        surcharge_applied=surcharge_applied,
    )
