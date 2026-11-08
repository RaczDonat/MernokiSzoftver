from decimal import Decimal

from app.services.pricing import calculate_price


def test_unit_price_is_rounded_to_whole_huf():
    # 999 * 1.15 = 1148.85
    quote = calculate_price(Decimal("999"), max_capacity=10, booked_seats=9)
    assert quote.unit_price == Decimal("1149")


def test_rounding_is_half_up():
    # 1010 * 1.15 = 1161.5
    quote = calculate_price(Decimal("1010"), max_capacity=10, booked_seats=9)
    assert quote.unit_price == Decimal("1162")


def test_total_is_unit_price_times_seats():
    quote = calculate_price(Decimal("5000"), max_capacity=100, booked_seats=0, seats=3)
    assert quote.total_price == Decimal("15000")
