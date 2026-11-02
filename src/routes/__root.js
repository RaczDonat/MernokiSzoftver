import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
function NotFoundComponent() {
    return (_jsx("div", { className: "d-flex min-vh-100 align-items-center justify-content-center voyara-bg-background px-4", children: _jsxs("div", { className: "voyara-max-w-md text-center", children: [_jsx("h1", { className: "voyara-text-7xl fw-bold voyara-text-foreground", children: "404" }), _jsx("h2", { className: "mt-3 voyara-text-xl fw-semibold voyara-text-foreground", children: "Page not found" }), _jsx("p", { className: "mt-2 small voyara-text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }), _jsx("div", { className: "mt-4", children: _jsx(Link, { to: "/", className: "d-inline-flex align-items-center justify-content-center rounded-2 voyara-bg-primary px-4 py-2 small fw-medium voyara-text-primary-foreground voyara-transition-colors voyara-hover-bg-primary-90", children: "Go home" }) })] }) }));
}
function ErrorComponent({ error, reset }) {
    console.error(error);
    const router = useRouter();
    useEffect(() => {
        reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }, [error]);
    return (_jsx("div", { className: "d-flex min-vh-100 align-items-center justify-content-center voyara-bg-background px-4", children: _jsxs("div", { className: "voyara-max-w-md text-center", children: [_jsx("h1", { className: "voyara-text-xl fw-semibold voyara-tracking-tight voyara-text-foreground", children: "This page didn't load" }), _jsx("p", { className: "mt-2 small voyara-text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }), _jsxs("div", { className: "mt-4 d-flex flex-wrap justify-content-center gap-2", children: [_jsx("button", { onClick: () => {
                                router.invalidate();
                                reset();
                            }, className: "d-inline-flex align-items-center justify-content-center rounded-2 voyara-bg-primary px-4 py-2 small fw-medium voyara-text-primary-foreground voyara-transition-colors voyara-hover-bg-primary-90", children: "Try again" }), _jsx("a", { href: "/", className: "d-inline-flex align-items-center justify-content-center rounded-2 border voyara-border-input voyara-bg-background px-4 py-2 small fw-medium voyara-text-foreground voyara-transition-colors voyara-hover-bg-accent", children: "Go home" })] })] }) }));
}
export const Route = createRootRouteWithContext()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Voyara Travel" },
            {
                name: "description",
                content: "Utazáskezelő rendszer dinamikus árazással és kapacitáskezeléssel.",
            },
            { name: "author", content: "Voyara" },
            { property: "og:title", content: "Voyara Travel" },
            {
                property: "og:description",
                content: "Utazáskezelő rendszer dinamikus árazással és kapacitáskezeléssel.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:site", content: "@Lovable" },
        ],
        links: [
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
            },
            {
                rel: "stylesheet",
                href: appCss,
            },
            { rel: "icon", href: "/favicon.ico?v=2", type: "image/x-icon" },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});
function RootShell({ children }) {
    return (_jsxs("html", { lang: "en", children: [_jsx("head", { children: _jsx(HeadContent, {}) }), _jsxs("body", { children: [children, _jsx(Scripts, {})] })] }));
}
function RootComponent() {
    const { queryClient } = Route.useRouteContext();
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(Outlet, {}) }));
}
