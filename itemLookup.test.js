import { afterEach, expect, test } from "bun:test";
const originalGlobals = {
    document: globalThis.document,
    fetch: globalThis.fetch,
    HTMLElement: globalThis.HTMLElement,
    HTMLProgressElement: globalThis.HTMLProgressElement,
    location: globalThis.location,
};

afterEach(() => {
    for (const [name, value] of Object.entries(originalGlobals)) {
        if (value === undefined) {
            delete globalThis[name];
        }
        else {
            globalThis[name] = value;
        }
    }
});

test("GitHub Pages loads same-origin shop snapshots", async () => {
    const requestedUrls = [];
    const pageUrl = "https://thewindmom.github.io/JFTSE-Item-Finder/";

    globalThis.HTMLElement = class HTMLElement {};
    globalThis.HTMLProgressElement = class HTMLProgressElement extends globalThis.HTMLElement {};
    globalThis.document = {
        baseURI: pageUrl,
        body: {
            addEventListener: () => {},
        },
        getElementById: () => null,
        querySelector: () => null,
    };
    globalThis.location = new URL(pageUrl);
    globalThis.fetch = (input) => {
        requestedUrls.push(String(input));
        return new Promise(() => {});
    };

    const { downloadItems } = await import("./itemLookup.ts");
    void downloadItems();

    const shopUrls = requestedUrls.filter(url => url.includes("/shop/"));
    expect(shopUrls).toHaveLength(20);
    expect(shopUrls[0]).toBe(`${pageUrl}shop/0.json`);
    expect(shopUrls.every(url => url.startsWith(`${pageUrl}shop/`))).toBeTrue();
});
