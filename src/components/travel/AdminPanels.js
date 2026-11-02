import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createTrip, createUser, daysFromToday, deleteUser, updateUser, STOCK_IMAGES, useCurrentUser, useTravelState, } from "@/lib/travel/store";
import { TRIP_CATEGORIES } from "@/lib/travel/types";
const inputClass = "form-control mt-2";
const labelClass = "d-block voyara-text-xs fw-medium voyara-text-ink-60";
const imageOptions = [
    { key: "mallorca", label: "Tengerpart" },
    { key: "santorini", label: "Görög sziget" },
    { key: "alps", label: "Hegyvidék" },
    { key: "lisbon", label: "Városnézés" },
];
/** Admin: új utazás feltöltése. */
export function NewTripForm() {
    const empty = {
        title: "",
        destination: "",
        country: "",
        departureDate: daysFromToday(30),
        durationDays: "7",
        accommodation: "",
        basePrice: "50000",
        maxCapacity: "20",
        imageKey: "mallorca",
        imageUrl: "",
        category: "Európa",
    };
    const [f, setF] = useState(empty);
    const [msg, setMsg] = useState(null);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
    const submit = async (e) => {
        e.preventDefault();
        const res = await createTrip({
            title: f.title,
            destination: f.destination,
            country: f.country,
            departureDate: f.departureDate,
            durationDays: Number(f.durationDays),
            accommodation: f.accommodation,
            basePrice: Number(f.basePrice),
            maxCapacity: Number(f.maxCapacity),
            image: /^https?:\/\//.test(f.imageUrl.trim()) ? f.imageUrl.trim() : STOCK_IMAGES[f.imageKey],
            category: f.category,
        });
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok)
            setF(empty);
    };
    return (_jsxs("form", { onSubmit: submit, className: "glass-panel voyara-mt-8 voyara-rounded-3xl p-4", children: [_jsx("h2", { className: "font-display fs-4 fw-semibold voyara-tracking-tight", children: "\u00DAj utaz\u00E1s felt\u00F6lt\u00E9se" }), _jsxs("div", { className: "mt-3 d-grid gap-3 voyara-grid-cols-2-sm voyara-grid-cols-4-lg", children: [_jsxs("label", { className: labelClass, children: ["C\u00EDm", _jsx("input", { className: inputClass, value: f.title, onChange: (e) => set("title", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["C\u00E9l\u00E1llom\u00E1s", _jsx("input", { className: inputClass, value: f.destination, onChange: (e) => set("destination", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Orsz\u00E1gk\u00F3d", _jsx("input", { className: inputClass, maxLength: 2, placeholder: "IT", value: f.country, onChange: (e) => set("country", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Sz\u00E1ll\u00E1s", _jsx("input", { className: inputClass, value: f.accommodation, onChange: (e) => set("accommodation", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Indul\u00E1s", _jsx("input", { type: "date", min: daysFromToday(0), className: inputClass, value: f.departureDate, onChange: (e) => set("departureDate", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Id\u0151tartam (nap)", _jsx("input", { type: "number", min: 1, className: inputClass, value: f.durationDays, onChange: (e) => set("durationDays", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Alap\u00E1r (Ft)", _jsx("input", { type: "number", min: 0, step: 1000, className: inputClass, value: f.basePrice, onChange: (e) => set("basePrice", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Max. kapacit\u00E1s", _jsx("input", { type: "number", min: 1, className: inputClass, value: f.maxCapacity, onChange: (e) => set("maxCapacity", e.target.value) })] }), _jsxs("label", { className: labelClass, children: ["Kateg\u00F3ria", _jsx("select", { className: inputClass, value: f.category, onChange: (e) => set("category", e.target.value), children: TRIP_CATEGORIES.map((c) => _jsx("option", { children: c }, c)) })] }), _jsxs("label", { className: labelClass, children: ["K\u00E9p", _jsx("select", { className: inputClass, value: f.imageKey, onChange: (e) => set("imageKey", e.target.value), children: imageOptions.map((o) => _jsx("option", { value: o.key, children: o.label }, o.key)) })] }), _jsxs("label", { className: `${labelClass} voyara-col-span-2-sm`, children: ["Vagy saj\u00E1t k\u00E9p URL (opcion\u00E1lis)", _jsx("input", { className: inputClass, placeholder: "https://...", value: f.imageUrl, onChange: (e) => set("imageUrl", e.target.value) })] })] }), _jsxs("div", { className: "mt-3 d-flex align-items-center gap-3", children: [_jsx("button", { type: "submit", className: "rounded-4 voyara-bg-brand px-4 voyara-py-2-5 small fw-semibold voyara-text-primary-foreground shadow-soft voyara-hover-bg-brand-deep", children: "Utaz\u00E1s felt\u00F6lt\u00E9se" }), msg && _jsx("p", { className: `small ${msg.ok ? "voyara-text-success" : "voyara-text-destructive"}`, children: msg.text })] })] }));
}
/** Admin: fiókok listázása, létrehozása és törlése. */
export function UserManager() {
    const { users, bookings } = useTravelState();
    const me = useCurrentUser();
    const [f, setF] = useState({ username: "", password: "", fullName: "", email: "", role: "customer" });
    const [msg, setMsg] = useState(null);
    const [editId, setEditId] = useState(null);
    const [ed, setEd] = useState({ fullName: "", username: "", email: "", newPassword: "" });
    const saveEdit = async (id) => {
        const r = await updateUser(id, ed);
        setMsg({ ok: r.ok, text: r.message });
        if (r.ok)
            setEditId(null);
    };
    const submit = async (e) => {
        e.preventDefault();
        const res = await createUser(f, { signIn: false });
        setMsg({ ok: res.ok, text: res.message });
        if (res.ok)
            setF({ username: "", password: "", fullName: "", email: "", role: "customer" });
    };
    return (_jsxs("div", { className: "voyara-mt-10", children: [_jsx("h2", { className: "font-display fs-4 fw-semibold voyara-tracking-tight", children: "Fi\u00F3kok kezel\u00E9se" }), _jsx("div", { className: "glass-panel mt-3 overflow-x-auto voyara-rounded-3xl", children: _jsxs("table", { className: "table table-sm align-middle voyara-min-w-640 small", children: [_jsx("thead", { className: "voyara-bg-mist-60 text-start voyara-text-11 text-uppercase voyara-tracking-wide voyara-text-ink-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "N\u00E9v" }), _jsx("th", { className: "px-4 py-3", children: "Felhaszn\u00E1l\u00F3n\u00E9v" }), _jsx("th", { className: "px-4 py-3", children: "E-mail" }), _jsx("th", { className: "px-4 py-3", children: "Szerep" }), _jsx("th", { className: "px-4 py-3", children: "Foglal\u00E1sok" }), _jsx("th", { className: "px-4 py-3" })] }) }), _jsx("tbody", { children: users.map((u) => editId === u.id ? (_jsxs("tr", { className: "border-top voyara-border voyara-bg-mist-40", children: [_jsx("td", { className: "px-4 py-2", children: _jsx("input", { "aria-label": "Teljes n\u00E9v", className: inputClass, value: ed.fullName, onChange: (e) => setEd({ ...ed, fullName: e.target.value }) }) }), _jsxs("td", { className: "px-4 py-2", children: [_jsx("input", { "aria-label": "Felhaszn\u00E1l\u00F3n\u00E9v", className: inputClass, value: ed.username, onChange: (e) => setEd({ ...ed, username: e.target.value }) }), ed.username.trim().toLowerCase() !== u.username && (_jsx("input", { "aria-label": "\u00DAj jelsz\u00F3", type: "password", autoComplete: "new-password", placeholder: "\u00DAj jelsz\u00F3", className: inputClass, value: ed.newPassword, onChange: (e) => setEd({ ...ed, newPassword: e.target.value }) }))] }), _jsx("td", { className: "px-4 py-2", children: _jsx("input", { "aria-label": "E-mail", type: "email", className: inputClass, value: ed.email, onChange: (e) => setEd({ ...ed, email: e.target.value }) }) }), _jsx("td", { className: "px-4 py-3 text-capitalize", children: u.role }), _jsx("td", { className: "px-4 py-3" }), _jsxs("td", { className: "text-nowrap px-4 py-3 text-end", children: [_jsx("button", { type: "button", onClick: () => saveEdit(u.id), className: "rounded-3 voyara-bg-brand px-3 voyara-py-1-5 voyara-text-xs fw-semibold voyara-text-primary-foreground voyara-hover-bg-brand-deep", children: "Ment\u00E9s" }), _jsx("button", { type: "button", onClick: () => setEditId(null), className: "ms-2 rounded-3 border voyara-border px-3 voyara-py-1-5 voyara-text-xs fw-medium voyara-hover-bg-mist", children: "M\u00E9gse" })] })] }, u.id)) : (_jsxs("tr", { className: "border-top voyara-border", children: [_jsx("td", { className: "px-4 py-3 fw-semibold", children: u.fullName }), _jsxs("td", { className: "px-4 py-3 voyara-text-ink-70", children: ["@", u.username] }), _jsx("td", { className: "px-4 py-3 voyara-text-ink-70", children: u.email }), _jsx("td", { className: "px-4 py-3 text-capitalize", children: u.role }), _jsx("td", { className: "px-4 py-3", children: bookings.filter((b) => b.userId === u.id && b.status !== "cancelled").length }), _jsxs("td", { className: "text-nowrap px-4 py-3 text-end", children: [_jsx("button", { type: "button", onClick: () => { setEditId(u.id); setEd({ fullName: u.fullName, username: u.username, email: u.email, newPassword: "" }); }, className: "me-2 rounded-3 border voyara-border px-3 voyara-py-1-5 voyara-text-xs fw-medium voyara-hover-bg-mist", children: "Szerkeszt\u00E9s" }), u.id === me?.id ? (_jsx("span", { className: "voyara-text-xs voyara-text-ink-40", children: "te" })) : (_jsx("button", { type: "button", onClick: async () => {
                                                    if (window.confirm(`Biztosan törlöd ${u.fullName} fiókját? A foglalásai is törlődnek.`)) {
                                                        const r = await deleteUser(u.id);
                                                        setMsg({ ok: r.ok, text: r.message });
                                                    }
                                                }, className: "rounded-3 voyara-bg-destructive-10 px-3 voyara-py-1-5 voyara-text-xs fw-semibold voyara-text-destructive voyara-hover-bg-destructive-20", children: "T\u00F6rl\u00E9s" }))] })] }, u.id))) })] }) }), _jsxs("form", { onSubmit: submit, className: "glass-panel mt-3 voyara-rounded-3xl p-4", children: [_jsx("h3", { className: "font-display fs-5 fw-semibold", children: "\u00DAj fi\u00F3k l\u00E9trehoz\u00E1sa" }), _jsxs("div", { className: "mt-3 d-grid gap-3 voyara-grid-cols-2-sm voyara-grid-cols-5-lg", children: [_jsxs("label", { className: labelClass, children: ["Teljes n\u00E9v", _jsx("input", { className: inputClass, value: f.fullName, onChange: (e) => setF({ ...f, fullName: e.target.value }) })] }), _jsxs("label", { className: labelClass, children: ["E-mail", _jsx("input", { type: "email", className: inputClass, value: f.email, onChange: (e) => setF({ ...f, email: e.target.value }) })] }), _jsxs("label", { className: labelClass, children: ["Felhaszn\u00E1l\u00F3n\u00E9v", _jsx("input", { className: inputClass, value: f.username, onChange: (e) => setF({ ...f, username: e.target.value }) })] }), _jsxs("label", { className: labelClass, children: ["Jelsz\u00F3", _jsx("input", { type: "password", autoComplete: "new-password", className: inputClass, value: f.password, onChange: (e) => setF({ ...f, password: e.target.value }) })] }), _jsxs("label", { className: labelClass, children: ["Szerep", _jsxs("select", { className: "form-select mt-2", value: f.role, onChange: (e) => setF({ ...f, role: e.target.value }), children: [_jsx("option", { value: "customer", children: "\u00DCgyf\u00E9l" }), _jsx("option", { value: "admin", children: "Admin" })] })] })] }), _jsxs("div", { className: "mt-3 d-flex align-items-center gap-3", children: [_jsx("button", { type: "submit", className: "rounded-4 voyara-bg-brand px-4 voyara-py-2-5 small fw-semibold voyara-text-primary-foreground shadow-soft voyara-hover-bg-brand-deep", children: "Fi\u00F3k l\u00E9trehoz\u00E1sa" }), msg && _jsx("p", { className: `small ${msg.ok ? "voyara-text-success" : "voyara-text-destructive"}`, children: msg.text })] })] })] }));
}
