from decimal import Decimal

from app.services.pricing import calculate_price

BASE = Decimal("10000")


def test_no_surcharge_with_plenty_of_availability():
    quote = calculate_price(BASE, max_capacity=10, booked_seats=0)
    assert quote.surcharge_applied is False
    assert quote.unit_price == BASE
    assert quote.total_price == BASE


def test_no_surcharge_when_availability_is_exactly_threshold():
    # a foglalás után 20% szabad, ez még nem "kevesebb mint 20%"
    quote = calculate_price(BASE, max_capacity=10, booked_seats=7, seats=1)
    assert quote.surcharge_applied is False
    assert quote.unit_price == BASE


def test_surcharge_when_availability_drops_below_threshold():
    quote = calculate_price(BASE, max_capacity=10, booked_seats=8, seats=1)
    assert quote.surcharge_applied is True
    assert quote.unit_price == Decimal("11500")
    assert quote.total_price == Decimal("11500")


def test_surcharge_applies_when_booking_fills_the_trip():
    quote = calculate_price(BASE, max_capacity=10, booked_seats=9, seats=1)
    assert quote.surcharge_applied is True


def test_surcharge_decided_by_availability_after_booking():
    quote = calculate_price(BASE, max_capacity=10, booked_seats=7, seats=2)
    assert quote.surcharge_applied is True
    assert quote.total_price == Decimal("23000")
