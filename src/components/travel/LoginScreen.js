import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { createUser, login } from "@/lib/travel/store";
const inputClass = "form-control mt-2";
/** Belépés felhasználónév + jelszó párossal, illetve új ügyfélfiók regisztrációja. */
export function LoginScreen() {
    const [mode, setMode] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const res = mode === "login"
                ? await login(username, password)
                : await createUser({ username, password, fullName, email, role: "customer" }, { signIn: true });
            if (!res.ok)
                setError(res.message);
        }
        catch {
            setError("Váratlan hiba történt, próbáld újra.");
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("main", { className: "position-relative voyara-z-10 mx-auto d-flex min-vh-100 voyara-max-w-md flex-column justify-content-center px-4 py-5", children: [_jsxs("div", { className: "mb-4 d-flex align-items-center voyara-gap-2-5", children: [_jsx("div", { className: "d-grid voyara-size-10 voyara-place-center rounded-4 voyara-bg-brand font-display fs-5 fw-semibold voyara-text-primary-foreground shadow-soft", children: "V" }), _jsx("div", { className: "font-display fs-4 fw-semibold voyara-tracking-tight", children: "Voyara" })] }), _jsxs("form", { onSubmit: submit, className: "glass-panel voyara-space-y-4 voyara-rounded-3xl p-4 shadow-glass", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display voyara-text-3xl fw-semibold voyara-tracking-tight", children: mode === "login" ? "Bejelentkezés" : "Új fiók" }), _jsx("p", { className: "mt-1 small voyara-text-ink-60", children: mode === "login"
                                    ? "Lépj be a felhasználóneveddel és jelszavaddal."
                                    : "Hozz létre ügyfélfiókot a foglaláshoz." })] }), mode === "register" && (_jsxs(_Fragment, { children: [_jsxs("label", { className: "d-block voyara-text-xs fw-medium voyara-text-ink-60", children: ["Teljes n\u00E9v", _jsx("input", { className: inputClass, value: fullName, onChange: (e) => setFullName(e.target.value) })] }), _jsxs("label", { className: "d-block voyara-text-xs fw-medium voyara-text-ink-60", children: ["E-mail c\u00EDm", _jsx("input", { type: "email", className: inputClass, value: email, onChange: (e) => setEmail(e.target.value) })] })] })), _jsxs("label", { className: "d-block voyara-text-xs fw-medium voyara-text-ink-60", children: ["Felhaszn\u00E1l\u00F3n\u00E9v", _jsx("input", { className: inputClass, autoComplete: "username", value: username, onChange: (e) => setUsername(e.target.value) })] }), _jsxs("label", { className: "d-block voyara-text-xs fw-medium voyara-text-ink-60", children: ["Jelsz\u00F3", _jsx("input", { type: "password", className: inputClass, autoComplete: mode === "login" ? "current-password" : "new-password", value: password, onChange: (e) => setPassword(e.target.value) })] }), error && _jsx("p", { className: "small voyara-text-destructive", children: error }), _jsx("button", { type: "submit", disabled: busy, className: "w-100 rounded-4 voyara-bg-brand px-4 voyara-py-2-5 small fw-semibold voyara-text-primary-foreground shadow-soft voyara-transition voyara-hover-bg-brand-deep voyara-disabled-60", children: mode === "login" ? "Belépés" : "Fiók létrehozása" }), _jsx("button", { type: "button", onClick: () => {
                            setMode(mode === "login" ? "register" : "login");
                            setError(null);
                        }, className: "w-100 text-center small fw-medium voyara-text-brand-deep voyara-hover-underline", children: mode === "login" ? "Nincs még fiókod? Regisztrálj" : "Van már fiókod? Lépj be" }), mode === "login" && (_jsxs("p", { className: "rounded-4 voyara-bg-mist px-3 py-2 voyara-text-11 voyara-text-ink-60", children: ["Demo fi\u00F3kok: ", _jsx("b", { children: "gipsz" }), " / gipsz123 (\u00FCgyf\u00E9l) \u00B7 ", _jsx("b", { children: "admin" }), " / admin123 (admin)"] }))] })] }));
}
