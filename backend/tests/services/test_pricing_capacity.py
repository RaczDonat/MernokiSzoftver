from decimal import Decimal

import pytest

from app.services.pricing import CapacityError, calculate_price


def test_raises_when_request_exceeds_free_seats():
    with pytest.raises(CapacityError):
        calculate_price(Decimal("10000"), max_capacity=10, booked_seats=9, seats=2)


def test_raises_when_trip_is_full():
    with pytest.raises(CapacityError):
        calculate_price(Decimal("10000"), max_capacity=10, booked_seats=10, seats=1)


def test_allows_booking_exactly_the_last_seats():
    quote = calculate_price(Decimal("10000"), max_capacity=10, booked_seats=8, seats=2)
    assert quote.total_price == Decimal("23000")
