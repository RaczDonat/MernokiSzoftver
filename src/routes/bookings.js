import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageBackdrop } from "@/components/travel/PageBackdrop";
import { formatDate, formatHuf } from "@/lib/travel/pricing";
import { cancelBooking, useCurrentUser, useTravelState } from "@/lib/travel/store";
export const Route = createFileRoute("/bookings")({
    head: () => ({
        meta: [
            { title: "Foglalásaim — Voyara Travel" },
            {
                name: "description",
                content: "Saját foglalások áttekintése: fizetett ár, dinamikus felár és foglalási státusz egy helyen.",
            },
            { property: "og:title", content: "Foglalásaim — Voyara Travel Studio" },
            {
                property: "og:description",
                content: "Fizetett ár, felár és státusz minden foglalásodnál.",
            },
        ],
    }),
    component: BookingsPage,
});
const STATUS_LABEL = {
    confirmed: "Megerősítve",
    pending: "Függőben",
    cancelled: "Lemondva",
};
const STATUS_CLASS = {
    confirmed: "voyara-bg-success-15 voyara-text-success",
    pending: "voyara-bg-accent-20 voyara-text-accent",
    cancelled: "voyara-bg-ink-10 voyara-text-ink-50",
};
function BookingsPage() {
    const { trips, bookings } = useTravelState();
    const currentUser = useCurrentUser();
    const mine = bookings.filter((b) => b.userId === currentUser?.id);
    return (_jsx(PageBackdrop, { children: _jsxs("section", { className: "position-relative voyara-z-10 mx-auto container px-4 voyara-pb-16 voyara-pt-8", children: [_jsx("h1", { className: "font-display voyara-text-3xl fw-semibold voyara-tracking-tight voyara-text-4xl-sm", children: "Foglal\u00E1saim" }), _jsx("p", { className: "mt-2 voyara-max-w-md small voyara-text-ink-60", children: "A fizetett \u00E1r a foglal\u00E1s pillanat\u00E1ban r\u00F6gz\u00FCl \u2014 a k\u00E9s\u0151bbi \u00E1remel\u00E9s nem \u00E9rinti." }), _jsxs("div", { className: "glass-panel mt-4 overflow-x-auto voyara-rounded-3xl", children: [_jsxs("table", { className: "table table-sm align-middle voyara-min-w-640 text-start small", children: [_jsx("thead", { className: "voyara-text-11 text-uppercase voyara-tracking-wide voyara-text-ink-50", children: _jsxs("tr", { className: "border-bottom voyara-border-ink-10", children: [_jsx("th", { className: "px-4 py-3 fw-medium", children: "Utaz\u00E1s" }), _jsx("th", { className: "px-4 py-3 fw-medium", children: "Indul\u00E1s" }), _jsx("th", { className: "px-4 py-3 fw-medium", children: "Fizetett \u00E1r" }), _jsx("th", { className: "px-4 py-3 fw-medium", children: "St\u00E1tusz" }), _jsx("th", { className: "px-4 py-3 fw-medium text-end", children: "M\u0171velet" })] }) }), _jsx("tbody", { children: mine.map((booking) => {
                                        const trip = trips.find((t) => t.id === booking.tripId);
                                        return (_jsxs("tr", { className: "border-bottom voyara-border-ink-5 voyara-last-border-0", children: [_jsxs("td", { className: "px-4 py-3", children: [_jsx("div", { className: "fw-semibold", children: trip?.title ?? "Ismeretlen utazás" }), _jsxs("div", { className: "voyara-text-xs voyara-text-ink-50", children: [trip?.destination, ", ", trip?.country] })] }), _jsx("td", { className: "px-4 py-3 voyara-text-ink-70", children: trip ? formatDate(trip.departureDate) : "—" }), _jsxs("td", { className: "px-4 py-3", children: [_jsx("div", { className: "font-display fs-6 fw-semibold", children: formatHuf(booking.pricePaid) }), booking.surchargeApplied && (_jsx("div", { className: "voyara-text-11 fw-medium voyara-text-accent", children: "+15% fel\u00E1rral" }))] }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `rounded-pill px-3 py-1 voyara-text-11 fw-semibold ${STATUS_CLASS[booking.status]}`, children: STATUS_LABEL[booking.status] }) }), _jsx("td", { className: "px-4 py-3 text-end", children: booking.status !== "cancelled" && (_jsx("button", { type: "button", onClick: () => void cancelBooking(booking.id), className: "rounded-3 border voyara-border-ink-10 px-3 voyara-py-1-5 voyara-text-xs fw-semibold voyara-text-ink-70 voyara-transition voyara-hover-bg-card", children: "Lemond\u00E1s" })) })] }, booking.id));
                                    }) })] }), mine.length === 0 && (_jsxs("div", { className: "voyara-p-10 text-center small voyara-text-ink-60", children: ["M\u00E9g nincs foglal\u00E1sod.", " ", _jsx(Link, { to: "/trips", className: "fw-semibold voyara-text-brand-deep voyara-hover-underline", children: "B\u00F6ng\u00E9ssz az utaz\u00E1sok k\u00F6z\u00F6tt" }), "."] }))] })] }) }));
}
