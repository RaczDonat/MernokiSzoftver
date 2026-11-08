import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { logout, useCurrentUser } from "@/lib/travel/store";
const initialsOf = (name) => name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
/** Bejelentkezett felhasználó adatai és kijelentkezés. */
export function AccountMenu() {
    const user = useCurrentUser();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);
    if (!user)
        return null;
    return (_jsxs("div", { ref: ref, className: "position-relative", children: [_jsxs("button", { type: "button", onClick: () => setOpen((o) => !o), className: "glass-panel d-flex align-items-center voyara-gap-2-5 rounded-4 voyara-p-1-5 voyara-pr-sm-3 voyara-transition voyara-hover-bg-card", children: [_jsx("div", { className: "d-grid voyara-size-8 voyara-place-center rounded-3 voyara-bg-mist voyara-text-xs fw-bold voyara-text-brand-deep", children: initialsOf(user.fullName) }), _jsxs("div", { className: "d-none text-start voyara-leading-tight d-sm-block", children: [_jsx("div", { className: "voyara-text-xs fw-semibold", children: user.fullName }), _jsx("div", { className: "voyara-text-10 text-capitalize voyara-text-ink-50", children: user.role })] })] }), open && (_jsxs("div", { className: "position-absolute end-0 voyara-top-full voyara-z-50 mt-2 voyara-menu-width voyara-rounded-2xl border voyara-border voyara-bg-card p-3 shadow-glass", children: [_jsx("div", { className: "px-1 small fw-semibold", children: user.fullName }), _jsxs("div", { className: "px-1 voyara-text-xs voyara-text-ink-50", children: ["@", user.username, " \u00B7 ", user.email] }), _jsx("button", { type: "button", onClick: () => logout(), className: "mt-3 w-100 rounded-4 border voyara-border px-3 py-2 small fw-medium voyara-transition voyara-hover-bg-mist", children: "Kijelentkez\u00E9s" })] }))] }));
}
