import { createFileRoute } from "@tanstack/react-router";
/**
 * Saját gépes hosztolás: a böngésző /api/... kéréseit továbbítja a helyben futó
 * FastAPI szervernek (alapértelmezés: http://127.0.0.1:8000). Így kifelé elég
 * egyetlen Ngrok alagút a weboldal portjára.
 */
async function forward({ request, params }) {
    const target = process.env["VOYARA_API_URL"] ?? "http://127.0.0.1:8000";
    const url = new URL(request.url);
    const upstream = `${target}/${params._splat ?? ""}${url.search}`;
    const headers = new Headers();
    for (const h of ["content-type", "authorization", "accept"]) {
        const v = request.headers.get(h);
        if (v)
            headers.set(h, v);
    }
    const fwd = request.headers.get("x-forwarded-for");
    headers.set("x-forwarded-for", fwd ?? "client");
    try {
        const res = await fetch(upstream, {
            method: request.method,
            headers,
            body: ["GET", "HEAD"].includes(request.method) ? null : await request.text(),
        });
        return new Response(res.status === 204 ? null : await res.text(), {
            status: res.status,
            headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
        });
    }
    catch {
        return Response.json({ detail: "A szerver nem érhető el. Fut a backend?" }, { status: 502 });
    }
}
export const Route = createFileRoute("/api/$")({
    server: {
        handlers: { GET: forward, POST: forward, PATCH: forward, DELETE: forward },
    },
});
