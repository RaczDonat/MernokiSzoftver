import { useSyncExternalStore } from "react";
import mallorca from "@/assets/trip-mallorca.jpg";
import santorini from "@/assets/trip-santorini.jpg";
import alps from "@/assets/trip-alps.jpg";
import lisbon from "@/assets/trip-lisbon.jpg";
import { isSoldOut, quotePrice } from "./pricing";
export const STOCK_IMAGES = { mallorca, santorini, alps, lisbon };

export const SERVER_MODE = import.meta.env['VITE_API_MODE'] === "server";
const TOKEN_KEY = "voyara-token";
class ApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
async function api(path, init = {}) {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    let res;
    try {
        res = await fetch(`/api${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(init.headers ?? {}),
            },
        });
    }
    catch {
        throw new ApiError(0, "A szerver nem érhető el. Fut a backend?");
    }
    if (res.status === 204)
        return undefined;
    const body = await res.json().catch(() => null);
    if (!res.ok) {
        const d = body?.detail;
        const msg = typeof d === "string"
            ? d
            : Array.isArray(d) && d[0]?.msg
                ? String(d[0].msg).replace(/^Value error, /, "")
                : "Váratlan szerverhiba.";
        throw new ApiError(res.status, msg);
    }
    return body;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const mapUser = (u) => ({
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
});
const imageFromApi = (img) => img.startsWith("stock:") ? (STOCK_IMAGES[img.slice(6)] ?? mallorca) : img;
const imageToApi = (img) => {
    const key = Object.keys(STOCK_IMAGES).find((k) => STOCK_IMAGES[k] === img);
    return key ? `stock:${key}` : img;
};
const mapTrip = (t) => ({
    id: t.id,
    destination: t.destination,
    country: t.country,
    title: t.title,
    departureDate: t.departure_date,
    durationDays: t.duration_days,
    accommodation: t.accommodation,
    basePrice: Number(t.base_price),
    maxCapacity: t.max_capacity,
    bookedSeats: t.booked_seats,
    image: imageFromApi(t.image),
    category: t.category,
    locked: t.locked,
});
const mapBooking = (b) => ({
    id: b.id,
    userId: b.user_id,
    tripId: b.trip_id,
    pricePaid: Number(b.price_paid),
    surchargeApplied: b.surcharge_applied,
    status: b.status,
    createdAt: String(b.created_at).slice(0, 10),
});
/* eslint-enable @typescript-eslint/no-explicit-any */
/** Szerver módban az összes látható adat újratöltése. */
async function refresh() {
    const trips = await api("/trips?limit=200");
    state.trips = trips.map(mapTrip);
    const me = state.users.find((u) => u.id === state.currentUserId);
    if (me) {
        state.bookings = (await api("/bookings")).map(mapBooking);
        state.users = me.role === "admin" ? (await api("/users")).map(mapUser) : [me];
    }
    else {
        state.bookings = [];
    }
    emit();
}
/** Szerver mód: hívás + újratöltés, egységes eredménnyel. */
async function run(fn, okMessage) {
    try {
        await fn();
        await refresh();
        return { ok: true, message: okMessage };
    }
    catch (e) {
        if (e instanceof ApiError && e.status === 401 && state.currentUserId !== null) {
            window.localStorage.removeItem(TOKEN_KEY);
            state.currentUserId = null;
            emit();
        }
        return { ok: false, message: e instanceof Error ? e.message : "Váratlan hiba történt." };
    }
}

export function daysFromToday(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
const initialUsers = [
    {
        id: 1,
        username: "hanna",
        fullName: "Kovács Hanna",
        email: "hanna.kovacs@example.com",
        role: "customer",
        // jelszó: hanna123
        passwordHash: "62e1e7b7dfba532cf049fec8b1aab130dbc5698a40c036f5f5636d0066f255ff",
    },
    {
        id: 2,
        username: "admin",
        fullName: "Admin",
        email: "admin@voyara.hu",
        role: "admin",
        // jelszó: admin123
        passwordHash: "4dc032890cf337cf97411a9c43f86f694c04f88098dee4cbeff6aedb86fe324f",
    },
];
const initialTrips = [
    {
        id: 1,
        destination: "Mallorca",
        country: "ES",
        title: "Mallorca Partkaland",
        departureDate: daysFromToday(24),
        durationDays: 12,
        accommodation: "Palma Beach Resort",
        basePrice: 49900,
        maxCapacity: 20,
        bookedSeats: 17,
        image: mallorca,
        category: "Tenger",
    },
    {
        id: 2,
        destination: "Santorini",
        country: "GR",
        title: "Santorini Naplemente",
        departureDate: daysFromToday(39),
        durationDays: 8,
        accommodation: "Oia Cliff Suites",
        basePrice: 64200,
        maxCapacity: 30,
        bookedSeats: 11,
        image: santorini,
        category: "Tenger",
    },
    {
        id: 3,
        destination: "Zürich",
        country: "CH",
        title: "Alpok Havas Kalandozás",
        departureDate: daysFromToday(78),
        durationDays: 6,
        accommodation: "Grindelwald Lodge",
        basePrice: 38500,
        maxCapacity: 25,
        bookedSeats: 25,
        image: alps,
        category: "Hegyvidék",
    },
    {
        id: 4,
        destination: "Lisszabon",
        country: "PT",
        title: "Lisszaboni Villamos Túra",
        departureDate: daysFromToday(122),
        durationDays: 5,
        accommodation: "Alfama Boutique House",
        basePrice: 55400,
        maxCapacity: 40,
        bookedSeats: 12,
        image: lisbon,
        category: "Európa",
    },
];
const initialBookings = [
    {
        id: 1,
        userId: 1,
        tripId: 2,
        pricePaid: 64200,
        surchargeApplied: false,
        status: "confirmed",
        createdAt: daysFromToday(-22),
    },
    {
        id: 2,
        userId: 1,
        tripId: 4,
        pricePaid: 55400,
        surchargeApplied: false,
        status: "pending",
        createdAt: daysFromToday(-13),
    },
];
const STORAGE_KEY = "voyara-demo-state-v2";
const initialState = {
    trips: initialTrips,
    bookings: initialBookings,
    users: initialUsers,
    currentUserId: null,
    hydrated: false,
};
let state = initialState;
const listeners = new Set();
function persist() {
    if (SERVER_MODE)
        return;
    if (typeof window === "undefined" || !state.hydrated)
        return;
    try {
        const { hydrated: _h, ...rest } = state;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    }
    catch {
        /* tárhely megtelt / tiltott – a demo memóriában tovább működik */
    }
}
function emit() {
    state = { ...state, trips: [...state.trips], bookings: [...state.bookings], users: [...state.users] };
    persist();
    listeners.forEach((l) => l());
}
/** Mentett állapot betöltése a böngészőből (egyszer, mount után hívandó). */
export function hydrateStore() {
    if (state.hydrated || typeof window === "undefined")
        return;
    if (SERVER_MODE) {
        void hydrateFromServer();
        return;
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            state = { ...state, ...saved };
            // Régi mentés: az alap admin neve "Admin" lett.
            state.users = state.users.map((u) => (u.fullName === "Szabó Admin" ? { ...u, fullName: "Admin" } : u));
        }
    }
    catch {
        /* sérült mentés – kezdőállapot marad */
    }
    state = { ...state, hydrated: true };
    listeners.forEach((l) => l());
}
let hydrating = false;
async function hydrateFromServer() {
    if (hydrating)
        return;
    hydrating = true;
    state = { ...state, trips: [], bookings: [], users: [], currentUserId: null };
    try {
        if (window.localStorage.getItem(TOKEN_KEY)) {
            try {
                const me = mapUser(await api("/auth/me"));
                state.users = [me];
                state.currentUserId = me.id;
            }
            catch {
                window.localStorage.removeItem(TOKEN_KEY);
            }
        }
        await refresh();
    }
    catch {
        /* a szerver nem érhető el – a belépő képernyő jelzi majd a hibát */
    }
    state = { ...state, hydrated: true };
    listeners.forEach((l) => l());
}
function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
function getSnapshot() {
    return state;
}
function getServerSnapshot() {
    return initialState;
}
export function useTravelState() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
/** Az aktuálisan bejelentkezett felhasználó, vagy null. */
export function useCurrentUser() {
    const s = useTravelState();
    return s.users.find((u) => u.id === s.currentUserId) ?? null;
}
function currentUser() {
    return state.users.find((u) => u.id === state.currentUserId) ?? null;
}
function isAdmin() {
    return currentUser()?.role === "admin";
}
export async function hashPassword(username, password) {
    const data = new TextEncoder().encode(`voyara:${username}:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
/** Bejelentkezés felhasználónév + jelszó párossal. */
export async function login(usernameRaw, password) {
    const username = usernameRaw.trim().toLowerCase();
    if (SERVER_MODE)
        return serverSignIn("/auth/login", { username, password });
    const user = state.users.find((u) => u.username === username);
    const hash = await hashPassword(username, password);
    // Egységes hibaüzenet: ne áruljuk el, hogy a név vagy a jelszó hibás.
    if (!user || user.passwordHash !== hash) {
        return { ok: false, message: "Hibás felhasználónév vagy jelszó." };
    }
    state.currentUserId = user.id;
    emit();
    return { ok: true, message: `Üdv, ${user.fullName}!` };
}
async function serverSignIn(path, body) {
    try {
        const res = await api(path, {
            method: "POST",
            body: JSON.stringify(body),
        });
        window.localStorage.setItem(TOKEN_KEY, res.access_token);
        const me = mapUser(res.user);
        state.users = [me];
        state.currentUserId = me.id;
        await refresh();
        return { ok: true, message: `Üdv, ${me.fullName}!` };
    }
    catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : "Váratlan hiba történt." };
    }
}
export function logout() {
    if (SERVER_MODE) {
        window.localStorage.removeItem(TOKEN_KEY);
        state.bookings = [];
        state.users = [];
    }
    state.currentUserId = null;
    emit();
}
/**
 * Új fiók létrehozása. Regisztrációnál mindig ügyfél jön létre és be is lép;
 * admin szerepkört csak bejelentkezett admin adhat.
 */
export async function createUser(input, opts) {
    const username = input.username.trim().toLowerCase();
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
        return { ok: false, message: "A felhasználónév 3–20 karakter: kisbetű, szám, . _ -" };
    }
    if (input.password.length < 6)
        return { ok: false, message: "A jelszó legalább 6 karakter legyen." };
    if (fullName.length < 2)
        return { ok: false, message: "Adj meg egy érvényes nevet." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { ok: false, message: "Érvénytelen e-mail cím." };
    if (SERVER_MODE) {
        const body = { username, password: input.password, full_name: fullName, email };
        if (opts.signIn)
            return serverSignIn("/auth/register", body);
        return run(() => api("/users", { method: "POST", body: JSON.stringify({ ...body, role: input.role }) }), `Fiók létrehozva: ${fullName} (@${username})`);
    }
    if (state.users.some((u) => u.username === username)) {
        return { ok: false, message: "Ez a felhasználónév már foglalt." };
    }
    if (state.users.some((u) => u.email === email)) {
        return { ok: false, message: "Ezzel az e-mail címmel már létezik fiók." };
    }
    const role = input.role === "admin" && isAdmin() ? "admin" : "customer";
    const user = {
        id: Math.max(0, ...state.users.map((u) => u.id)) + 1,
        username,
        fullName,
        email,
        role,
        passwordHash: await hashPassword(username, input.password),
    };
    state.users = [...state.users, user];
    if (opts.signIn)
        state.currentUserId = user.id;
    emit();
    return { ok: true, message: `Fiók létrehozva: ${fullName} (@${username})` };
}
/** Admin: fiók adatainak módosítása (név, felhasználónév, e-mail). */
export async function updateUser(userId, input) {
    if (!isAdmin())
        return { ok: false, message: "Ehhez admin jogosultság kell." };
    const user = state.users.find((u) => u.id === userId);
    if (!user)
        return { ok: false, message: "A fiók nem található." };
    const username = input.username.trim().toLowerCase();
    const fullName = input.fullName.trim();
    const email = input.email.trim().toLowerCase();
    const pw = input.newPassword ?? "";
    if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
        return { ok: false, message: "A felhasználónév 3–20 karakter: kisbetű, szám, . _ -" };
    }
    if (fullName.length < 2)
        return { ok: false, message: "Adj meg egy érvényes nevet." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { ok: false, message: "Érvénytelen e-mail cím." };
    if (SERVER_MODE) {
        return run(() => api(`/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({ username, full_name: fullName, email, new_password: pw || null }),
        }), `${fullName} fiókja módosítva.`);
    }
    if (state.users.some((u) => u.id !== userId && u.username === username)) {
        return { ok: false, message: "Ez a felhasználónév már foglalt." };
    }
    if (state.users.some((u) => u.id !== userId && u.email === email)) {
        return { ok: false, message: "Ezzel az e-mail címmel már létezik fiók." };
    }
    if (pw && pw.length < 6)
        return { ok: false, message: "A jelszó legalább 6 karakter legyen." };
    if (username !== user.username && !pw) {
        return { ok: false, message: "Felhasználónév-változtatáskor adj meg új jelszót is." };
    }
    const passwordHash = pw ? await hashPassword(username, pw) : user.passwordHash;
    state.users = state.users.map((u) => (u.id === userId ? { ...u, fullName, username, email, passwordHash: passwordHash ?? "" } : u));
    emit();
    return { ok: true, message: `${fullName} fiókja módosítva.` };
}
/** Admin: fiók törlése. A felhasználó aktív foglalásai felszabadítják a helyeket. */
export async function deleteUser(userId) {
    if (!isAdmin())
        return { ok: false, message: "Ehhez admin jogosultság kell." };
    if (userId === state.currentUserId)
        return { ok: false, message: "A saját fiókodat nem törölheted." };
    const user = state.users.find((u) => u.id === userId);
    if (!user)
        return { ok: false, message: "A fiók nem található." };
    if (SERVER_MODE)
        return run(() => api(`/users/${userId}`, { method: "DELETE" }), `${user.fullName} fiókja törölve.`);
    for (const b of state.bookings) {
        if (b.userId === userId && b.status !== "cancelled") {
            const trip = state.trips.find((t) => t.id === b.tripId);
            if (trip)
                trip.bookedSeats = Math.max(0, trip.bookedSeats - 1);
        }
    }
    state.bookings = state.bookings.filter((b) => b.userId !== userId);
    state.users = state.users.filter((u) => u.id !== userId);
    emit();
    return { ok: true, message: `${user.fullName} fiókja törölve.` };
}
/** Admin: új utazás feltöltése validációval. */
export async function createTrip(input) {
    if (!isAdmin())
        return { ok: false, message: "Ehhez admin jogosultság kell." };
    if (input.title.trim().length < 3)
        return { ok: false, message: "Adj meg egy címet (min. 3 karakter)." };
    if (!input.destination.trim())
        return { ok: false, message: "Add meg a célállomást." };
    if (!/^[A-Za-z]{2}$/.test(input.country.trim()))
        return { ok: false, message: "Az országkód 2 betű (pl. IT)." };
    if (!input.departureDate || input.departureDate < daysFromToday(0)) {
        return { ok: false, message: "Az indulás nem lehet múltbeli dátum." };
    }
    if (!Number.isInteger(input.durationDays) || input.durationDays < 1) {
        return { ok: false, message: "Az időtartam legalább 1 nap." };
    }
    if (!Number.isInteger(input.maxCapacity) || input.maxCapacity < 1) {
        return { ok: false, message: "A kapacitás legalább 1 fő." };
    }
    if (!(input.basePrice > 0))
        return { ok: false, message: "Az alapár legyen pozitív." };
    if (SERVER_MODE) {
        return run(() => api("/trips", {
            method: "POST",
            body: JSON.stringify({
                title: input.title.trim(),
                destination: input.destination.trim(),
                country: input.country.trim().toUpperCase(),
                departure_date: input.departureDate,
                duration_days: input.durationDays,
                accommodation: input.accommodation.trim() || "—",
                base_price: Math.round(input.basePrice),
                max_capacity: input.maxCapacity,
                image: imageToApi(input.image),
                category: input.category,
            }),
        }), `Utazás feltöltve: ${input.title.trim()}`);
    }
    const trip = {
        id: Math.max(0, ...state.trips.map((t) => t.id)) + 1,
        title: input.title.trim(),
        destination: input.destination.trim(),
        country: input.country.trim().toUpperCase(),
        departureDate: input.departureDate,
        durationDays: input.durationDays,
        accommodation: input.accommodation.trim() || "—",
        basePrice: Math.round(input.basePrice),
        maxCapacity: input.maxCapacity,
        bookedSeats: 0,
        image: input.image,
        category: input.category,
        locked: false,
    };
    state.trips = [...state.trips, trip];
    emit();
    return { ok: true, message: `Utazás feltöltve: ${trip.title}` };
}
/** Admin: utazás törlése a hozzá tartozó foglalásokkal együtt. */
export async function deleteTrip(tripId) {
    if (!isAdmin())
        return { ok: false, message: "Ehhez admin jogosultság kell." };
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip)
        return { ok: false, message: "Az utazás nem található." };
    if (SERVER_MODE)
        return run(() => api(`/trips/${tripId}`, { method: "DELETE" }), `${trip.title} törölve.`);
    state.trips = state.trips.filter((t) => t.id !== tripId);
    state.bookings = state.bookings.filter((b) => b.tripId !== tripId);
    emit();
    return { ok: true, message: `${trip.title} törölve.` };
}
/** Admin: ideiglenes zárolás / feloldás (zárolt utazásra nem lehet foglalni). */
export async function toggleTripLock(tripId) {
    if (!isAdmin())
        return;
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip)
        return;
    if (SERVER_MODE) {
        await run(() => api(`/trips/${tripId}`, { method: "PATCH", body: JSON.stringify({ locked: !trip.locked }) }), "");
        return;
    }
    trip.locked = !trip.locked;
    emit();
}
/**
 * Foglalás létrehozása – a POST /bookings végpont kliensoldali megfelelője.
 * Kapacitás-ellenőrzés és dinamikus árazás egyetlen, oszthatatlan lépésben.
 */
export async function createBooking(tripId, seats = 1) {
    const user = currentUser();
    if (!user)
        return { ok: false, message: "A foglaláshoz jelentkezz be." };
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip)
        return { ok: false, message: "A keresett utazás nem található." };
    if (trip.locked)
        return { ok: false, message: "Ez az utazás ideiglenesen zárolva van." };
    if (seats < 1)
        return { ok: false, message: "Legalább egy helyet kell foglalni." };
    if (isSoldOut(trip) || trip.bookedSeats + seats > trip.maxCapacity) {
        return { ok: false, message: "Nincs elég szabad hely ezen az utazáson." };
    }
    if (SERVER_MODE) {
        try {
            const b = mapBooking(await api("/bookings", { method: "POST", body: JSON.stringify({ trip_id: tripId, seats }) }));
            await refresh();
            return {
                ok: true,
                booking: b,
                message: b.surchargeApplied
                    ? "Foglalás rögzítve – kevés a szabad hely, ezért 15% felár érvényes."
                    : "Foglalás rögzítve alapáron.",
            };
        }
        catch (e) {
            await refresh().catch(() => undefined);
            return { ok: false, message: e instanceof Error ? e.message : "Váratlan hiba történt." };
        }
    }
    const quote = quotePrice(trip, seats);
    const booking = {
        id: Math.max(0, ...state.bookings.map((b) => b.id)) + 1,
        userId: user.id,
        tripId: trip.id,
        pricePaid: quote.finalPrice,
        surchargeApplied: quote.surchargeApplied,
        status: "confirmed",
        createdAt: daysFromToday(0),
    };
    trip.bookedSeats += seats;
    state.bookings = [booking, ...state.bookings];
    emit();
    return {
        ok: true,
        booking,
        message: quote.surchargeApplied
            ? "Foglalás rögzítve – kevés a szabad hely, ezért 15% felár érvényes."
            : "Foglalás rögzítve alapáron.",
    };
}
export async function cancelBooking(bookingId) {
    if (SERVER_MODE) {
        await run(() => api(`/bookings/${bookingId}/cancel`, { method: "POST" }), "");
        return;
    }
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === "cancelled")
        return;
    const trip = state.trips.find((t) => t.id === booking.tripId);
    if (trip)
        trip.bookedSeats = Math.max(0, trip.bookedSeats - 1);
    booking.status = "cancelled";
    emit();
}
/** Admin művelet: kapacitás módosítása (soha nem mehet a foglalt helyek alá). */
export function updateTripCapacity(tripId, maxCapacity) {
    if (!isAdmin())
        return;
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip)
        return;
    trip.maxCapacity = Math.max(trip.bookedSeats, Math.round(maxCapacity));
    emit();
    schedulePatch(tripId, { max_capacity: trip.maxCapacity });
}
/** Admin művelet: alapár módosítása. */
export function updateTripPrice(tripId, basePrice) {
    if (!isAdmin())
        return;
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip)
        return;
    trip.basePrice = Math.max(0, Math.round(basePrice));
    emit();
    schedulePatch(tripId, { base_price: trip.basePrice });
}
/** Szerver mód: gépelés közbeni módosítások összevonása, majd egyetlen PATCH. */
const pendingPatches = new Map();
function schedulePatch(tripId, body) {
    if (!SERVER_MODE)
        return;
    const prev = pendingPatches.get(tripId);
    if (prev)
        clearTimeout(prev.timer);
    const merged = { ...(prev?.body ?? {}), ...body };
    const timer = setTimeout(() => {
        pendingPatches.delete(tripId);
        if (merged['max_capacity'] !== undefined && merged['max_capacity'] < 1)
            return;
        void run(() => api(`/trips/${tripId}`, { method: "PATCH", body: JSON.stringify(merged) }), "");
    }, 600);
    pendingPatches.set(tripId, { timer, body: merged });
}
