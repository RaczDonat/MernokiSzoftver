import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute } from "@tanstack/react-router";
import { PageBackdrop } from "@/components/travel/PageBackdrop";
import { availabilityRatio, formatDate, formatHuf, quotePrice, SURCHARGE_RATE, LOW_AVAILABILITY_THRESHOLD, } from "@/lib/travel/pricing";
import { deleteTrip, toggleTripLock, updateTripCapacity, updateTripPrice, useCurrentUser, useTravelState, } from "@/lib/travel/store";
import { NewTripForm, UserManager } from "@/components/travel/AdminPanels";
export const Route = createFileRoute("/admin")({
    head: () => ({
        meta: [
            { title: "Admin felület — Voyara Travel" },
            {
                name: "description",
                content: "Utazások kapacitásának és alapárának kezelése, valamint a dinamikus árazási szabály áttekintése.",
            },
            { property: "og:title", content: "Admin felület — Voyara Travel Studio" },
            {
                property: "og:description",
                content: "Kapacitás, alapár és árazási szabályok adminisztrációja.",
            },
        ],
    }),
    component: AdminPage,
});
function AdminPage() {
    const { trips, bookings } = useTravelState();
    const me = useCurrentUser();
    if (me && me.role !== "admin") {
        return (_jsx(PageBackdrop, { children: _jsx("section", { className: "position-relative voyara-z-10 mx-auto container px-4 voyara-pt-8", children: _jsxs("div", { className: "glass-panel voyara-rounded-3xl p-4", children: [_jsx("h1", { className: "font-display voyara-text-3xl fw-semibold", children: "Nincs jogosults\u00E1god" }), _jsx("p", { className: "mt-2 small voyara-text-ink-60", children: "Az admin fel\u00FClet csak adminisztr\u00E1tori fi\u00F3kkal \u00E9rhet\u0151 el." })] }) }) }));
    }
    const revenue = bookings
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + b.pricePaid, 0);
    return (_jsx(PageBackdrop, { children: _jsxs("section", { className: "position-relative voyara-z-10 mx-auto container px-4 voyara-pb-16 voyara-pt-8", children: [_jsx("h1", { className: "font-display voyara-text-3xl fw-semibold voyara-tracking-tight voyara-text-4xl-sm", children: "Admin fel\u00FClet" }), _jsxs("p", { className: "mt-2 voyara-max-w-lg small voyara-text-ink-60", children: ["\u00C1raz\u00E1si szab\u00E1ly: ha a szabad helyek ar\u00E1nya", " ", Math.round(LOW_AVAILABILITY_THRESHOLD * 100), "% al\u00E1 esik, a foglal\u00E1s \u00E1ra automatikusan", " ", Math.round(SURCHARGE_RATE * 100), "%-kal emelkedik. T\u00FAlfoglal\u00E1s nem enged\u00E9lyezett."] }), _jsx("div", { className: "glass-panel mt-4 d-inline-flex voyara-rounded-2xl px-4 py-3", children: _jsxs("div", { children: [_jsx("div", { className: "voyara-text-11 text-uppercase voyara-tracking-wide voyara-text-ink-50", children: "Bev\u00E9tel (akt\u00EDv)" }), _jsx("div", { className: "mt-1 font-display voyara-text-3xl fw-semibold", children: formatHuf(revenue) })] }) }), _jsx(NewTripForm, {}), _jsx("h2", { className: "voyara-mt-10 font-display fs-4 fw-semibold voyara-tracking-tight", children: "Utaz\u00E1sok kezel\u00E9se" }), _jsx("div", { className: "mt-3 d-grid gap-3 voyara-grid-cols-2-md", children: trips.map((trip) => {
                        const quote = quotePrice(trip, 1);
                        const free = Math.max(trip.maxCapacity - trip.bookedSeats, 0);
                        return (_jsxs("div", { className: "glass-panel voyara-rounded-3xl p-4", children: [_jsxs("div", { className: "d-flex align-items-start justify-content-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display voyara-text-xl fw-semibold voyara-tracking-tight", children: trip.title }), _jsxs("p", { className: "voyara-text-xs voyara-text-ink-50", children: [trip.destination, ", ", trip.country, " \u00B7 ", formatDate(trip.departureDate)] })] }), _jsx("span", { className: `rounded-pill px-3 py-1 voyara-text-11 fw-semibold ${free === 0
                                                ? "voyara-bg-destructive-15 voyara-text-destructive"
                                                : quote.surchargeApplied
                                                    ? "voyara-bg-accent-20 voyara-text-accent"
                                                    : "voyara-bg-success-15 voyara-text-success"}`, children: trip.locked ? "Zárolva" : free === 0 ? "Betelt" : quote.surchargeApplied ? "Emelt ár" : "Alapár" })] }), _jsxs("dl", { className: "mt-3 d-grid voyara-grid-cols-3 gap-3 voyara-text-xs", children: [_jsxs("div", { children: [_jsx("dt", { className: "voyara-text-ink-50", children: "Foglalt" }), _jsxs("dd", { className: "fw-semibold", children: [trip.bookedSeats, "/", trip.maxCapacity] })] }), _jsxs("div", { children: [_jsx("dt", { className: "voyara-text-ink-50", children: "Szabad" }), _jsxs("dd", { className: "fw-semibold", children: [free, " (", Math.round(availabilityRatio(trip) * 100), "%)"] })] }), _jsxs("div", { children: [_jsx("dt", { className: "voyara-text-ink-50", children: "Aktu\u00E1lis \u00E1r" }), _jsx("dd", { className: "fw-semibold", children: formatHuf(free === 0 ? trip.basePrice : quote.finalPrice) })] })] }), _jsxs("div", { className: "mt-3 d-grid gap-3 voyara-grid-cols-2-sm", children: [_jsxs("label", { className: "voyara-text-xs fw-medium voyara-text-ink-60", children: ["Max. kapacit\u00E1s", _jsx("input", { type: "number", min: trip.bookedSeats, value: trip.maxCapacity, onChange: (e) => updateTripCapacity(trip.id, Number(e.target.value)), className: "form-control mt-2" })] }), _jsxs("label", { className: "voyara-text-xs fw-medium voyara-text-ink-60", children: ["Alap\u00E1r (Ft)", _jsx("input", { type: "number", min: 0, step: 1000, value: trip.basePrice, onChange: (e) => updateTripPrice(trip.id, Number(e.target.value)), className: "form-control mt-2" })] })] }), _jsxs("div", { className: "mt-3 d-flex gap-2", children: [_jsx("button", { type: "button", onClick: () => void toggleTripLock(trip.id), className: "flex-grow-1 rounded-4 border voyara-border px-3 py-2 small fw-medium voyara-transition voyara-hover-bg-mist", children: trip.locked ? "Zárolás feloldása" : "Ideiglenes zárolás" }), _jsx("button", { type: "button", onClick: () => {
                                                if (window.confirm(`Biztosan törlöd: ${trip.title}? A foglalásai is törlődnek.`))
                                                    void deleteTrip(trip.id);
                                            }, className: "flex-grow-1 rounded-4 voyara-bg-destructive-10 px-3 py-2 small fw-semibold voyara-text-destructive voyara-transition voyara-hover-bg-destructive-20", children: "T\u00F6rl\u00E9s" })] })] }, trip.id));
                    }) }), _jsx(UserManager, {})] }) }));
}
