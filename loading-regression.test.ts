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

test("first-load status never surfaces technical XML filenames to the user", async () => {
    const [itemLookup, html, css] = await Promise.all([
        Bun.file(new URL("./itemLookup.ts", import.meta.url)).text(),
        Bun.file(new URL("./index.html", import.meta.url)).text(),
        Bun.file(new URL("./style.css", import.meta.url)).text(),
    ]);

    // No template that paints raw fetch paths/filenames into the label.
    expect(itemLookup).not.toContain("Loading ${filename}");
    expect(itemLookup).not.toMatch(/Loading \$\{filename\}/);
    expect(itemLookup).not.toContain("please wait...");
    expect(itemLookup).toContain("loadingPhaseForUrl");
    expect(itemLookup).toContain("Opening the equipment lab");

    // Animated lab-prep shell: visual + friendly copy, no technical subtitle.
    expect(html).toContain('class="loading-state');
    expect(html).toContain("loading-state__visual");
    expect(html).toContain("loading-orb");
    expect(html).toContain('class="loading-state__detail"');
    expect(html).not.toContain("Fetching equipment, shops, gacha, and Guardian data.");
    expect(html).not.toMatch(/\.xml/i);

    expect(css).toContain(".loading-orb");
    expect(css).toContain("@keyframes loading-orb-spin");
    expect(css).toContain("prefers-reduced-motion");
});
