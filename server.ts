const SHOP_API = "https://jftse.com/jftse-restservice/api/shop";
const ITEM_ART_FILE = /^[A-Za-z0-9_]+\.webp$/;

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
            "/assets/item-art-map.json": Bun.file("./assets/item-art-map.json"),
            "/assets/item-art/:file": request => {
                const file = request.params.file;
                if (!ITEM_ART_FILE.test(file)) {
                    return new Response("Not found", { status: 404 });
                }
                return new Response(Bun.file(`./assets/item-art/${file}`));
            },
        },
        fetch() {
            return new Response("Not found", { status: 404 });
        },
    });
}
