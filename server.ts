const SHOP_API = "https://jftse.com/jftse-restservice/api/shop";

export async function proxyShopRequest(
    request: Request,
    fetcher: (request: Request) => Promise<Response> = fetch,
) {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(SHOP_API);
    upstreamUrl.search = incomingUrl.search;

    const upstreamRequest = new Request(upstreamUrl, {
        headers: { Accept: "application/json" },
    });
    const upstreamResponse = await fetcher(upstreamRequest);

    return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
            "Content-Type": upstreamResponse.headers.get("Content-Type") ?? "application/json",
        },
    });
}

if (import.meta.main) {
    Bun.serve({
        port: Number(Bun.env.PORT ?? 4173),
        routes: {
            "/": Bun.file("./index.html"),
            "/api/shop": request => proxyShopRequest(request),
            "/favicon.ico": Bun.file("./favicon.ico"),
            "/script.js": Bun.file("./script.js"),
            "/style.css": Bun.file("./style.css"),
        },
        fetch() {
            return new Response("Not found", { status: 404 });
        },
    });
}
