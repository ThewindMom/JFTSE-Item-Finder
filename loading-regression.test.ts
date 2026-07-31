/// <reference types="bun" />

import { expect, test } from "bun:test";

import { proxyShopRequest } from "./server";

test("local preview requests shop data through its same-origin proxy", async () => {
    const itemLookup = await Bun.file(new URL("./itemLookup.ts", import.meta.url)).text();

    expect(itemLookup).toContain('const shopURL = "/api/shop?size=1000&page="');
});

test("shop proxy does not forward the browser Origin header", async () => {
    let upstreamRequest: Request | undefined;
    const response = await proxyShopRequest(
        new Request("http://127.0.0.1:4173/api/shop?size=1000&page=3", {
            headers: { Origin: "http://127.0.0.1:4173" },
        }),
        async (request: Request) => {
            upstreamRequest = request;
            return new Response(JSON.stringify({ content: [{ productIndex: 1 }] }), {
                headers: { "Content-Type": "application/json" },
            });
        },
    );

    expect(upstreamRequest?.url).toBe(
        "https://jftse.com/jftse-restservice/api/shop?size=1000&page=3",
    );
    expect(upstreamRequest?.headers.get("Origin")).toBeNull();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ content: [{ productIndex: 1 }] });
});

test("Bun route does not pass its server argument as the proxy fetcher", async () => {
    const server = await Bun.file(new URL("./server.ts", import.meta.url)).text();

    expect(server).toContain('"/api/shop": request => proxyShopRequest(request)');
});
