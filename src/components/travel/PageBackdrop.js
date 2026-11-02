import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { hydrateStore, useCurrentUser, useTravelState } from "@/lib/travel/store";
import { LoginScreen } from "./LoginScreen";
import { Navbar } from "./Navbar";
/** Közös oldalváz: háttér + navigáció. Bejelentkezés nélkül a belépő képernyőt mutatja. */
export function PageBackdrop({ children }) {
    const { hydrated } = useTravelState();
    const user = useCurrentUser();
    useEffect(() => {
        hydrateStore();
    }, []);
    return (_jsxs("div", { className: "position-relative min-vh-100 w-100 overflow-x-hidden font-sans voyara-text-ink voyara-antialiased", children: [_jsx("div", { className: "voyara-pointer-none position-absolute voyara-neg-left-24 voyara-neg-top-24 voyara-size-420 rounded-pill voyara-bg-accent-25 voyara-blur-3xl" }), _jsx("div", { className: "voyara-pointer-none position-absolute voyara-neg-right-32 voyara-top-third voyara-size-460 rounded-pill voyara-bg-brand-20 voyara-blur-3xl" }), _jsx("div", { className: "voyara-pointer-none position-absolute bottom-0 voyara-left-third voyara-size-360 rounded-pill voyara-bg-card voyara-blur-3xl" }), !hydrated ? null : user ? (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), children] })) : (_jsx(LoginScreen, {}))] }));
}
