from decimal import Decimal

import pytest

from app.services.pricing import calculate_price


@pytest.mark.parametrize("seats", [0, -1])
def test_rejects_non_positive_seats(seats):
    with pytest.raises(ValueError):
        calculate_price(Decimal("10000"), max_capacity=10, booked_seats=0, seats=seats)


@pytest.mark.parametrize("capacity", [0, -5])
def test_rejects_non_positive_capacity(capacity):
    with pytest.raises(ValueError):
        calculate_price(Decimal("10000"), max_capacity=capacity, booked_seats=0)


def test_rejects_negative_booked_seats():
    with pytest.raises(ValueError):
        calculate_price(Decimal("10000"), max_capacity=10, booked_seats=-1)
