import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageBackdrop } from "@/components/travel/PageBackdrop";
import { TripCard } from "@/components/travel/TripCard";
import { formatHuf } from "@/lib/travel/pricing";
import { createBooking, useTravelState } from "@/lib/travel/store";
export const Route = createFileRoute("/trips")({
    head: () => ({
        meta: [
            { title: "Utazások keresése — Voyara Travel" },
            {
                name: "description",
                content: "Keresd és szűrd az utazásokat célállomás, indulási dátum és ár szerint, élő kapacitás-információval.",
            },
            { property: "og:title", content: "Utazások keresése — Voyara Travel Studio" },
            {
                property: "og:description",
                content: "Szűrés célállomás, dátum és ár szerint, élő szabadhely-információval.",
            },
        ],
    }),
    component: TripsPage,
});
const CATEGORIES = ["Mind", "Európa", "Tenger", "Hegyvidék"];
function TripsPage() {
    const { trips } = useTravelState();
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Mind");
    const [maxPrice, setMaxPrice] = useState(120000);
    const [fromDate, setFromDate] = useState("");
    const [message, setMessage] = useState(null);
    const filtered = useMemo(() => trips.filter((trip) => {
        const matchesQuery = !query ||
            `${trip.title} ${trip.destination} ${trip.country}`
                .toLowerCase()
                .includes(query.toLowerCase());
        const matchesCategory = category === "Mind" || trip.category === category;
        const matchesPrice = trip.basePrice <= maxPrice;
        const matchesDate = !fromDate || trip.departureDate >= fromDate;
        return matchesQuery && matchesCategory && matchesPrice && matchesDate;
    }), [trips, query, category, maxPrice, fromDate]);
    const handleBook = (trip) => void createBooking(trip.id, 1).then((r) => setMessage(r.message));
    return (_jsx(PageBackdrop, { children: _jsxs("section", { className: "position-relative voyara-z-10 mx-auto container px-4 voyara-pb-16 voyara-pt-8", children: [_jsx("h1", { className: "font-display voyara-text-3xl fw-semibold voyara-tracking-tight voyara-text-4xl-sm", children: "Utaz\u00E1sok" }), _jsx("p", { className: "mt-2 voyara-max-w-md small voyara-text-ink-60", children: "Sz\u0171r\u00E9s c\u00E9l\u00E1llom\u00E1s, indul\u00E1s \u00E9s \u00E1r szerint \u2014 \u00E9l\u0151 kapacit\u00E1ssal \u00E9s dinamikus \u00E1raj\u00E1nlattal." }), _jsxs("div", { className: "glass-panel mt-4 d-grid gap-3 voyara-rounded-3xl p-4 voyara-grid-cols-4-md", children: [_jsxs("label", { className: "voyara-text-xs fw-medium voyara-text-ink-60", children: ["C\u00E9l\u00E1llom\u00E1s", _jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "pl. Santorini", className: "form-control mt-2" })] }), _jsxs("label", { className: "voyara-text-xs fw-medium voyara-text-ink-60", children: ["Indul\u00E1s ett\u0151l", _jsx("input", { type: "date", value: fromDate, onChange: (e) => setFromDate(e.target.value), className: "form-control mt-2" })] }), _jsxs("label", { className: "voyara-text-xs fw-medium voyara-text-ink-60", children: ["Maximum alap\u00E1r: ", _jsx("span", { className: "voyara-text-ink", children: formatHuf(maxPrice) }), _jsx("input", { type: "range", min: 20000, max: 120000, step: 1000, value: maxPrice, onChange: (e) => setMaxPrice(Number(e.target.value)), className: "form-range mt-3" })] }), _jsxs("div", { className: "voyara-text-xs fw-medium voyara-text-ink-60", children: ["Kateg\u00F3ria", _jsx("div", { className: "voyara-mt-1-5 d-flex flex-wrap voyara-gap-1-5", children: CATEGORIES.map((cat) => (_jsx("button", { type: "button", onClick: () => setCategory(cat), className: cat === category
                                            ? "rounded-3 voyara-bg-brand px-3 voyara-py-1-5 voyara-text-xs fw-semibold voyara-text-primary-foreground"
                                            : "rounded-3 voyara-bg-card px-3 voyara-py-1-5 voyara-text-xs fw-medium voyara-text-ink-60 voyara-hover-text-ink", children: cat }, cat))) })] })] }), message && (_jsx("p", { className: "glass-panel voyara-mt-5 voyara-rounded-2xl px-4 py-3 small fw-medium voyara-text-brand-deep", children: message })), _jsxs("p", { className: "mt-4 small voyara-text-ink-50", children: [filtered.length, " tal\u00E1lat"] }), _jsx("div", { className: "mt-3 d-grid voyara-grid-cols-1 gap-4 voyara-grid-cols-2-md voyara-grid-cols-2-lg", children: filtered.map((trip) => (_jsx(TripCard, { trip: trip, onBook: handleBook }, trip.id))) }), filtered.length === 0 && (_jsx("p", { className: "glass-panel mt-3 voyara-rounded-2xl voyara-p-8 text-center small voyara-text-ink-60", children: "Nincs a sz\u0171r\u00E9snek megfelel\u0151 utaz\u00E1s." }))] }) }));
}
