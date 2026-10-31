import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { availabilityRatio, formatDate, formatHuf, freeSeats, isSoldOut, occupancyRatio, quotePrice, } from "@/lib/travel/pricing";

//Egy utazás kártyája: kapacitás-sáv, dinamikus ár és foglalás gomb.

export function TripCard({ trip, onBook }) {
    const quote = quotePrice(trip, 1);
    const soldOut = isSoldOut(trip);
    const free = freeSeats(trip);
    const fillPercent = Math.round(occupancyRatio(trip) * 100);
    const lowAvailability = !soldOut && availabilityRatio(trip) < 0.2;
    const locked = !!trip.locked;
    const badge = locked
        ? { text: "Ideiglenesen zárolva", className: "voyara-bg-ink-85 voyara-text-primary-foreground" }
        : soldOut
            ? { text: "Teljes", className: "voyara-bg-ink-85 voyara-text-primary-foreground" }
            : lowAvailability
                ? { text: `${free} hely hátra`, className: "voyara-bg-accent-90 voyara-text-accent-foreground" }
                : { text: "Szabad helyek", className: "voyara-bg-brand-90 voyara-text-primary-foreground" };
    const barClass = soldOut ? "voyara-bg-destructive" : lowAvailability ? "voyara-bg-accent" : "voyara-bg-brand";
    return (_jsxs("article", { className: "glass-panel  d-flex flex-column overflow-hidden voyara-rounded-3xl shadow-glass voyara-transition voyara-hover-lift", children: [_jsxs("div", { className: "position-relative", children: [_jsx("img", { src: trip.image, alt: `${trip.title} – ${trip.destination}`, loading: "lazy", width: 1024, height: 512, className: "voyara-trip-card-image w-100 voyara-object-cover" }), _jsx("span", { className: `position-absolute voyara-left-3 voyara-top-3 rounded-pill px-3 py-1 voyara-text-11 fw-bold shadow ${badge.className}`, children: badge.text })] }), _jsxs("div", { className: "d-flex flex-grow-1 flex-column p-3", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between", children: [_jsxs("span", { className: "voyara-text-11 fw-semibold text-uppercase voyara-tracking-wide voyara-text-brand-deep", children: [trip.destination, ", ", trip.country] }), _jsxs("span", { className: "voyara-text-xs voyara-text-ink-40", children: [trip.durationDays, " nap"] })] }), _jsx("h3", { className: "mt-1 font-display voyara-text-xl fw-semibold voyara-tracking-tight", children: trip.title }), _jsxs("div", { className: "mt-3 d-flex align-items-center gap-2 voyara-text-xs voyara-text-ink-60", children: [_jsx("span", { children: formatDate(trip.departureDate) }), _jsx("span", { className: "voyara-size-1 rounded-pill voyara-bg-ink-30" }), _jsx("span", { children: trip.accommodation })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between voyara-text-xs fw-medium", children: [_jsxs("span", { className: "voyara-text-ink-50", children: [trip.bookedSeats, "/", trip.maxCapacity, " bet\u00F6ltve"] }), soldOut ? (_jsx("span", { className: "voyara-text-destructive", children: "betelt" })) : quote.surchargeApplied ? (_jsx("span", { className: "voyara-text-accent", children: "+15% emelt \u00E1r" })) : (_jsx("span", { className: "voyara-text-success", children: "alap\u00E1r" }))] }), _jsx("div", { className: "voyara-mt-1-5 voyara-h-2 w-100 overflow-hidden rounded-pill voyara-bg-ink-10", children: _jsx("div", { className: `h-100 rounded-pill ${barClass}`, style: { width: `${fillPercent}%` } }) })] }), _jsxs("div", { className: "voyara-mt-5 d-flex align-items-end justify-content-between border-top voyara-border-ink-10 pt-3", children: [_jsxs("div", { children: [!soldOut && quote.surchargeApplied ? (_jsx("div", { className: "voyara-text-11 voyara-text-ink-40 text-decoration-line-through", children: formatHuf(trip.basePrice) })) : (_jsx("div", { className: "voyara-text-11 voyara-text-ink-40", children: trip.accommodation })), _jsx("div", { className: "font-display fs-4 fw-semibold", children: formatHuf(soldOut ? trip.basePrice : quote.finalPrice) })] }), _jsx("button", { type: "button", disabled: soldOut || locked, onClick: () => onBook(trip), className: soldOut || locked
                                    ? "cursor-not-allowed rounded-4 voyara-bg-ink-10 px-4 voyara-py-2-5 small fw-semibold voyara-text-ink-40"
                                    : "rounded-4 voyara-bg-brand px-4 voyara-py-2-5 small fw-semibold voyara-text-primary-foreground shadow-soft voyara-transition voyara-hover-bg-brand-deep", children: locked ? "Zárolva" : soldOut ? "Nincs hely" : "Foglalás" })] })] })] }));
}
