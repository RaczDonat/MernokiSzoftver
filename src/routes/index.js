import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageBackdrop } from "@/components/travel/PageBackdrop";
import { TripCard } from "@/components/travel/TripCard";
import { availabilityRatio, formatHuf, occupancyRatio, quotePrice } from "@/lib/travel/pricing";
import { createBooking, useCurrentUser, useTravelState } from "@/lib/travel/store";
export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "Dashboard — Voyara Travel" },
            {
                name: "description",
                content: "Áttekintés az aktív foglalásokról, a kapacitásról és a dinamikus árazásról a Voyara utazáskezelő rendszerében.",
            },
            { property: "og:title", content: "Dashboard — Voyara Travel Studio" },
            {
                property: "og:description",
                content: "Aktív foglalások, kapacitás és dinamikus árazás egy pillantásra.",
            },
        ],
    }),
    component: Dashboard,
});
function Dashboard() {
    const { trips, bookings } = useTravelState();
    const currentUser = useCurrentUser();
    const hour = new Date().getHours();
    const greeting = hour < 10 ? "Jó reggelt" : hour < 18 ? "Jó napot" : "Jó estét";
    const monthLabel = new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(new Date());
    const [message, setMessage] = useState(null);
    const myBookings = bookings.filter((b) => b.userId === currentUser?.id && b.status !== "cancelled");
    const avgPaid = myBookings.length
        ? myBookings.reduce((sum, b) => sum + b.pricePaid, 0) / myBookings.length
        : 0;
    const surchargedTrips = trips.filter((t) => quotePrice(t, 1).surchargeApplied).length;
    const avgOccupancy = trips.length
        ? Math.round((trips.reduce((s, t) => s + occupancyRatio(t), 0) / trips.length) * 100)
        : 0;
    const tightest = trips
        .filter((t) => t.bookedSeats < t.maxCapacity)
        .sort((a, b) => availabilityRatio(a) - availabilityRatio(b))[0];
    const handleBook = (trip) => void createBooking(trip.id, 1).then((r) => setMessage(r.message));
    return (_jsxs(PageBackdrop, { children: [_jsx("section", { className: "position-relative voyara-z-10 mx-auto container px-4 voyara-pt-8", children: _jsxs("div", { className: "d-flex flex-column gap-4 voyara-flex-row-md voyara-items-end-md voyara-justify-between-md", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-2 d-flex align-items-center gap-2", children: [_jsx("span", { className: "rounded-pill voyara-bg-accent-20 px-3 py-1 voyara-text-11 fw-semibold voyara-text-accent", children: "Dinamikus \u00E1raz\u00E1s akt\u00EDv" }), _jsx("span", { className: "rounded-pill voyara-bg-brand-10 px-3 py-1 voyara-text-11 fw-semibold voyara-text-brand-deep", children: monthLabel })] }), _jsxs("h1", { suppressHydrationWarning: true, className: "font-display voyara-text-4xl fw-semibold voyara-leading-105 voyara-tracking-tight voyara-text-5xl-md", children: [greeting, ", ", currentUser?.fullName.split(" ").at(-1)] }), _jsxs("p", { className: "mt-3 voyara-max-w-md small voyara-text-ink-60", children: [myBookings.length, " akt\u00EDv foglal\u00E1sod van.", " ", tightest && (_jsxs(_Fragment, { children: ["A ", tightest.destination, " t\u00FAra m\u00E1r csak", " ", _jsxs("span", { className: "fw-semibold voyara-text-accent", children: [Math.max(tightest.maxCapacity - tightest.bookedSeats, 0), " helyre"] }), " ", "el\u00E9rhet\u0151."] }))] })] }), _jsxs("div", { className: "d-flex align-items-center gap-3", children: [_jsx(Link, { to: "/bookings", className: "glass-panel voyara-rounded-2xl px-4 py-3 small fw-semibold voyara-text-ink voyara-transition voyara-hover-bg-card", children: "Foglal\u00E1saim" }), _jsx(Link, { to: "/trips", className: "voyara-rounded-2xl voyara-bg-brand px-4 py-3 small fw-semibold voyara-text-primary-foreground shadow-soft voyara-transition voyara-hover-bg-brand-deep", children: "+ \u00DAj utaz\u00E1s" })] })] }) }), _jsxs("section", { className: "position-relative voyara-z-10 mx-auto d-grid container voyara-grid-cols-2 gap-3 px-4 voyara-pt-7 voyara-grid-cols-4-lg", children: [_jsx(StatCard, { label: "Akt\u00EDv foglal\u00E1s", value: String(myBookings.length), note: "saj\u00E1t fi\u00F3kodban" }), _jsx(StatCard, { label: "\u00C1tlag foglal\u00E1s", value: formatHuf(avgPaid), note: "utaz\u00E1sonk\u00E9nt" }), _jsx(StatCard, { label: "Emelt \u00E1r\u00FA", value: String(surchargedTrips), note: "15% fel\u00E1rral", accent: true }), _jsx(StatCard, { label: "Kapacit\u00E1s", value: `${avgOccupancy}%`, note: "\u00E1tlagos kit\u00F6lt\u00F6tts\u00E9g" })] }), _jsxs("section", { className: "position-relative voyara-z-10 mx-auto container px-4 voyara-pb-16 voyara-pt-10", children: [_jsxs("div", { className: "voyara-mb-5 d-flex align-items-end justify-content-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display fs-4 fw-semibold voyara-tracking-tight", children: "K\u00F6zelg\u0151 utaz\u00E1sok" }), _jsx("p", { className: "small voyara-text-ink-50", children: "\u00C9l\u0151 kapacit\u00E1s \u00E9s azonnali \u00E1raj\u00E1nlat" })] }), _jsx(Link, { to: "/trips", className: "small fw-medium voyara-text-brand-deep voyara-hover-underline", children: "\u00D6sszes utaz\u00E1s" })] }), message && (_jsx("p", { className: "glass-panel voyara-mb-5 voyara-rounded-2xl px-4 py-3 small fw-medium voyara-text-brand-deep", children: message })), _jsx("div", { className: "d-grid voyara-grid-cols-1 gap-4 voyara-grid-cols-2-md voyara-grid-cols-2-lg", children: trips.slice(0, 3).map((trip) => (_jsx(TripCard, { trip: trip, onBook: handleBook }, trip.id))) })] })] }));
}
function StatCard({ label, value, note, accent, }) {
    return (_jsxs("div", { className: "glass-panel voyara-rounded-2xl p-4", children: [_jsx("div", { className: "voyara-text-11 fw-medium text-uppercase voyara-tracking-wide voyara-text-ink-50", children: label }), _jsx("div", { className: "mt-2 font-display voyara-text-3xl fw-semibold", children: value }), _jsx("div", { className: `mt-1 voyara-text-xs fw-medium ${accent ? "voyara-text-accent" : "voyara-text-ink-40"}`, children: note })] }));
}
