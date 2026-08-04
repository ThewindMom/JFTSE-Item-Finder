/// <reference types="bun" />

import { afterEach, expect, test } from "bun:test";

import { catalogFixture } from "./test-support/catalog-fixture";
import { installDomWindowHarness } from "./test-support/dom-window-harness";

const CATALOG_URL = "assets/catalog.json";

let restoreDom: (() => void) | undefined;
const originalFetch = globalThis.fetch;

function installCatalogDom(): () => void {
    const restoreBase = installDomWindowHarness();
    const previousProgressElement = globalThis.HTMLProgressElement;
    const previousLocation = globalThis.location;
    Object.defineProperty(globalThis, "HTMLProgressElement", {
        configurable: true,
        value: globalThis.HTMLElement,
        writable: true,
    });
    Object.defineProperty(globalThis, "location", {
        configurable: true,
        value: { hostname: "localhost" },
        writable: true,
    });
    Object.defineProperty(globalThis.document, "querySelector", {
        configurable: true,
        value: () => null,
        writable: true,
    });
    return () => {
        if (previousProgressElement) {
            Object.defineProperty(globalThis, "HTMLProgressElement", {
                configurable: true,
                value: previousProgressElement,
                writable: true,
            });
        }
        else {
            Reflect.deleteProperty(globalThis, "HTMLProgressElement");
        }
        if (previousLocation) {
            Object.defineProperty(globalThis, "location", {
                configurable: true,
                value: previousLocation,
                writable: true,
            });
        }
        else {
            Reflect.deleteProperty(globalThis, "location");
        }
        restoreBase();
    };
}

function installFetch(
    handler: (input: RequestInfo | URL) => Promise<Response>,
): void {
    globalThis.fetch = Object.assign(handler, {
        preconnect: originalFetch.preconnect,
    });
}

function blankCurrentRuntimeResponse(url: string): Response {
    if (url.includes("Item_Parts_Ini3.xml")) {
        return new Response("<Items></Items>");
    }
    if (url.includes("/api/shop") || url.includes("/shop/")) {
        return Response.json([]);
    }
    if (url.includes("GuardianStages.json")) {
        return Response.json([]);
    }
    if (url.includes("item-art-map.json")) {
        return Response.json({ items: {}, lotteries: {}, sheets: {} });
    }
    if (url.includes("map-art-map.json")) {
        return Response.json({ files: {}, byName: {} });
    }
    if (url.includes("stage-bosses.json")) {
        return Response.json({ bosses: {}, guardians: {}, stages: {} });
    }
    if (url.includes("shop-nobuy-indexes.json")) {
        return Response.json({ productIndexes: [] });
    }
    if (url.includes("product-stage-drops.json")) {
        return Response.json({ products: {} });
    }
    return Response.json({});
}

afterEach(async () => {
    globalThis.fetch = originalFetch;
    const { gachas, items, shop_items } = await import("./itemLookup");
    items.clear();
    shop_items.clear();
    gachas.clear();
    restoreDom?.();
    restoreDom = undefined;
});

test("downloadItems hydrates the canonical source graph from one catalog request", async () => {
    restoreDom = installCatalogDom();
    const requests: string[] = [];
    installFetch(async (input) => {
        const url = String(input);
        requests.push(url);
        if (url.endsWith(CATALOG_URL)) {
            return Response.json(catalogFixture);
        }
        return blankCurrentRuntimeResponse(url);
    });

    const itemLookup = await import("./itemLookup");
    const {
        downloadItems,
        GachaItemSource,
        GuardianItemSource,
        ShopItemSource,
    } = itemLookup;

    await downloadItems();

    expect(requests).toEqual([CATALOG_URL]);
    const item = itemLookup.items.get(1);
    expect(item?.name_en).toBe("Test Hat");
    expect(itemLookup.shop_items.get(100)).toBe(item);
    expect(item?.sources.some(source =>
        source instanceof ShopItemSource
        && source.price === 900
        && source.items[0] === item
    )).toBeTrue();
    expect(item?.sources.filter(source =>
        source instanceof ShopItemSource
    )).toHaveLength(1);
    expect(itemLookup.shop_items.get(200)?.sources.some(source =>
        source instanceof ShopItemSource
        && source.items[0] === item
    )).toBeTrue();
    expect(item?.sources.some(source =>
        source instanceof GachaItemSource
        && source.item === itemLookup.shop_items.get(200)
    )).toBeTrue();
    expect(item?.sources.some(source =>
        source instanceof GuardianItemSource
        && source.guardian_map === "Test Arena"
        && source.items[0] === item
    )).toBeTrue();
    expect(itemLookup.gachas.get(200)?.average_tries(item!, "Niki")).toBe(1);
});

test("malformed catalog rejects before replacing installed maps", async () => {
    restoreDom = installCatalogDom();
    const itemLookup = await import("./itemLookup");
    const { downloadItems, Item } = itemLookup;
    const sentinel = new Item();
    sentinel.id = 999;
    sentinel.name_en = "Installed sentinel";
    itemLookup.items.set(sentinel.id, sentinel);

    const wrongVersion = structuredClone(catalogFixture);
    wrongVersion.schemaVersion = 99;
    const duplicateItem = structuredClone(catalogFixture);
    duplicateItem.items.push(structuredClone(duplicateItem.items[0]));
    const danglingProductItem = structuredClone(catalogFixture);
    danglingProductItem.products[0].itemIds = [404];
    const invalidQuantity = structuredClone(catalogFixture);
    invalidQuantity.gachas[0].drops[0].quantityMin = 2;
    invalidQuantity.gachas[0].drops[0].quantityMax = 1;

    for (const malformed of [
        wrongVersion,
        duplicateItem,
        danglingProductItem,
        invalidQuantity,
    ]) {
        installFetch(async (input) => {
            const url = String(input);
            if (url.endsWith(CATALOG_URL)) {
                return Response.json(malformed);
            }
            return blankCurrentRuntimeResponse(url);
        });
        await expect(downloadItems()).rejects.toThrow("Invalid catalog");
        expect(itemLookup.items.get(999)).toBe(sentinel);
        expect(itemLookup.items.size).toBe(1);
    }
});

test("generated catalog retains a production-scale item and source graph", async () => {
    const file = Bun.file(new URL("./assets/catalog.json", import.meta.url));
    const exists = await file.exists();
    expect(exists).toBeTrue();
    if (!exists) {
        return;
    }

    const catalog = await file.json() as typeof catalogFixture;
    expect(catalog.schemaVersion).toBe(1);
    expect(catalog.items).toHaveLength(7_836);
    expect(catalog.products).toHaveLength(9_040);
    expect(catalog.gachas).toHaveLength(107);
    expect(catalog.stageSources).toHaveLength(45);
});
