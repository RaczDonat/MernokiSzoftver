"""Kezdő adatok: üres adatbázisnál létrehozza a demo fiókokat és utazásokat."""

from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Trip, User, UserRole
from .security import hash_password


def seed_if_empty(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(User)):
        return
    today = date.today()
    db.add_all(
        [
            User(
                username="admin",
                full_name="Admin",
                email="admin@voyara.hu",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN,
            ),
            User(
                username="gipsz",
                full_name="Gipsz Jakab",
                email="jakab.gipsz@example.com",
                hashed_password=hash_password("gipsz123"),
                role=UserRole.CUSTOMER,
            ),
        ]
    )
    if not db.scalar(select(func.count()).select_from(Trip)):
        trips = [
            ("Mallorca", "ES", "Mallorca Partkaland", 24, 12, "Palma Beach Resort", 49900, 20, 17, "mallorca", "Tenger"),
            ("Santorini", "GR", "Santorini Naplemente", 39, 8, "Oia Cliff Suites", 64200, 30, 11, "santorini", "Tenger"),
            ("Zürich", "CH", "Alpok Havas Kalandozás", 78, 6, "Grindelwald Lodge", 38500, 25, 0, "alps", "Hegyvidék"),
            ("Lisszabon", "PT", "Lisszaboni Villamos Túra", 122, 5, "Alfama Boutique House", 55400, 40, 12, "lisbon", "Európa"),
        ]
        for dest, country, title, days, dur, acc, price, cap, booked, img, cat in trips:
            db.add(
                Trip(
                    destination=dest,
                    country=country,
                    title=title,
                    departure_date=today + timedelta(days=days),
                    duration_days=dur,
                    accommodation=acc,
                    base_price=price,
                    max_capacity=cap,
                    booked_seats=booked,
                    image=f"stock:{img}",
                    category=cat,
                )
            )
    db.commit()
